from flask import Blueprint, jsonify, request
from datetime import datetime
import random

import database as db

events_bp = Blueprint('events', __name__)


DETECTION_TYPES = [
    {'type': 'Pothole',         'severity': 'HIGH',     'color': '#FF3B47'},
    {'type': 'Road Crack',      'severity': 'MEDIUM',   'color': '#FFB300'},
    {'type': 'Waterlogging',    'severity': 'HIGH',     'color': '#00E5FF'},
    {'type': 'Missing Divider', 'severity': 'MEDIUM',   'color': '#FFB300'},
    {'type': 'Missing Sign',    'severity': 'MEDIUM',   'color': '#8B5CF6'},
    {'type': 'Missing Zebra',   'severity': 'LOW',      'color': '#00E68A'},
    {'type': 'Pedestrian',      'severity': 'HIGH',     'color': '#FF3B47'},
    {'type': 'Rash Driving',    'severity': 'CRITICAL', 'color': '#FF3B47'},
    {'type': 'Traffic Sign',    'severity': 'LOW',      'color': '#00E68A'},
    {'type': 'Traffic Density', 'severity': 'MEDIUM',   'color': '#FFB300'},
]


@events_bp.route('/api/events', methods=['GET'])
def list_events():
    limit = int(request.args.get('limit', 100))
    events = db.get_all_events(limit=limit)

    status = request.args.get('status')
    etype = request.args.get('type')
    bus_id = request.args.get('bus_id')
    severity = request.args.get('severity')

    if status:
        events = [e for e in events if e['status'] == status]
    if etype:
        events = [e for e in events if e['type'] == etype]
    if bus_id:
        events = [e for e in events if e['bus_id'] == bus_id]
    if severity:
        events = [e for e in events if e['severity'] == severity]

    return jsonify({'success': True, 'count': len(events), 'data': events})


@events_bp.route('/api/events/<event_id>', methods=['GET'])
def get_one_event(event_id):
    event = db.get_event(event_id)
    if not event:
        return jsonify({'success': False, 'error': 'Event not found'}), 404
    return jsonify({'success': True, 'data': event})


@events_bp.route('/api/events', methods=['POST'])
def create_event():
    body = request.get_json(silent=True) or {}
    etype = body.get('type')
    if not etype:
        return jsonify({'success': False, 'error': 'Field "type" is required'}), 400

    type_meta = next((t for t in DETECTION_TYPES if t['type'] == etype), None)
    severity = body.get('severity') or (type_meta['severity'] if type_meta else 'MEDIUM')

    confidence = body.get('confidence')
    if confidence is None:
        confidence = round(random.uniform(72, 98), 1)

    bus_id = body.get('bus_id')
    route = body.get('route')
    location = body.get('location')
    latitude = body.get('latitude')
    longitude = body.get('longitude')

    if bus_id:
        bus = db.get_bus(bus_id)
        if bus:
            route = route or bus['route']
            location = location or bus['location']
            latitude = latitude if latitude is not None else bus['latitude']
            longitude = longitude if longitude is not None else bus['longitude']

    route = route or 'UNKNOWN'
    location = location or 'Unknown Location'
    latitude = latitude if latitude is not None else 0
    longitude = longitude if longitude is not None else 0
    bus_id = bus_id or 'BUS-UNKNOWN'

    event_id = 'EVT-' + str(int(datetime.utcnow().timestamp()))[-6:] + str(random.randint(10, 99))

    event = {
        'id': event_id,
        'type': etype,
        'severity': severity,
        'confidence': float(confidence),
        'bus_id': bus_id,
        'route': route,
        'location': location,
        'latitude': float(latitude),
        'longitude': float(longitude),
        'status': body.get('status') or 'Open',
        'vehicle_reg': body.get('vehicle_reg'),
        'camera_id': body.get('camera_id') or ('CAM-0' + str(random.randint(1, 4))),
        'timestamp': body.get('timestamp') or datetime.utcnow().isoformat(),
    }

    db.insert_event(event)

    try:
        from routes.stream import broadcast
        broadcast(event)
    except Exception as e:
        print('[stream] broadcast failed:', e)

    return jsonify({'success': True, 'data': event}), 201


