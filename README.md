## ROADEYE 
Edge AI Transit Vision Spatio Temporal Urban Intelligence

## Prototype flow

Camera → AI Detection → GPS + Timestamp + Bus ID → Urban Event → Database → Dashboard

The prototype includes fleet tracking, event detection, road-health monitoring, incidents,
GIS, scanner, reports, government/field operations views, and system health.

## Project structure

```text
UrbanSense-Antigravity/
├── AGENTS.md
├── README.md
├── .gitignore
├── backend/
│   ├── app.py
│   ├── database.py
│   ├── seed.py
│   ├── auto_generator.py
│   ├── edge_simulator.py
│   ├── edge_simulator.py
│   ├── real_ai.py
│   ├── route_waypoints.py
│   ├── requirements.txt
│   └── routes/
├── frontend/
│   ├── index.html
│   ├── dashboard.html
│   ├── login.html
│   ├── pages/
│   ├── css/
│   ├── js/
│   └── assets/
└── scripts/
    ├── start.bat
    └── stop.bat
```

## Windows + Antigravity quick start

Double-click:

```text
scripts/start.bat
```

It will:
- create `backend/venv` if required
- install dependencies
- create/seed the demo SQLite database when missing
- start the Flask API on port 5000
- start the frontend on port 5500
- open the dashboard

Open manually:

- Frontend: http://localhost:5500/index.html
- Backend health: http://localhost:5000/api/health

## Manual start

```powershell
cd backend
python -m venv venv
venv\Scriptsctivate
pip install -r requirements.txt
python seed.py
python app.py
```

In another terminal:

```powershell
cd frontend
python -m http.server 5500
```

## AI scanner

`backend/real_ai.py` provides image analysis with Pillow. Optional YOLOv8 support is
enabled automatically when a compatible model exists at:

```text
backend/models/pothole_yolov8n.pt
```

The prototype works without the YOLO model by using the built-in pixel-analysis fallback.

## Main API

| Endpoint | Purpose |
|---|---|
| `GET /api/fleet` | Fleet data |
| `GET /api/events` | Detection events |
| `GET /api/stats` | Dashboard statistics |
| `POST /api/scan` | Analyze an uploaded image |
| `POST /api/scan/publish` | Analyze and publish detections |
| `GET /api/gps/stream` | Live GPS stream |
| `GET /api/system/health` | System health |

## Important

The fleet movement, GPS and automatic event generation are simulated for the prototype.
Do not treat simulated detections as real city observations.
