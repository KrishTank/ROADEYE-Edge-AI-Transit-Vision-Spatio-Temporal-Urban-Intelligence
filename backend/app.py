"""
URBANSENSE AI — MAIN FLASK APPLICATION

Run:  python app.py
Open: http://localhost:5000
"""

from flask import Flask, jsonify, request
from flask_cors import CORS
from datetime import datetime
import time
import os

import database as db
import auto_generator
from routes.fleet import fleet_bp
from routes.events import events_bp
from routes.stats import stats_bp
from routes.scan import scan_bp
from routes.stream import stream_bp
from routes.gps import gps_bp, start_gps_mover, start_gps_broadcaster
from routes.assets import assets_bp
from routes.system import system_bp, log_request


# =========================================================
# CREATE APP
# =========================================================

app = Flask(__name__)

CORS(app, resources={r'/api/*': {'origins': '*'}})


# =========================================================
# REGISTER BLUEPRINTS
# =========================================================

app.register_blueprint(fleet_bp)
app.register_blueprint(events_bp)
app.register_blueprint(stats_bp)
app.register_blueprint(scan_bp)
app.register_blueprint(stream_bp)
app.register_blueprint(gps_bp)
app.register_blueprint(assets_bp)
app.register_blueprint(system_bp)


# =========================================================
# REQUEST LOGGER MIDDLEWARE
# =========================================================

@app.before_request
def _log_request_start():
    request._start_time = time.time()


@app.after_request
def _log_request_end(response):
    try:
        # Skip audit endpoint to avoid recursion
        if request.path.startswith('/api/system/audit'):
            return response
        log_request(
            method=request.method,
            path=request.path,
            status=response.status_code,
            ip=request.remote_addr or 'unknown',
            user_agent=request.headers.get('User-Agent', ''),
        )
    except Exception:
        pass
    return response


# =========================================================
# ROOT + HEALTH
# =========================================================

@app.route('/')
def root():
    return jsonify({
        'name': 'UrbanSense AI Backend',
        'version': '1.0.0',
        'status': 'online',
        'timestamp': datetime.utcnow().isoformat(),
        'endpoints': {
            'fleet':          '/api/fleet',
            'events':         '/api/events',
            'stats':          '/api/stats',
            'scan':           '/api/scan',
            'stream':         '/api/stream',
            'work_orders':    '/api/work-orders',
            'gps_stream':     '/api/gps/stream',
            'gps_current':    '/api/gps/current',
            'gps_routes':     '/api/gps/routes',
            'gps_landmarks':  '/api/gps/landmarks',
            'assets_manifest':'/api/assets/manifest',
            'system_health':  '/api/system/health',
            'system_security':'/api/system/security',
            'system_audit':   '/api/system/audit',
            'system_status':  '/api/system/status',
            'health':         '/api/health',
        },
    })


@app.route('/api/health')
def health():
    return jsonify({
        'success': True,
        'status': 'healthy',
        'database': {
            'fleet_count':      len(db.get_all_buses()),
            'event_count':      len(db.get_all_events(limit=999)),
            'work_order_count': len(db.get_all_work_orders()),
        },
        'timestamp': datetime.utcnow().isoformat(),
    })


# =========================================================
# ERROR HANDLERS
# =========================================================

@app.errorhandler(404)
def not_found(e):
    return jsonify({'success': False, 'error': 'Endpoint not found'}), 404


@app.errorhandler(500)
def server_error(e):
    return jsonify({'success': False, 'error': 'Internal server error'}), 500


# =========================================================
# ENTRY POINT
# =========================================================

if __name__ == '__main__':
    # Initialize database tables
    db.init_db()
    db.init_work_orders_table()

    fleet_count = len(db.get_all_buses())
    event_count = len(db.get_all_events(limit=999))
    wo_count = len(db.get_all_work_orders())

    print('=' * 60)
    print(' URBANSENSE AI - BACKEND RUNNING')
    print('=' * 60)
    print('  URL:         http://localhost:5000')
    print('  API:         http://localhost:5000/api')
    print('  Fleet:       ' + str(fleet_count) + ' buses')
    print('  Events:      ' + str(event_count))
    print('  Work Orders: ' + str(wo_count))
    print('=' * 60)

    # Start the auto event generator (creates detections every ~12s)
    auto_generator.start_background_generator()

    # Start GPS movement tracking (buses moving on real Bengaluru roads)
    start_gps_mover()
    start_gps_broadcaster()

    print('  Press Ctrl+C to stop')
    print('=' * 60)

    if fleet_count == 0:
        print()
        print('  [!] No data found. Run "python seed.py" first.')
        print()

    app.run(host='0.0.0.0', port=5000, debug=True, use_reloader=False)