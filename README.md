# ⚡ HOBBIT v2.0 | Protocol Tracker

**HOBBIT** is a futuristic, desktop-native habit tracking application for "Operators" who need a high-performance workspace to track their daily logic and weekly protocols. It combines a Rust-based frontend wrapper (Tauri) with a silent Python backend (FastAPI) for a seamless, local-first experience.

![System Status: Optimal](https://img.shields.io/badge/System_Status-Optimal-cyan?style=for-the-badge&logo=target)
![Built With: Tauri](https://img.shields.io/badge/Built_With-Tauri_v2-purple?style=for-the-badge)

---

## 🚀 Project Overview
Unlike standard web-based trackers, HOBBIT runs entirely on your hardware. It features a **"Sidecar" architecture**, meaning the Python backend launches silently in the background when you open the app and closes automatically when you exit.

### ✨ Key Features
* **Cyberpunk Glass UI:** A sleek, semi-transparent dashboard with real-time system status.
* **Automated Sidecar:** No need to manually start servers; the app handles the backend.
* **Weekly Protocol:** Smart goal tracking (e.g., "12/15 tasks") with visual progress bars next to the user profile.
* **Local-First Data:** Your habits and logs are stored in a local SQLite database (`habits.db`).
* **Custom Title Bar:** Integrated window controls for a native desktop feel.

---

## 🛠️ Developer Setup & Installation

### 1. Prerequisites
* **Node.js** (LTS version)
* **Rust & Cargo** (via [rustup.rs](https://rustup.rs/))
* **Python 3.10+**

### 2. Installation
```bash
# Clone the repository
git clone [https://github.com/YOUR_USERNAME/YOUR_REPO.git](https://github.com/YOUR_USERNAME/YOUR_REPO.git)
cd YOUR_REPO
```
# Install Frontend dependencies
npm install

# Install Python dependencies
pip install fastapi uvicorn sqlmodel twilio pyinstaller

### 3. Running in Development
To run the app with hot-reloading:
```bash
Start Backend: python main.py
Start Frontend: npx tauri dev
```

### Build Instructions (For Standing Alone .EXE)

To create the standalone installer with the silent Python backend:

**Bundle Python:** Execute the following to create a windowless executable:
```bash
python -m PyInstaller -w --onefile --name api main.py
```
Move Sidecar: * Create a folder at src-tauri/binaries/
Move dist/api.exe to that folder.

Rename it to match your target triple (e.g., api-x86_64-pc-windows-msvc.exe).

Compile App: ``` npx tauri build ```

The installer will be located in src-tauri/target/release/bundle/nsis/.

### 🛡️ License (MIT)
Copyright (c) 2025

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.