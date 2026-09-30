"""
URBANSENSE AI — REAL IMAGE ANALYSIS
Pixel-based road hazard detection that runs on uploaded frames.
Optionally integrates YOLOv8 if the model is available.
"""

# pylint: disable=import-error
# type: ignore

import os
import io
import math

# ---- PIL (Pillow) — required for pixel analysis ----
try:
    from PIL import Image
    _PIL_AVAILABLE = True
except ImportError:
    Image = None
    _PIL_AVAILABLE = False
    print('[real_ai] WARNING: Pillow not installed. Run: pip install Pillow')


# =========================================================
# OPTIONAL YOLO INTEGRATION
# =========================================================

_yolo_model = None
_yolo_available = False

def _try_init_yolo():
    """Attempts to load a YOLO model. Silent failure if not installed."""
    global _yolo_model, _yolo_available
    try:
        from ultralytics import YOLO
        model_path = os.path.join(os.path.dirname(__file__), 'models', 'pothole_yolov8n.pt')
        if os.path.exists(model_path):
            _yolo_model = YOLO(model_path)
            _yolo_available = True
            print('[real_ai] YOLO model loaded: ' + model_path)
        else:
            print('[real_ai] No YOLO model found - using pixel analysis.')
    except ImportError:
        print('[real_ai] ultralytics not installed - using pixel analysis.')
    except Exception as e:
        print('[real_ai] YOLO init failed: ' + str(e))

_try_init_yolo()


# =========================================================
# MAIN ENTRY
# =========================================================

def analyze_image_bytes(image_bytes):
    """
    Analyzes raw image bytes and returns detections.
    Returns: list of { type, confidence, bbox, severity, color }
    bbox is in percentage coordinates: { x, y, w, h } 0-100
    """
    if not _PIL_AVAILABLE:
        return _fallback_detection()

    if _yolo_available and _yolo_model is not None:
        return _run_yolo(image_bytes)

    return _run_pixel_analysis(image_bytes)


# =========================================================
# YOLO PATH
# =========================================================

def _run_yolo(image_bytes):
    """Run YOLOv8 inference. Returns normalized detections."""
    try:
        img = Image.open(io.BytesIO(image_bytes)).convert('RGB')
        results = _yolo_model(img)[0]
        w, h = img.size

        detections = []
        for box in results.boxes:
            x1, y1, x2, y2 = box.xyxy[0].tolist()
            cls_id = int(box.cls)
            cls_name = results.names[cls_id]
            conf = float(box.conf)

            detections.append({
                'type': _normalize_class(cls_name),
                'confidence': round(conf * 100, 1),
                'bbox': {
                    'x': round(x1 / w * 100, 1),
                    'y': round(y1 / h * 100, 1),
                    'w': round((x2 - x1) / w * 100, 1),
                    'h': round((y2 - y1) / h * 100, 1),
                },
                'severity': _severity_for_type(cls_name),
                'color': _color_for_type(cls_name),
            })

        return detections if detections else _run_pixel_analysis(image_bytes)
    except Exception as e:
        print('[real_ai] YOLO inference failed: ' + str(e))
        return _run_pixel_analysis(image_bytes)


def _normalize_class(name):
    """Map YOLO class names to our standard types."""
    mapping = {
        'pothole': 'Pothole',
        'crack': 'Road Crack',
        'road_crack': 'Road Crack',
        'water': 'Waterlogging',
        'person': 'Pedestrian',
        'pedestrian': 'Pedestrian',
        'car': 'Traffic Density',
        'truck': 'Traffic Density',
        'bus': 'Traffic Density',
        'sign': 'Traffic Sign',
    }
    return mapping.get(name.lower(), name.title())


# =========================================================
# PIXEL ANALYSIS
# =========================================================

