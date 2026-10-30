# Portraits of the woman as built, to check her face: Blender -b <sakhi.blend> --python look.py -- <out.png>
# Renders <out>-0.png (from the front) and <out>-1.png (three-quarters).
import os, sys
import bpy
from mathutils import Vector
sys.dont_write_bytecode = True   # no __pycache__ beside the scripts
sys.path.insert(0, os.path.dirname(__file__))
import stage

out = sys.argv[sys.argv.index('--') + 1:][0]
sc = bpy.context.scene
stage.setup((640, 640), 'front', 64)
head = Vector((0, -0.07, 1.47))
for i, loc in enumerate(((0, -1.05, 1.49), (0.55, -0.88, 1.5))):
    bpy.ops.object.camera_add(location=loc); cam = bpy.context.object; cam.data.lens = 85
    cam.rotation_euler = (head - cam.location).to_track_quat('-Z', 'Y').to_euler(); sc.camera = cam
    sc.render.filepath = out.replace('.png', '-%d.png' % i)
    bpy.ops.render.render(write_still=True)
print('RENDERED', out)
