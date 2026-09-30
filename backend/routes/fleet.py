from flask import Blueprint, jsonify, request
from datetime import datetime
import random

import database as db

fleet_bp = Blueprint('fleet', __name__)


@fleet_bp.route('/api/fleet', methods=['GET'])
def list_buses():
    buses = db.get_all_buses()
    return jsonify({'success': True, 'count': len(buses), 'data': buses})


@fleet_bp.route('/api/fleet/<bus_id>', methods=['GET'])
def get_one_bus(bus_id):
    bus = db.get_bus(bus_id)
    if not bus:
        return jsonify({'success': False, 'error': 'Bus not found'}), 404
    return jsonify({'success': True, 'data': bus})


@fleet_bp.route('/api/fleet/<bus_id>', methods=['PATCH'])
def patch_bus(bus_id):
    bus = db.get_bus(bus_id)
    if not bus:
        return jsonify({'success': False, 'error': 'Bus not found'}), 404
    patch = request.get_json(silent=True) or {}
    if not patch:
        return jsonify({'success': False, 'error': 'No fields to update'}), 400
    allowed = {'route', 'destination', 'location', 'latitude', 'longitude',
               'speed', 'passengers', 'capacity', 'progress', 'status', 'camera'}
    safe_patch = {k: v for k, v in patch.items() if k in allowed}
    if not safe_patch:
        return jsonify({'success': False, 'error': 'No valid fields'}), 400
    db.update_bus(bus_id, safe_patch)
    return jsonify({'success': True, 'data': db.get_bus(bus_id)})


@fleet_bp.route('/api/fleet/simulate', methods=['POST'])
def simulate_fleet():
    buses = db.get_all_buses()
    moved = 0
    for bus in buses:
        if bus['status'] != 'ACTIVE':
            continue
        new_lat = bus['latitude'] + (random.random() - 0.5) * 0.0015
        new_lng = bus['longitude'] + (random.random() - 0.5) * 0.0015
        new_speed = max(10, min(55, bus['speed'] + random.randint(-3, 3)))
        new_progress = min(100, bus['progress'] + random.randint(0, 4))
        db.update_bus(bus['id'], {
            'latitude': round(new_lat, 6),
            'longitude': round(new_lng, 6),
            'speed': new_speed,
            'progress': new_progress,
        })
        moved += 1
    return jsonify({'success': True, 'buses_moved': moved, 'timestamp': datetime.utcnow().isoformat()})


@fleet_bp.route('/api/fleet/health', methods=['GET'])
def fleet_health():
    buses = db.get_all_buses()
    active = sum(1 for b in buses if b['status'] == 'ACTIVE')
    return jsonify({
        'success': True,
        'total': len(buses),
        'active': active,
        'idle': len(buses) - active,
        'status': 'healthy' if len(buses) > 0 else 'empty',
    })