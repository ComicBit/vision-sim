# Vision Simulator Web App

This web app simulates **real-world vision impairments** based on an actual **optical prescription**.  
It uses a webcam feed and WebGL shaders to replicate common refractive errors such as:

- **Myopia (near-sightedness)**
- **Hyperopia (far-sightedness)**
- **Astigmatism** (including axis-specific directional blur)
- **Presbyopia** (age-related near blur and contrast loss)

All effects are applied in real-time and can be entered exactly as written on a prescription slip (Sphere, Cylinder, Axis, Add), per eye.

---

## 🔍 How It Works

- Uses **WebGL shaders** for real-time GPU-based simulation
- Interprets a **prescription (Rx)** into:
  - Spherical blur
  - Directional blur along astigmatic axes
  - Presbyopic contrast loss
- **Binocular fusion** combines both eyes’ simulated views
- Fully responsive, **mobile-first UI** with a bottom sheet for settings

---

## 📦 Files

| File          | Purpose                                      |
|---------------|----------------------------------------------|
| `index.html`  | Setup page: user inputs their prescription   |
| `sim.html`    | Live camera view with simulated impairments  |
| `style.css`   | Responsive styling and bottom-sheet layout   |
| `sim.js`      | WebGL logic for real-time prescription rendering |

---

## 🚀 Quick Start (Local)

1. Clone or copy this folder to your Raspberry Pi.
2. Run a local server (e.g., with Python):

   ```bash
   cd path/to/folder
   python3 -m http.server 8080
   ```

3. On your browser (laptop or mobile on the same network), open:

   ```
   http://<your-ip>:8080
   ```

4. Enter your prescription on the setup screen and press **Start simulation**.

---

## 📱 Features

- 📷 Live webcam processing
- 👁 Independent simulation for left and right eye
- 📐 Supports diopter, cylinder, axis, and ADD (presbyopia)
- 🎛 Editable in real-time via mobile-friendly bottom panel
- 🔁 Horizontally mirrored (like a real mirror)
- 🧠 Stitched view representing binocular perception

---

## 🧪 Future Improvements (Planned)

- Depth-aware blur (when WebXR depth APIs are more widely supported)
- Support for additional conditions (e.g., glaucoma, cataracts)
- Save/export simulation snapshots
- Custom mobile PWA or app wrapper

---

## 🛠 Requirements

- Any modern browser with WebGL and `getUserMedia` support
- For local testing: Python 3 or Node.js + `serve`

---

## 👓 Educational Use

This simulator can be used to:

- Show patients what uncorrected vision impairments actually look like
- Test and demonstrate the impact of different prescriptions
- Create empathy tools for designers, educators, or medical staff

---

## 📄 License

MIT — free to use, modify, and distribute.
