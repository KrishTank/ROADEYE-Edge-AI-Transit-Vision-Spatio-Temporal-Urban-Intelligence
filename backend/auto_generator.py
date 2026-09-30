"""
URBANSENSE AI — AUTO EVENT GENERATOR

Runs inside Flask as a background daemon thread.
Every AUTO_INTERVAL seconds, generates a random detection.
Broadcasts each new event to SSE clients.
"""

import threading
import time
import random
from datetime import datetime

import database as db


# =========================================================
# CONFIG
# =========================================================

AUTO_GENERATE = True          # set False to disable
AUTO_INTERVAL = 12            # average seconds between events
AUTO_JITTER   = 5             # +/- jitter


# =========================================================
# DETECTION TYPES
# =========================================================

DETECTIONS = [
    ('Pothole',          35),
    ('Road Crack',       22),
    ('Waterlogging',     10),
    ('Traffic Density',  10),
    ('Pedestrian',        7),
    ('Traffic Sign',      5),
    ('Missing Sign',      4),
    ('Missing Divider',   3),
    ('Missing Zebra',     2),
    ('Rash Driving',      2),
]

SEVERITY_BY_TYPE = {
    'Pothole':         'HIGH',
    'Road Crack':      'MEDIUM',
    'Waterlogging':    'HIGH',
    'Traffic Density': 'MEDIUM',
    'Pedestrian':      'HIGH',
    'Traffic Sign':    'LOW',
    'Missing Sign':    'MEDIUM',
    'Missing Divider': 'MEDIUM',
    'Missing Zebra':   'LOW',
    'Rash Driving':    'CRITICAL',
}


# =========================================================
# HELPERS
# =========================================================

_counter = [0]


def _make_event_id():
    _counter[0] += 1
    return 'EVT-' + str(int(datetime.utcnow().timestamp()))[-6:] + '-A' + str(_counter[0]).zfill(4)


def _make_plate():
    return (
        'KA' + str(random.randint(10, 99)) +
        chr(random.randint(65, 90)) + chr(random.randint(65, 90)) +
        str(random.randint(1000, 9999))
    )


# =========================================================
# GENERATE ONE EVENT
# =========================================================

def generate_one_event():
    buses = db.get_all_buses()
    active = [b for b in buses if b.get('status') == 'ACTIVE']
    if not active:
        return None

    bus = random.choice(active)

    types, weights = zip(*DETECTIONS)
    event_type = random.choices(types, weights=weights, k=1)[0]

    severity = SEVERITY_BY_TYPE.get(event_type, 'MEDIUM')
    if random.random() < 0.15:
        severity = random.choice(['LOW', 'MEDIUM', 'HIGH'])

    confidence = round(random.uniform(72, 98), 1)

    lat = bus['latitude']  + (random.random() - 0.5) * 0.0015
    lng = bus['longitude'] + (random.random() - 0.5) * 0.0015

    vehicle_reg = _make_plate() if event_type == 'Rash Driving' else None

    event = {
        'id': _make_event_id(),
        'type': event_type,
        'severity': severity,
        'confidence': confidence,
        'bus_id': bus['id'],
        'route': bus['route'],
        'location': bus['location'],
        'latitude': round(lat, 6),
        'longitude': round(lng, 6),
        'status': 'Open',
        'vehicle_reg': vehicle_reg,
        'camera_id': 'CAM-0' + str(random.randint(1, 4)),
        'timestamp': datetime.utcnow().isoformat(),
    }

    try:
        db.insert_event(event)

        # Broadcast to SSE subscribers
        try:
            from routes.stream import broadcast
            broadcast(event)
        except Exception as e:
            print('[auto-gen] broadcast failed: ' + str(e))

        return event

    except Exception as e:
        print('[auto-gen] Insert failed: ' + str(e))
        return None


# =========================================================
# BACKGROUND THREAD
# =========================================================

_thread_started = [False]


def _loop():
    print('[auto-gen] Background generator started. Interval: ' +
          str(AUTO_INTERVAL) + 's +/- ' + str(AUTO_JITTER) + 's')
    event_count = 0

    time.sleep(3)

    while True:
        try:
            event = generate_one_event()
            if event:
                event_count += 1
                ts = datetime.now().strftime('%H:%M:%S')
                print('[auto-gen] [%s] #%d  %s | %s | %.1f%% | %s' % (
                    ts, event_count, event['id'], event['type'],
                    event['confidence'], event['bus_id']
                ))
        except Exception as e:
            print('[auto-gen] Loop error: ' + str(e))

        wait = AUTO_INTERVAL + random.uniform(-AUTO_JITTER, AUTO_JITTER)
        time.sleep(max(2, wait))


def start_background_generator():
    if not AUTO_GENERATE:
        print('[auto-gen] Disabled (AUTO_GENERATE = False)')
        return

    if _thread_started[0]:
        return

    _thread_started[0] = True
    t = threading.Thread(target=_loop, daemon=True)
    t.start()