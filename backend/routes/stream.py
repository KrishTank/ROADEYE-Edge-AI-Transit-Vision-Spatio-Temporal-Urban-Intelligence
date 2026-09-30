"""
URBANSENSE AI — SSE STREAM

Endpoint:
  GET /api/stream          -> persistent connection, pushes events
  GET /api/stream/status   -> count of connected clients
  POST /api/stream/test    -> fires a test event
"""

from flask import Blueprint, Response, jsonify, stream_with_context
from datetime import datetime
import json
import queue
import threading
import time
import random

import database as db

stream_bp = Blueprint('stream', __name__)


# =========================================================
# SUBSCRIBERS
# =========================================================

_subscribers = []
_subscribers_lock = threading.Lock()


def broadcast(event):
    """Push an event to every connected client."""
    message = {
        'type': 'event',
        'payload': event,
        'ts': datetime.utcnow().isoformat(),
    }
    _push(message)


def broadcast_fleet():
    """Signal to all clients that fleet positions changed."""
    _push({'type': 'fleet_updated', 'ts': datetime.utcnow().isoformat()})


def _push(message):
    with _subscribers_lock:
        dead = []
        for q in _subscribers:
            try:
                q.put_nowait(message)
            except queue.Full:
                dead.append(q)
        for q in dead:
            _subscribers.remove(q)


# =========================================================
# SSE ENDPOINT
# =========================================================

@stream_bp.route('/api/stream', methods=['GET'])
def stream():
    def event_generator():
        q = queue.Queue(maxsize=100)
        with _subscribers_lock:
            _subscribers.append(q)

        client_id = id(q)
        print('[SSE] Client connected (id=%s). Total: %d' % (client_id, len(_subscribers)))

        try:
            yield 'data: ' + json.dumps({
                'type': 'connected',
                'ts': datetime.utcnow().isoformat(),
            }) + '\n\n'

            last_heartbeat = time.time()

            while True:
                try:
                    msg = q.get(timeout=20)
                    yield 'data: ' + json.dumps(msg) + '\n\n'
                    last_heartbeat = time.time()
                except queue.Empty:
                    if time.time() - last_heartbeat >= 20:
                        yield ': heartbeat\n\n'
                        last_heartbeat = time.time()

        except GeneratorExit:
            pass
        finally:
            with _subscribers_lock:
                if q in _subscribers:
                    _subscribers.remove(q)
            print('[SSE] Client disconnected (id=%s). Total: %d' % (client_id, len(_subscribers)))

    return Response(
        stream_with_context(event_generator()),
        mimetype='text/event-stream',
        headers={
            'Cache-Control': 'no-cache',
            'X-Accel-Buffering': 'no',
            'Connection': 'keep-alive',
            'Access-Control-Allow-Origin': '*',
        },
    )


@stream_bp.route('/api/stream/status', methods=['GET'])
def status():
    with _subscribers_lock:
        count = len(_subscribers)
    return jsonify({
        'success': True,
        'connected_clients': count,
        'ts': datetime.utcnow().isoformat(),
    })


@stream_bp.route('/api/stream/test', methods=['POST'])
def test_broadcast():
    buses = db.get_all_buses()
    if not buses:
        return jsonify({'success': False, 'error': 'No buses'}), 400

    bus = random.choice(buses)
    eid = 'EVT-' + str(int(datetime.utcnow().timestamp()))[-6:] + str(random.randint(1000, 9999))

    event = {
        'id': eid,
        'type': 'Pothole',
        'severity': 'HIGH',
        'confidence': 92.5,
        'bus_id': bus['id'],
        'route': bus['route'],
        'location': bus['location'],
        'latitude': bus['latitude'],
        'longitude': bus['longitude'],
        'status': 'Open',
        'vehicle_reg': None,
        'camera_id': 'CAM-01',
        'timestamp': datetime.utcnow().isoformat(),
    }
    db.insert_event(event)
    broadcast(event)
    return jsonify({'success': True, 'event': event})