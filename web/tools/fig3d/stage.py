# The stage every move is filmed on: a curved backdrop with no horizon line, soft lights placed from the camera's side,
# props (chair, wall, step, yoga mat) and a camera that frames the whole move. Imported inside Blender.
import math
import bpy
from mathutils import Vector

BG = (0.965, 0.95, 0.935)


def engine():
    ids = [e.identifier for e in bpy.types.RenderSettings.bl_rna.properties['engine'].enum_items]
    return 'BLENDER_EEVEE_NEXT' if 'BLENDER_EEVEE_NEXT' in ids else 'BLENDER_EEVEE'


def mat(name, rgb, rough=0.7):
    m = bpy.data.materials.get(name)
    if m:
        return m
    m = bpy.data.materials.new(name); m.use_nodes = True
    p = m.node_tree.nodes['Principled BSDF']; p.inputs['Base Color'].default_value = (*rgb, 1); p.inputs['Roughness'].default_value = rough
    return m


def cyclorama(view):
    """A floor that curves up into a wall behind her as the camera sees her."""
    import bmesh
    prof = [(-9.0, 0.0), (1.7, 0.0)] + [(1.7 + 1.5 * math.sin(math.radians(a)), 1.5 - 1.5 * math.cos(math.radians(a))) for a in range(10, 91, 10)] + [(3.2, 9.0)]
    bm = bmesh.new(); rows = []
    for w in (-9.0, 9.0):
        rows.append([bm.verts.new((w, d, z)) for d, z in prof])
    for i in range(len(prof) - 1):
        bm.faces.new((rows[0][i], rows[0][i + 1], rows[1][i + 1], rows[1][i]))
    me = bpy.data.meshes.new('cyc'); bm.to_mesh(me); bm.free()
    for poly in me.polygons:
        poly.use_smooth = True
    ob = bpy.data.objects.new('floor', me); bpy.context.scene.collection.objects.link(ob); ob.data.materials.append(mat('floor', BG, 0.9))
    # the camera looks from -Y (front view) or -X (side view); the wall stands on the far side
    ob.rotation_euler = (0, 0, 0) if view == 'front' else (0, 0, math.radians(-90))
    return ob


def setup(size=(720, 600), view='side', samples=48):
    sc = bpy.context.scene
    sc.render.engine = engine()
    sc.render.resolution_x, sc.render.resolution_y = size; sc.render.resolution_percentage = 100
    sc.render.film_transparent = False
    sc.view_settings.view_transform = 'AgX'; sc.view_settings.look = 'AgX - Medium High Contrast'; sc.view_settings.exposure = 0.25
    try:
        sc.eevee.taa_render_samples = samples; sc.eevee.use_shadows = True; sc.eevee.use_raytracing = True
    except AttributeError:
        pass
    w = sc.world or bpy.data.worlds.new('World'); sc.world = w; w.use_nodes = True
    bgn = w.node_tree.nodes['Background']; bgn.inputs[0].default_value = (*BG, 1); bgn.inputs[1].default_value = 0.7
    cyclorama(view)
    c = Vector((0, -1, 0)) if view == 'front' else Vector((-1, 0, 0))     # towards the camera
    r = Vector((1, 0, 0)) if view == 'front' else Vector((0, -1, 0))      # the camera's right
    def area(name, loc, energy, size):
        bpy.ops.object.light_add(type='AREA', location=loc); L = bpy.context.object; L.name = name
        L.data.energy = energy; L.data.size = size
        L.rotation_euler = (Vector((0, 0, 0.8)) - L.location).to_track_quat('-Z', 'Y').to_euler()
        return L
    area('key', c * 2.6 + r * 2.4 + Vector((0, 0, 3.0)), 620, 3)
    area('fill', c * 2.8 - r * 2.6 + Vector((0, 0, 1.8)), 230, 4)


def prop(kind, **o):
    """Chair (behind her), a wall or the calf wall (in front), a step (in front) or a yoga mat (under her)."""
    made = []
    def box(loc, dim, m):
        bpy.ops.mesh.primitive_cube_add(location=loc); b = bpy.context.object; b.dimensions = dim; b.data.materials.append(m)
        bpy.ops.object.transform_apply(scale=True); made.append(b); return b
    if kind == 'chair':
        wood = mat('wood', (0.42, 0.26, 0.15), 0.6)
        box((0, 0.31, 0.435), (0.46, 0.42, 0.04), wood); box((0, 0.53, 0.75), (0.46, 0.03, 0.6), wood)
        for x in (-0.2, 0.2):
            for y in (0.12, 0.5):
                box((x, y, 0.21), (0.035, 0.035, 0.42), wood)
    elif kind in ('wall', 'calfwall'):
        y = o['y']; box((0, y - 0.06, 1.0), (1.6, 0.12, 2.0), mat('wall', (0.86, 0.82, 0.76), 0.85))
    elif kind == 'step':
        f, h = o['front'], o['h']; box((0, f - 0.2, h / 2), (0.9, 0.4, h), mat('stepwood', (0.55, 0.36, 0.22), 0.6))
    elif kind == 'mat':
        (x0, y0), (x1, y1) = o['lo'], o['hi']
        cx, cy = (x0 + x1) / 2, (y0 + y1) / 2; w = max(0.62, x1 - x0 + 0.24); l = max(1.8, y1 - y0 + 0.3)
        box((cx, cy, 0.003), (w, l, 0.006), mat('yogamat', (0.5, 0.2, 0.3), 0.85))
    return made


def frame(view, lo, hi, lens=70, margin=1.14, tilt=5.0):
    """A camera that fits the box lo..hi (the whole move) in a 6:5 frame, a little above her eye line."""
    sc = bpy.context.scene
    bpy.ops.object.camera_add(); cam = bpy.context.object; cam.name = 'cam'; cam.data.lens = lens; cam.data.sensor_fit = 'HORIZONTAL'
    c = (lo + hi) / 2
    w = (hi.x - lo.x) if view == 'front' else (hi.y - lo.y); h = hi.z - lo.z
    depth = (hi.y - lo.y) if view == 'front' else (hi.x - lo.x)
    aspect = sc.render.resolution_x / sc.render.resolution_y
    fh = 2 * math.atan(18.0 / lens); fv = 2 * math.atan(math.tan(fh / 2) / aspect)
    dist = max(w * margin / 2 / math.tan(fh / 2), h * margin / 2 / math.tan(fv / 2)) + depth / 2
    back = Vector((0, -1, 0)) if view == 'front' else Vector((-1, 0, 0))
    cam.location = c + back * dist + Vector((0, 0, dist * math.tan(math.radians(tilt))))
    cam.rotation_euler = (c - cam.location).to_track_quat('-Z', 'Y').to_euler()
    sc.camera = cam
    return cam