@events_bp.route('/api/events/<event_id>', methods=['PATCH'])
def update_status(event_id):
    event = db.get_event(event_id)
    if not event:
        return jsonify({'success': False, 'error': 'Event not found'}), 404

    body = request.get_json(silent=True) or {}
    new_status = body.get('status')
    if not new_status:
        return jsonify({'success': False, 'error': 'Field "status" is required'}), 400

    valid = {'Open', 'Verified', 'Dispatched', 'Resolved', 'Dismissed'}
    if new_status not in valid:
        return jsonify({'success': False, 'error': 'Invalid status'}), 400

    db.update_event_status(event_id, new_status)
    return jsonify({'success': True, 'data': db.get_event(event_id)})


@events_bp.route('/api/events/<event_id>', methods=['DELETE'])
def remove_event(event_id):
    event = db.get_event(event_id)
    if not event:
        return jsonify({'success': False, 'error': 'Event not found'}), 404
    db.delete_event(event_id)
    return jsonify({'success': True, 'deleted': event_id})


@events_bp.route('/api/events/clear', methods=['POST'])
def clear_all():
    db.clear_events()
    return jsonify({'success': True, 'message': 'All events cleared'})


@events_bp.route('/api/events/stats', methods=['GET'])
def event_stats():
    counts = db.get_event_type_counts()
    stats = db.get_stats()
    return jsonify({'success': True, 'by_type': counts, 'summary': stats})


# =========================================================
# WORK ORDERS
# =========================================================

@events_bp.route('/api/events/<event_id>/work-order', methods=['POST'])
def create_work_order(event_id):
    event = db.get_event(event_id)
    if not event:
        return jsonify({'success': False, 'error': 'Event not found'}), 404

    body = request.get_json(silent=True) or {}
    department = body.get('department') or 'Road Department'
    priority = body.get('priority') or event.get('severity', 'MEDIUM')
    notes = body.get('notes') or ''

    wo_id = 'WO-' + str(int(datetime.utcnow().timestamp()))[-6:] + str(random.randint(10, 99))
    now = datetime.utcnow().isoformat()

    wo = {
        'id': wo_id,
        'event_id': event_id,
        'department': department,
        'priority': priority,
        'status': 'Assigned',
        'notes': notes,
        'created_at': now,
        'updated_at': now,
    }

    db.create_work_order(wo)
    db.update_event_status(event_id, 'Dispatched')

    try:
        from routes.stream import broadcast
        broadcast({
            'id': wo_id,
            'type': 'Work Order',
            'severity': priority,
            'bus_id': event.get('bus_id', 'SYSTEM'),
            'route': event.get('route', ''),
            'location': event.get('location', ''),
            'latitude': event.get('latitude', 0),
            'longitude': event.get('longitude', 0),
            'status': 'Assigned',
            'confidence': 100,
            'timestamp': now,
            'vehicle_reg': None,
            'camera_id': 'SYSTEM',
            'work_order': True,
        })
    except Exception:
        pass

    return jsonify({'success': True, 'data': wo}), 201


@events_bp.route('/api/events/<event_id>/work-orders', methods=['GET'])
def list_work_orders_for_event(event_id):
    orders = db.get_work_orders_for_event(event_id)
    return jsonify({'success': True, 'count': len(orders), 'data': orders})


@events_bp.route('/api/work-orders', methods=['GET'])
def list_all_work_orders():
    orders = db.get_all_work_orders()
    return jsonify({'success': True, 'count': len(orders), 'data': orders})


@events_bp.route('/api/work-orders/<wo_id>', methods=['PATCH'])
def update_wo_status(wo_id):
    wo = db.get_work_order(wo_id)
    if not wo:
        return jsonify({'success': False, 'error': 'Work order not found'}), 404

    body = request.get_json(silent=True) or {}
    new_status = body.get('status')
    if not new_status:
        return jsonify({'success': False, 'error': 'status required'}), 400

    db.update_work_order_status(wo_id, new_status)
    return jsonify({'success': True, 'data': db.get_work_order(wo_id)})