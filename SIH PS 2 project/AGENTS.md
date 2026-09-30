# UrbanSense AI — Antigravity Project Instructions

## Project goal
This is a working prototype of an AI-powered public-transport urban intelligence platform.
Buses act as mobile sensing units. Camera detections are enriched with bus ID, GPS,
timestamp, severity and confidence, then shown in an operations dashboard.

## Stack
- Frontend: Vanilla HTML, CSS and JavaScript
- Maps: Leaflet
- Backend: Python Flask + Flask-CORS
- Database: SQLite
- Computer vision: Pillow-based image analysis with optional YOLOv8 support

## Run locally on Windows
1. Open this project folder in Antigravity.
2. Run `scripts\start.bat`.
3. The launcher creates `backend\venv`, installs `backend\requirements.txt`,
   seeds the SQLite database if needed, starts Flask, starts the frontend server,
   and opens the dashboard.
4. Frontend: http://localhost:5500
5. Backend: http://localhost:5000

Manual backend:
```powershell
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python seed.py
python app.py
```

Manual frontend:
```powershell
cd frontend
python -m http.server 5500
```

## Important rules
- Do not recreate the removed `urbansense/` duplicate project.
- Do not commit `backend\venv`, `__pycache__`, `.pyc`, `.db`, or generated build files.
- Keep API base URL at `http://localhost:5000` unless the deployment configuration is intentionally changed.
- Keep frontend pages compatible with the existing Vanilla JS architecture.
- Preserve existing API routes unless a change is required for a bug fix.
- If adding dependencies, update `backend/requirements.txt`.
- Prefer small, targeted changes over replacing the whole application.
- After backend changes, run a Python syntax check.
- After frontend changes, verify all referenced JS/CSS/HTML files exist.

## Core architecture
frontend/ -> HTTP/SSE -> backend/app.py -> route blueprints -> database.py
                                      -> real_ai.py
                                      -> auto_generator.py
                                      -> GPS simulator

## AI detection
`backend/real_ai.py` performs image analysis. If a YOLO model is placed at:
`backend/models/pothole_yolov8n.pt`
and `ultralytics` is installed, it can use YOLO. Otherwise it uses the built-in
Pillow pixel-analysis fallback.

## Main prototype flow
Camera frame -> AI detection -> GPS + timestamp + Bus ID -> Urban Event ->
database -> dashboard -> event verification/operations workflow.

## Do not assume real-world production integrations
The current project is a demonstration prototype. GPS, fleet movement and event
generation are simulated unless explicitly connected to real devices/services.
