# The 3D figure (Mohit, 29 Oct: "B. 3D made here, free", then "improve 3d Model also with facial features"): builds the
# woman who shows the moves from MPFB's free MakeHuman base and its CC0 asset packs, and saves her to a .blend.
# Run: ~/Applications/Blender.app/Contents/MacOS/Blender -b --python web/tools/fig3d/char.py -- <out.blend>
import os
import sys
import bpy
import bmesh
from bl_ext.user_default.mpfb.services.humanservice import HumanService
from bl_ext.user_default.mpfb.services.faceservice import FaceService

out = sys.argv[sys.argv.index('--') + 1]
bpy.ops.object.select_all(action='SELECT'); bpy.ops.object.delete()

# her face: a soft oval, slightly larger eyes, fuller lips, a natural nose width; small steps, never a caricature
FACE = {
    'head-oval': 0.6, 'l-cheek-volume-incr': 0.15, 'r-cheek-volume-incr': 0.15, 'chin-width-decr': 0.3,
    'chin-prominent-decr': 0.2, 'chin-bones-decr': 0.2,
    'l-eye-scale-incr': 0.18, 'r-eye-scale-incr': 0.18, 'l-eye-height2-incr': 0.15, 'r-eye-height2-incr': 0.15,
    'nose-nostrils-width-incr': 0.22, 'nose-point-width-incr': 0.15, 'nose-volume-incr': 0.08,
    'mouth-lowerlip-volume-incr': 0.3, 'mouth-upperlip-volume-incr': 0.22, 'mouth-scale-horiz-incr': 0.05,
}
human = {
    'name': 'sakhi',
    # a woman in her mid twenties, of average build
    'phenotype': { 'gender': 0.0, 'age': 0.5, 'muscle': 0.5, 'weight': 0.55, 'proportions': 0.6, 'height': 0.42, 'cupsize': 0.45,
                   'firmness': 0.5, 'race': { 'asian': 0.45, 'african': 0.35, 'caucasian': 0.2 } },
    'targets': [{ 'target': k, 'value': v } for k, v in FACE.items()],
    'rig': 'default',
    'eyes': 'high-poly.mhclo', 'eyebrows': 'eyebrow002.mhclo', 'eyelashes': 'eyelashes02.mhclo',
    'hair': os.environ.get('FIG_HAIR', 'rehmanpolanski_hair_bun_brown') + '.mhclo',
    # a plain t-shirt over the sports suit's leggings (its short top is cut away below), so her knees and hips show
    'clothes': os.environ.get('FIG_CLOTHES', 'female_sportsuit01.mhclo,joepal_crude_t-shirt_female.mhclo').split(','),
    'skin_mhmat': os.environ.get('FIG_SKIN', 'young_african_female') + '.mhmat', 'skin_material_type': 'ENHANCED_SSS',
    'eyes_material_type': 'MAKESKIN',
    'clothes_material_type': 'MAKESKIN',
    'proxy': None, 'teeth': None, 'tongue': None, 'alternative_materials': {}, 'expressions': None,
}
settings = HumanService.get_default_deserialization_settings()
base = HumanService.deserialize_from_dict(human, settings)

# a gentle, closed-mouth smile that reaches the eyes a little (ARKit face units from the CC0 faceunits01 pack)
SMILE = float(os.environ.get('FIG_SMILE', '0.6'))
FaceService.set_expression(base, { 'mouthSmileLeft': SMILE, 'mouthSmileRight': SMILE, 'cheekSquintLeft': SMILE * 0.4,
                                   'cheekSquintRight': SMILE * 0.4, 'eyeSquintLeft': SMILE * 0.15, 'eyeSquintRight': SMILE * 0.15,
                                   'mouthDimpleLeft': SMILE * 0.15, 'mouthDimpleRight': SMILE * 0.15 })
# closed eyes for Shavasana and the calm sitting (loaded now, shut by the pose)
FaceService.set_expression(base, { 'eyeBlinkLeft': 0.01, 'eyeBlinkRight': 0.01 })
for kb in base.data.shape_keys.key_blocks:
    if kb.name in ('!ex-eyeBlinkLeft', '!ex-eyeBlinkRight'):
        kb.value = 0.0

# a warmer, browner skin than MakeHuman's textures give
sk = bpy.data.materials['sakhi.body'].node_tree.nodes['sakhi.body']
sk.inputs['colorMixIn'].default_value = (0.45, 0.24, 0.13, 1); sk.inputs['colorMixInStrength'].default_value = float(os.environ.get('FIG_MIX', '0.2'))
sk.inputs['Brightness'].default_value = float(os.environ.get('FIG_BRIGHT', '0.0'))


