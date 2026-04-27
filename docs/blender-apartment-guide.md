# Apartment room in Blender — step-by-step

Goal: build "The Apartment" as a real 3D scene, lock a camera, and render
PNGs for the game. One master per room, one render per state variant
(cabinet open, door open, laptop unlocked, etc.). Identity across states is
perfect by construction — only the mesh that changed moves.

Final outputs (drop into `assets/rooms/apartment/ai/`):
- `background.png` (1024×768) — default state
- `state-cabinet-open.png`
- `state-door-open.png`
- `state-laptop-unlocked.png`
- per-item close-ups for inventory/zoom views

---

## 1. Install Blender

- Download: https://www.blender.org/download/ (use the current LTS, e.g. 4.2)
- Default install. Launch it. Skip the splash, save the startup as empty:
  File → New → General, then File → Defaults → Save Startup File.

Learning curve: the only hard skill you need for this room is **navigating
the viewport**. Middle-mouse drag to orbit, shift+MMB to pan, scroll to
zoom. Numpad 1/3/7 snap to front/side/top views. Numpad 5 toggles
orthographic/perspective. That's 90% of it.

---

## 2. Grab free assets

Download these once into a folder (e.g. `F:\Blender\assets\apartment\`):

**HDRI (lighting)** — Poly Haven, all CC0:
- https://polyhaven.com/a/studio_small_09 (warm indoor, soft)
- https://polyhaven.com/a/venice_sunset (golden hour, strong directional)
  Pick ONE and download 2k EXR.

**Furniture / props** — any CC0 source. Fastest route:
- https://polyhaven.com/models (search "chair", "desk", "cabinet", "plant")
- https://www.blenderkit.com (free tier, filter by "Free"; in-Blender addon)
- https://sketchfab.com/3d-models?features=downloadable&licenses=322a749bcfa841b29dff1e8a1bb74b0b (CC0 filter)

Shopping list (if a specific asset doesn't exist, substitute anything close):
- [ ] Wooden interior door with frame
- [ ] Tall wooden storage cabinet (4-door or 2-door OK)
- [ ] Wooden writing desk
- [ ] Office swivel chair
- [ ] Closed laptop
- [ ] Potted plant (leafy)
- [ ] Low bookshelf with books
- [ ] Rectangular rug
- [ ] 2× framed wall art
- [ ] Small black keycard reader (or model a 5cm black box — 30 seconds)

Download formats in priority order: `.blend` > `.glb` > `.fbx` > `.obj`.

---

## 3. Build the room shell

Open Blender. Delete the default cube (X, confirm).

**Floor:** Shift+A → Mesh → Plane. Press `S` and type `4` (scale ×4). That's
a 4m×4m floor.

**Walls:** Shift+A → Mesh → Plane. Press `R X 90` to rotate vertical. Press
`G Y -2` to move it to the back edge, `S Z 1.3` to make it 1.3m tall, `S X
4` wide. That's the back wall.

Duplicate (Shift+D) twice for the side walls; rotate and position:
- Left wall: rotate Y 90°, move to X = -2
- Right wall: rotate Y 90°, move to X = +2

**Ceiling:** duplicate the floor, move up Z = 2.6.

Select all walls + floor + ceiling, Ctrl+J to join into one "Room" object
(optional, keeps the outliner tidy).

**Material:** with the room selected, go to the Material tab (red ball
icon), New, call it "Walls", set Base Color to something like `#EDE4D6`
(warm off-white). Floor can be a separate material — select the floor face
in Edit Mode (Tab), press P → Selection to split it out, then add a wood
material (Principled BSDF + a wood texture or just a warm brown color with
roughness 0.6).

---

## 4. Import & place assets

For each downloaded asset:

- `.blend`: File → Append → find the .blend → Object → pick the object
- `.glb/.fbx/.obj`: File → Import → pick the format

After import, the object is usually at the origin. To position:
- `G` = grab (move), then `X`/`Y`/`Z` to constrain axis, type a number for
  distance in meters.
- `R` = rotate, same axis-key convention.
- `S` = scale. If the object is 200× too big (common), `S` then type `0.01`.

Recommended placement (matching the 2D game layout, camera looks along -Y):
- Back wall Y = -2, rug center ~(0, 0), desk left at X ≈ -1.5
- Door on back wall near X ≈ +0.3, cabinet right of door at X ≈ +1.3
- Bookshelf on left back wall around X ≈ -1.2, Z ≈ 1.0
- Paintings hung on back wall Z ≈ 1.6
- Plant near desk or corner
- Laptop on top of desk (parent it so they move together)

Rule of thumb: human eye height ≈ Z = 1.65m. Door height ≈ 2.0m. Cabinet
height ≈ 1.8m. Desk height ≈ 0.75m.

---

## 5. Lighting

1. Open the **World** properties (globe icon).
2. Surface → click the little yellow dot next to Color → **Environment Texture**.
3. Click Open, pick your downloaded HDRI .exr.
4. Viewport shading: top-right of 3D view, click the rightmost sphere icon
   (Rendered mode). The room should now be lit by the HDRI.

For a stronger directional "evening sun" feel, add a Sun light:
- Shift+A → Light → Sun. Rotate so it points down-left from outside the
  right wall (e.g. rotation X=60°, Y=-30°, Z=-45°). Strength ~3.

---

## 6. Camera

Delete the default camera (if any). Shift+A → Camera.

- Select the camera. Press `N` for the properties panel. In the Item tab:
  - Location: X=0, Y=3.0, Z=1.5  (in front of the room, eye level)
  - Rotation: X=90°, Y=0, Z=180°  (looking along -Y at the back wall)
- Camera tab (green camera icon in properties): Focal Length 35mm for a
  wider view, 50mm for natural. Sensor Width 36.
- Press Numpad 0 to look through the camera. Nudge until framing matches
  the game's 2D layout (desk on left, door center-right, cabinet far right).

---

## 7. Render settings

Render properties (back-of-camera icon):
- Render Engine: **Cycles** (best quality; **Eevee** if you want ~10× faster
  previews, slightly less realistic light)
- If Cycles: Device = **GPU Compute**, Samples = 128 (preview) or 512 (final)
- Output Properties (printer icon): Resolution X=1024, Y=768, %=100
- Output folder: `//renders/` (relative to the .blend file, keeps it tidy)
- File Format: PNG, RGBA if you want transparency (not needed for background)

Render the image: F12. Save: F3, pick `scene-master.png`, put it in
`assets/rooms/apartment/ai/`.

---

## 8. State variants via Python

Once the scene is dialed in, state renders are 10 seconds each. Open the
**Scripting** workspace tab. Paste + run:

```python
import bpy
from pathlib import Path

# Hard-code the objects we want to manipulate. The names must match the
# Outliner names in your scene. Rename for safety.
OUT = Path(bpy.path.abspath("//renders"))
OUT.mkdir(exist_ok=True)

def render(name):
    bpy.context.scene.render.filepath = str(OUT / f"{name}.png")
    bpy.ops.render.render(write_still=True)

# --- state: default ---
render("scene-master")

# --- state: cabinet door open ---
door = bpy.data.objects["CabinetDoorRight"]   # rename the mesh accordingly
orig_rot = door.rotation_euler.copy()
door.rotation_euler.z += 1.3   # radians, ~75°
render("state-cabinet-open")
door.rotation_euler = orig_rot

# --- state: front door open ---
front = bpy.data.objects["FrontDoor"]
orig = front.rotation_euler.copy()
front.rotation_euler.z += 1.3
render("state-door-open")
front.rotation_euler = orig

# --- state: laptop unlocked (swap the screen emission material) ---
laptop_screen = bpy.data.materials["LaptopScreen"]
laptop_screen.node_tree.nodes["Emission"].inputs["Color"].default_value = (0.2, 0.6, 1.0, 1)
render("state-laptop-unlocked")
# reset if you want: set back to lock-screen color
```

Every render is pixel-identical except for the objects you actually
changed. That's the whole win.

---

## 9. Inventory / zoom-view renders

For each pickup-able item (key, keycard, paper):

- Temporarily hide the room: select Room object, press H.
- Move camera close to the item, frame it against a neutral backdrop (a
  plane with a soft gradient material, or render with transparent film).
- Render at 512×512, save as `item-{id}.png`.
- Alt+H restores hidden objects.

Same lighting HDRI = items match the room's look automatically.

---

## 10. Wire into the game

Replace the current SVG/AI backgrounds in `assets/rooms/apartment/ai/`
with the Blender renders. Update `gen-apartment.js` (or equivalent) to
reference the new filenames. State transitions in the game become asset
swaps: `background.png` → `state-cabinet-open.png` when the cabinet-open
flag is set.

---

## Troubleshooting

- **Scene looks flat / washed out:** you're in Material Preview, not
  Rendered. Top-right of 3D view, click the rightmost sphere icon.
- **Objects are huge / tiny:** imported in the wrong unit. Scene properties
  → Units → Unit System: Metric, Length: Meters.
- **Render is black:** camera is inside a wall or pointing the wrong way.
  Press Numpad 0, eyeball the framing.
- **Cycles is slow:** Samples down to 64, or switch to Eevee (Render
  Properties → Render Engine).
- **HDRI too bright:** World properties → Strength, try 0.3–0.7.
- **Can't find the asset I want:** just use a close-enough substitute and
  scale/recolor. For a point-and-click the props only need to be readable,
  not perfect.

---

## Rough time budget

| Step | Time |
|------|------|
| Install Blender, download HDRI + 6 assets | 30 min |
| Build walls/floor/ceiling shell | 15 min |
| Place and scale imported assets | 1–2 hrs |
| Camera + lighting polish | 30 min |
| First master render | 5 min |
| Python state-variant script | 15 min |
| Per new state render | <1 min |

First room: one evening. Subsequent rooms reuse the pipeline → ~half the
time.
