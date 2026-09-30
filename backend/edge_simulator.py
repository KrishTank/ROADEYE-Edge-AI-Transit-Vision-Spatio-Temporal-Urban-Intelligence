"""
URBANSENSE AI — EDGE SIMULATOR

Pretends to be a fleet of buses uploading detections to the backend.
Runs on an interval, POSTs realistic events to /api/events.

Run:  python edge_simulator.py

Options (edit constants below):
  INTERVAL_MIN  — minimum seconds between events
  INTERVAL_MAX  — maximum seconds between events
  BURST_MODE    — if True, generates events very fast (for demos)
"""

import time
import random
import requests # type: ignore
from datetime import datetime

# =========================================================
# CONFIG
# =========================================================

API_BASE = 'http://localhost:5000'

INTERVAL_MIN = 8          # minimum seconds between events
INTERVAL_MAX = 15         # maximum seconds between events

BURST_MODE = True        # set to True to generate events every 1-2 seconds

if BURST_MODE:
    INTERVAL_MIN = 1
    INTERVAL_MAX = 2


# =========================================================
# DETECTION TYPES (weighted for realism)
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


# =========================================================
# HELPERS
# =========================================================

def pick_detection():
    """Returns a weighted random detection type."""
    types, weights = zip(*DETECTIONS)
    return random.choices(types, weights=weights, k=1)[0]


def fetch_active_buses():
    """Fetches list of ACTIVE buses from the backend."""
    try:
        res = requests.get(API_BASE + '/api/fleet', timeout=3)
        if res.status_code != 200:
            return []
        data = res.json()
        buses = data.get('data', [])
        active = [b for b in buses if b.get('status') == 'ACTIVE']
        return active
    except Exception:
        return []


def post_event(bus_id, detection_type):
    """POSTs a new event to the backend."""
    try:
        payload = {
            'type': detection_type,
            'bus_id': bus_id,
        }
        res = requests.post(
            API_BASE + '/api/events',
            json=payload,
            timeout=3,
        )
        if res.status_code == 201:
            event = res.json().get('data', {})
            return event
        else:
            return None
    except Exception as e:
        print('  [X] POST failed: ' + str(e))
        return None


def format_event(event):
    """Pretty-print an event for the terminal."""
    eid = event.get('id', '?')
    etype = event.get('type', '?')
    sev = event.get('severity', '?')
    conf = event.get('confidence', '?')
    bus = event.get('bus_id', '?')
    loc = event.get('location', '?')
    return '[%s] %s | %s | %.1f%% | %s | %s' % (
        eid, etype, sev, float(conf) if conf != '?' else 0, bus, loc
    )


# =========================================================
# MAIN LOOP
# =========================================================

def main():
    print('=' * 62)
    print(' URBANSENSE AI - EDGE SIMULATOR')
    print('=' * 62)
    print('  Backend:  ' + API_BASE)
    print('  Interval: ' + str(INTERVAL_MIN) + '-' + str(INTERVAL_MAX) + 's between events')
    print('  Burst:    ' + ('ON' if BURST_MODE else 'OFF'))
    print('=' * 62)

    # Check the backend is up
    print('[Sim] Checking backend connection...')
    buses = fetch_active_buses()
    if not buses:
        print('[Sim] ERROR: Cannot reach backend, or no active buses.')
        print('[Sim] Make sure app.py is running: python app.py')
        return
    print('[Sim] Connected. ' + str(len(buses)) + ' active buses in fleet.')
    print('[Sim] Starting event generation loop...')
    print('=' * 62)

    event_count = 0

    try:
        while True:
            # Pick a random active bus
            bus = random.choice(buses)
            # Pick a weighted detection
            detection = pick_detection()
            # Post it
            event = post_event(bus['id'], detection)

            if event:
                event_count += 1
                timestamp = datetime.now().strftime('%H:%M:%S')
                print('[%s] #%d  %s' % (timestamp, event_count, format_event(event)))
            else:
                print('  [!] Failed to create event, retrying next cycle')

            # Sometimes refresh the bus list (in case statuses changed)
            if event_count % 10 == 0:
                new_buses = fetch_active_buses()
                if new_buses:
                    buses = new_buses

            # Sleep a random interval
            wait = random.uniform(INTERVAL_MIN, INTERVAL_MAX)
            time.sleep(wait)

    except KeyboardInterrupt:
        print()
        print('=' * 62)
        print(' EDGE SIMULATOR STOPPED')
        print('=' * 62)
        print('  Total events generated this session: ' + str(event_count))
        print('=' * 62)


if __name__ == '__main__':
    main()