from flask import Blueprint, jsonify, request
from datetime import datetime, timedelta
import random

import database as db

stats_bp = Blueprint('stats', __name__)


@stats_bp.route('/api/stats', methods=['GET'])
def dashboard_stats():
    return jsonify({
        'success': True,
        'data': db.get_stats(),
        'generated_at': datetime.utcnow().isoformat(),
    })


@stats_bp.route('/api/stats/types', methods=['GET'])
def events_by_type():
    counts = db.get_event_type_counts()
    total = sum(c['count'] for c in counts) or 1
    enriched = []
    for row in counts:
        enriched.append({
            'type': row['type'],
            'count': row['count'],
            'share': round(row['count'] / total * 100, 1),
        })
    return jsonify({'success': True, 'total': total, 'data': enriched})


@stats_bp.route('/api/stats/zones', methods=['GET'])
def zone_health():
    zones = db.get_zone_health()
    return jsonify({'success': True, 'count': len(zones), 'data': zones})


@stats_bp.route('/api/stats/timeline', methods=['GET'])
def timeline():
    try:
        hours = int(request.args.get('hours', 12))
    except (ValueError, TypeError):
        hours = 12

    events = db.get_all_events(limit=500)
    now = datetime.utcnow()
    buckets = []

    for i in range(hours - 1, -1, -1):
        bucket_start = now - timedelta(hours=i + 1)
        bucket_end = now - timedelta(hours=i)
        label = bucket_start.strftime('%H:00')
        count = sum(
            1 for e in events
            if bucket_start.isoformat() <= e['timestamp'] < bucket_end.isoformat()
        )
        buckets.append({'label': label, 'count': count})

    if all(b['count'] == 0 for b in buckets):
        base = [220, 180, 140, 260, 620, 780, 850, 620, 540, 810, 950, 720, 560, 420]
        for i, b in enumerate(buckets):
            b['count'] = base[i % len(base)] + random.randint(-40, 40)

    return jsonify({'success': True, 'hours': hours, 'data': buckets})


@stats_bp.route('/api/stats/vehicles', methods=['GET'])
def vehicle_classes():
    classes = [
        {'name': 'Cars', 'value': 48, 'color': '#4169E1'},
        {'name': 'Two Wheelers', 'value': 31, 'color': '#00E5FF'},
        {'name': 'Buses', 'value': 9, 'color': '#8B5CF6'},
        {'name': 'Trucks', 'value': 7, 'color': '#FFB300'},
        {'name': 'Other', 'value': 5, 'color': '#7A8BA5'},
    ]
    return jsonify({'success': True, 'data': classes})


@stats_bp.route('/api/stats/traffic-zones', methods=['GET'])
def traffic_zones():
    zones = [
        {'name': 'Central Zone', 'value': 78, 'vehicles': 1240, 'status': 'HIGH'},
        {'name': 'Ring Road', 'value': 65, 'vehicles': 980, 'status': 'HIGH'},
        {'name': 'Industrial Area', 'value': 43, 'vehicles': 710, 'status': 'MODERATE'},
        {'name': 'Airport Road', 'value': 28, 'vehicles': 420, 'status': 'LOW'},
        {'name': 'Main Road', 'value': 56, 'vehicles': 860, 'status': 'MODERATE'},
    ]
    return jsonify({'success': True, 'data': zones})


@stats_bp.route('/api/stats/summary', methods=['GET'])
def summary():
    return jsonify({
        'success': True,
        'kpis': db.get_stats(),
        'types': db.get_event_type_counts(),
        'zones': db.get_zone_health(),
        'generated_at': datetime.utcnow().isoformat(),
    })