def tint(mat_name, rgb, sat=1.0):
    """Multiplies a material's texture by a colour; sat below 1 first takes the texture's own colour out (red in the hair)."""
    mat = bpy.data.materials.get(mat_name)
    bsdf = mat.node_tree.nodes.get('Principled BSDF') if mat else None
    if not bsdf:
        print('NOTINT', mat_name); return
    nt = mat.node_tree
    src = bsdf.inputs['Base Color'].links[0].from_socket if bsdf.inputs['Base Color'].links else None
    if src and sat < 1.0:
        hsv = nt.nodes.new('ShaderNodeHueSaturation'); hsv.inputs['Saturation'].default_value = sat
        nt.links.new(src, hsv.inputs['Color']); src = hsv.outputs['Color']
    mix = nt.nodes.new('ShaderNodeMixRGB'); mix.blend_type = 'MULTIPLY'; mix.inputs['Fac'].default_value = 1.0
    mix.inputs['Color2'].default_value = (*rgb, 1)
    if src: nt.links.new(src, mix.inputs['Color1'])
    nt.links.new(mix.outputs['Color'], bsdf.inputs['Base Color'])


suit = bpy.data.objects.get('sakhi.female_sportsuit01')
if suit:
    bm = bmesh.new(); bm.from_mesh(suit.data)
    mw = suit.matrix_world
    bmesh.ops.delete(bm, geom=[v for v in bm.verts if (mw @ v.co).z > float(os.environ.get('FIG_WAIST', '0.99'))], context='VERTS')
    bm.to_mesh(suit.data); bm.free()

hair = [o for o in bpy.data.objects if o.name.startswith('sakhi.') and any(w in o.name for w in ('hair', 'bun', 'braid', 'ponytail'))]
for o in hair:
    for s in o.material_slots:
        tint(s.material.name, (0.11, 0.08, 0.07), sat=0.15)   # near-black hair
tint('sakhi.eyebrow002', (0.08, 0.06, 0.05), sat=0.3)

tint('sakhi.joepal_crude_t-shirt_female', (0.93, 0.52, 0.62))   # a soft rose, near Sakhi's own

# dark brown eyes, drawn on the eyeball's own shape: its front cap is the iris and pupil, the rest an off-white sclera.
# Each eye is a clear cornea (front, 0 to 0.11 of the depth, kept see-through by the texture's alpha) over the eyeball;
# generated coordinates follow the mesh as built, so the iris stays put however she moves.
IRIS, PUPIL = float(os.environ.get('FIG_IRIS', '0.168')), float(os.environ.get('FIG_PUPIL', '0.122'))
eyes = bpy.data.objects.get('sakhi.high-poly')
if eyes:
    for sl in eyes.material_slots:
        nt = sl.material.node_tree; nodes = nt.nodes
        bsdf = nodes.get('Principled BSDF')
        if not bsdf:
            continue
        tc = nodes.new('ShaderNodeTexCoord'); sep = nodes.new('ShaderNodeSeparateXYZ'); nt.links.new(tc.outputs['Generated'], sep.inputs[0])
        def ramp(edge, soft):
            mr = nodes.new('ShaderNodeMapRange'); mr.inputs['From Min'].default_value = edge - soft; mr.inputs['From Max'].default_value = edge + soft
            mr.inputs['To Min'].default_value = 1.0; mr.inputs['To Max'].default_value = 0.0; nt.links.new(sep.outputs['Y'], mr.inputs['Value'])
            return mr.outputs['Result']
        iris_m, pupil_m = ramp(IRIS, 0.008), ramp(PUPIL, 0.004)
        noise = nodes.new('ShaderNodeTexNoise'); noise.inputs['Scale'].default_value = 140.0; nt.links.new(tc.outputs['Generated'], noise.inputs['Vector'])
        iris_c = nodes.new('ShaderNodeMixRGB'); iris_c.inputs['Color1'].default_value = (0.025, 0.013, 0.008, 1); iris_c.inputs['Color2'].default_value = (0.085, 0.045, 0.022, 1)
        nt.links.new(noise.outputs['Fac'], iris_c.inputs['Fac'])
        m1 = nodes.new('ShaderNodeMixRGB'); m1.inputs['Color1'].default_value = (0.86, 0.83, 0.79, 1)
        nt.links.new(iris_m, m1.inputs['Fac']); nt.links.new(iris_c.outputs['Color'], m1.inputs['Color2'])
        m2 = nodes.new('ShaderNodeMixRGB'); m2.inputs['Color2'].default_value = (0.01, 0.008, 0.007, 1)
        nt.links.new(pupil_m, m2.inputs['Fac']); nt.links.new(m1.outputs['Color'], m2.inputs['Color1'])
        nt.links.new(m2.outputs['Color'], bsdf.inputs['Base Color'])
        bsdf.inputs['Roughness'].default_value = 0.08
        print('EYES', sl.material.name)
print('BUILT', base.name, [o.name for o in bpy.data.objects])
bpy.ops.wm.save_as_mainfile(filepath=out)