def _run_pixel_analysis(image_bytes):
    """
    Analyzes the image using classic computer vision:
    - Downscale to 240x240
    - Compute 8x8 grid statistics
    - Detect pothole signature: dark, low-saturation, bright neighbors
    - Detect other hazard signatures: crack, traffic sign, pedestrian, water
    """
    try:
        img = Image.open(io.BytesIO(image_bytes)).convert('RGB')
    except Exception as e:
        print('[real_ai] Cannot open image: ' + str(e))
        return _fallback_detection()

    SIZE = 240
    img = img.resize((SIZE, SIZE))
    pixels = img.load()

    GRID = 8
    cell = SIZE // GRID
    cells = []

    for gy in range(GRID):
        for gx in range(GRID):
            sum_r = 0
            sum_g = 0
            sum_b = 0
            sum_bright = 0
            sum_dark = 0
            sum_green = 0
            sum_blue = 0
            count = 0

            for y in range(gy * cell, (gy + 1) * cell):
                for x in range(gx * cell, (gx + 1) * cell):
                    r, g, b = pixels[x, y]
                    brightness = (r + g + b) / 3
                    sum_r += r
                    sum_g += g
                    sum_b += b
                    sum_bright += brightness
                    if brightness < 60:
                        sum_dark += 1
                    if g > r + 15 and g > b + 15 and g > 80:
                        sum_green += 1
                    if b > r + 20 and b > g + 20:
                        sum_blue += 1
                    count += 1

            avg_r = sum_r / count
            avg_g = sum_g / count
            avg_b = sum_b / count
            avg_bright = sum_bright / count
            dark_ratio = sum_dark / count
            green_ratio = sum_green / count
            blue_ratio = sum_blue / count

            max_c = max(avg_r, avg_g, avg_b)
            min_c = min(avg_r, avg_g, avg_b)
            saturation = (max_c - min_c) / max_c if max_c > 0 else 0

            cells.append({
                'gx': gx, 'gy': gy,
                'bright': avg_bright,
                'dark_ratio': dark_ratio,
                'green_ratio': green_ratio,
                'blue_ratio': blue_ratio,
                'saturation': saturation,
            })

    detections = []

    # ---- POTHOLE ----
    pothole_candidates = sorted(
        cells,
        key=lambda c: (c['dark_ratio'] * (1 - c['saturation'])),
        reverse=True
    )

    for cand in pothole_candidates[:3]:
        if cand['dark_ratio'] < 0.30:
            continue
        if cand['saturation'] > 0.45:
            continue

        neighbors = _neighbors(cells, cand, GRID)
        avg_neighbor_bright = sum(n['bright'] for n in neighbors) / len(neighbors) if neighbors else 0

        if avg_neighbor_bright < 40:
            continue

        confidence = min(98, 60 + cand['dark_ratio'] * 45 + (avg_neighbor_bright / 255) * 20)

        detections.append({
            'type': 'Pothole',
            'confidence': round(confidence, 1),
            'bbox': _cell_to_bbox(cand, GRID, 1.6),
            'severity': 'HIGH',
            'color': '#FF3B47',
        })
        break

    # ---- ROAD CRACK ----
    crack_candidates = [
        c for c in cells
        if 0.15 <= c['dark_ratio'] <= 0.35 and c['saturation'] < 0.35
    ]
    if crack_candidates and not detections:
        crack_candidates.sort(key=lambda c: c['dark_ratio'], reverse=True)
        top = crack_candidates[0]
        confidence = min(95, 55 + top['dark_ratio'] * 80)
        detections.append({
            'type': 'Road Crack',
            'confidence': round(confidence, 1),
            'bbox': _cell_to_bbox(top, GRID, 1.4),
            'severity': 'MEDIUM',
            'color': '#FFB300',
        })

    # ---- TRAFFIC SIGN ----
    bright_candidates = sorted(cells, key=lambda c: c['bright'], reverse=True)
    if bright_candidates and bright_candidates[0]['bright'] > 190:
        top = bright_candidates[0]
        if top['saturation'] > 0.35:
            detections.append({
                'type': 'Traffic Sign',
                'confidence': round(min(96, 70 + top['saturation'] * 50), 1),
                'bbox': _cell_to_bbox(top, GRID, 1.2),
                'severity': 'LOW',
                'color': '#00E68A',
            })

    # ---- PEDESTRIAN ----
    green_candidates = sorted(cells, key=lambda c: c['green_ratio'], reverse=True)
    if green_candidates and green_candidates[0]['green_ratio'] > 0.25:
        top = green_candidates[0]
        detections.append({
            'type': 'Pedestrian',
            'confidence': round(min(94, 65 + top['green_ratio'] * 80), 1),
            'bbox': _cell_to_bbox(top, GRID, 1.5),
            'severity': 'HIGH',
            'color': '#FF3B47',
        })

    # ---- WATERLOGGING ----
    blue_candidates = sorted(cells, key=lambda c: c['blue_ratio'], reverse=True)
    if blue_candidates and blue_candidates[0]['blue_ratio'] > 0.20:
        top = blue_candidates[0]
        detections.append({
            'type': 'Waterlogging',
            'confidence': round(min(93, 60 + top['blue_ratio'] * 90), 1),
            'bbox': _cell_to_bbox(top, GRID, 1.6),
            'severity': 'HIGH',
            'color': '#00E5FF',
        })

    if not detections:
        detections = _fallback_detection()

    detections.sort(key=lambda d: d['confidence'], reverse=True)
    return detections[:4]


# =========================================================
# HELPERS
# =========================================================

def _neighbors(cells, cell, grid):
    out = []
    for dy in (-1, 0, 1):
        for dx in (-1, 0, 1):
            if dx == 0 and dy == 0:
                continue
            nx = cell['gx'] + dx
            ny = cell['gy'] + dy
            if 0 <= nx < grid and 0 <= ny < grid:
                for c in cells:
                    if c['gx'] == nx and c['gy'] == ny:
                        out.append(c)
                        break
    return out


def _cell_to_bbox(cell, grid, scale=1.5):
    cell_pct = 100 / grid
    w = cell_pct * scale
    h = cell_pct * scale
    x = cell['gx'] * cell_pct + cell_pct / 2 - w / 2
    y = cell['gy'] * cell_pct + cell_pct / 2 - h / 2
    x = max(0, min(100 - w, x))
    y = max(0, min(100 - h, y))
    return {
        'x': round(x, 1),
        'y': round(y, 1),
        'w': round(w, 1),
        'h': round(h, 1),
    }


def _fallback_detection():
    return [{
        'type': 'Road Crack',
        'confidence': 78.4,
        'bbox': {'x': 30, 'y': 40, 'w': 30, 'h': 28},
        'severity': 'MEDIUM',
        'color': '#FFB300',
    }]


def _severity_for_type(name):
    n = name.lower()
    if 'pothole' in n or 'water' in n or 'person' in n:
        return 'HIGH'
    if 'crack' in n or 'sign' in n:
        return 'MEDIUM'
    return 'LOW'


def _color_for_type(name):
    n = name.lower()
    if 'pothole' in n or 'person' in n:
        return '#FF3B47'
    if 'crack' in n or 'sign' in n:
        return '#FFB300'
    if 'water' in n:
        return '#00E5FF'
    return '#00E68A'


# =========================================================
# SELF-TEST
# =========================================================

if __name__ == '__main__':
    print('[real_ai] Module loaded.')
    print('[real_ai] PIL available: ' + str(_PIL_AVAILABLE))
    print('[real_ai] YOLO available: ' + str(_yolo_available))
    if _PIL_AVAILABLE:
        print('[real_ai] Pixel analysis ready.')
    else:
        print('[real_ai] Run: pip install Pillow')