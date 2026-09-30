"""
URBANSENSE AI — LIVE GPS STREAM

Broadcasts bus positions every 1 second over SSE.
Buses move smoothly along real Bengaluru route waypoints.

Endpoints:
  GET /api/gps/stream    → SSE stream of positions
  GET /api/gps/current   → snapshot of current positions
  GET /api/gps/routes    → all route waypoints
  GET /api/gps/landmarks → landmarks for map labels
"""

from flask import Blueprint, Response, jsonify, stream_with_context
from datetime import datetime
import json
import queue
import threading
import time
import math

import database as db
from route_waypoints import ROUTES, get_route, get_landmarks

gps_bp = Blueprint('gps', __name__)


# =========================================================
# LIVE BUS STATE
# In-memory only. Each bus tracks its position along a route.
# =========================================================

_bus_state = {}          # { bus_id: { route, wp_index, progress, lat, lng, heading, speed, trail } }
_state_lock = threading.Lock()
_mover_thread_started = [False]

TRAIL_MAX = 30           # keep last 30 positions per bus
UPDATE_INTERVAL = 1.0    # seconds between updates
SPEED_FACTOR = 0.00025   # movement per tick (rough km per second scaled)


# =========================================================
# INITIALIZE STATE FROM FLEET
# =========================================================

def _init_bus_state():
    """Sets up state for each bus in the fleet."""
    with _state_lock:
        fleet = db.get_all_buses()
        for bus in fleet:
            if bus['status'] != 'ACTIVE':
                continue
            route_id = bus['route']
            waypoints = get_route(route_id)
            if not waypoints:
                continue

            # Assign starting waypoint index based on bus id hash
            start_idx = hash(bus['id']) % len(waypoints)

            _bus_state[bus['id']] = {
                'bus_id': bus['id'],
                'route': route_id,
                'waypoints': waypoints,
                'wp_index': start_idx,
                'progress': 0.0,
                'lat': waypoints[start_idx][0],
                'lng': waypoints[start_idx][1],
                'heading': 0,
                'speed': bus['speed'],
                'trail': [],
            }


# =========================================================
# MOVEMENT LOGIC
# =========================================================

def _haversine_heading(lat1, lng1, lat2, lng2):
    """Returns the heading in degrees from point 1 to point 2."""
    dLng = math.radians(lng2 - lng1)
    y = math.sin(dLng) * math.cos(math.radians(lat2))
    x = math.cos(math.radians(lat1)) * math.sin(math.radians(lat2)) - \
        math.sin(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.cos(dLng)
    return (math.degrees(math.atan2(y, x)) + 360) % 360


def _move_bus(state):
    """Advances a bus along its waypoints."""
    waypoints = state['waypoints']
    idx = state['wp_index']
    next_idx = (idx + 1) % len(waypoints)

    lat1, lng1 = waypoints[idx]
    lat2, lng2 = waypoints[next_idx]

    # Move by SPEED_FACTOR each tick
    state['progress'] += SPEED_FACTOR * 8
    if state['progress'] >= 1.0:
        state['progress'] = 0.0
        state['wp_index'] = next_idx
        return

    t = state['progress']
    state['lat'] = lat1 + (lat2 - lat1) * t
    state['lng'] = lng1 + (lng2 - lng1) * t
    state['heading'] = _haversine_heading(lat1, lng1, lat2, lng2)

    # Update trail
    state['trail'].append([round(state['lat'], 6), round(state['lng'], 6)])
    if len(state['trail']) > TRAIL_MAX:
        state['trail'].pop(0)


def _mover_loop():
    """Background thread that advances all buses every second."""
    time.sleep(2)
    _init_bus_state()
    print('[gps] Mover thread started. Tracking %d buses.' % len(_bus_state))

    while True:
        try:
            with _state_lock:
                for state in _bus_state.values():
                    _move_bus(state)
            time.sleep(UPDATE_INTERVAL)
        except Exception as e:
            print('[gps] Mover error:', e)
            time.sleep(2)


def start_gps_mover():
    """Called from app.py on startup."""
    if _mover_thread_started[0]:
        return
    _mover_thread_started[0] = True
    t = threading.Thread(target=_mover_loop, daemon=True)
    t.start()


# =========================================================
# SUBSCRIBERS
# =========================================================

_subscribers = []
_subscribers_lock = threading.Lock()


def _broadcast(payload):
    with _subscribers_lock:
        dead = []
        for q in _subscribers:
            try:
                q.put_nowait(payload)
            except queue.Full:
                dead.append(q)
        for q in dead:
            _subscribers.remove(q)


def _snapshot():
    """Returns current positions of all buses."""
    with _state_lock:
        out = []
        for state in _bus_state.values():
            out.append({
                'bus_id': state['bus_id'],
                'route': state['route'],
                'lat': round(state['lat'], 6),
                'lng': round(state['lng'], 6),
                'heading': round(state['heading'], 1),
                'speed': state['speed'],
                'trail': state['trail'],
            })
        return out


# =========================================================
# SSE ENDPOINT
# =========================================================

@gps_bp.route('/api/gps/stream', methods=['GET'])
def gps_stream():
    def generator():
        q = queue.Queue(maxsize=50)
        with _subscribers_lock:
            _subscribers.append(q)

        # Immediately send current snapshot
        yield 'data: ' + json.dumps({
            'type': 'positions',
            'data': _snapshot(),
        }) + '\n\n'

        try:
            while True:
                try:
                    msg = q.get(timeout=3)
                    yield 'data: ' + json.dumps(msg) + '\n\n'
                except queue.Empty:
                    # No update needed, send keepalive
                    yield ': keepalive\n\n'
        except GeneratorExit:
            pass
        finally:
            with _subscribers_lock:
                if q in _subscribers:
                    _subscribers.remove(q)

    return Response(
        stream_with_context(generator()),
        mimetype='text/event-stream',
        headers={
            'Cache-Control': 'no-cache',
            'X-Accel-Buffering': 'no',
            'Access-Control-Allow-Origin': '*',
        },
    )


@gps_bp.route('/api/gps/current', methods=['GET'])
def gps_current():
    return jsonify({'success': True, 'data': _snapshot()})


@gps_bp.route('/api/gps/routes', methods=['GET'])
def gps_routes():
    return jsonify({'success': True, 'data': ROUTES})


@gps_bp.route('/api/gps/landmarks', methods=['GET'])
def gps_landmarks():
    return jsonify({'success': True, 'data': get_landmarks()})


# =========================================================
# BROADCAST LOOP
# Every second, push the current positions to all subscribers.
# =========================================================

def _broadcast_loop():
    time.sleep(3)
    while True:
        try:
            if _subscribers:
                _broadcast({
                    'type': 'positions',
                    'data': _snapshot(),
                })
            time.sleep(1)
        except Exception as e:
            print('[gps] Broadcast error:', e)
            time.sleep(2)


def start_gps_broadcaster():
    t = threading.Thread(target=_broadcast_loop, daemon=True)
    t.start()