"""
URBANSENSE AI - DATABASE LAYER
SQLite with fleet, events, and work_orders tables.
"""

import sqlite3
import os
from datetime import datetime

DB_PATH = os.path.join(os.path.dirname(__file__), 'urbansense.db')


# =========================================================
# CONNECTION
# =========================================================

def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


# =========================================================
# SCHEMA INIT
# =========================================================

def init_db():
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute('''
        CREATE TABLE IF NOT EXISTS fleet (
            id           TEXT PRIMARY KEY,
            route        TEXT NOT NULL,
            destination  TEXT NOT NULL,
            location     TEXT NOT NULL,
            latitude     REAL NOT NULL,
            longitude    REAL NOT NULL,
            speed        REAL NOT NULL DEFAULT 0,
            passengers   INTEGER NOT NULL DEFAULT 0,
            capacity     INTEGER NOT NULL DEFAULT 60,
            progress     INTEGER NOT NULL DEFAULT 0,
            status       TEXT NOT NULL DEFAULT 'ACTIVE',
            camera       TEXT NOT NULL DEFAULT 'ONLINE',
            last_update  TEXT NOT NULL
        )
    ''')

    cursor.execute('''
        CREATE TABLE IF NOT EXISTS events (
            id           TEXT PRIMARY KEY,
            type         TEXT NOT NULL,
            severity     TEXT NOT NULL,
            confidence   REAL NOT NULL,
            bus_id       TEXT NOT NULL,
            route        TEXT NOT NULL,
            location     TEXT NOT NULL,
            latitude     REAL NOT NULL,
            longitude    REAL NOT NULL,
            status       TEXT NOT NULL DEFAULT 'Open',
            vehicle_reg  TEXT,
            camera_id    TEXT,
            timestamp    TEXT NOT NULL
        )
    ''')

    cursor.execute('CREATE INDEX IF NOT EXISTS idx_events_timestamp ON events(timestamp DESC)')
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_events_status ON events(status)')
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_events_type ON events(type)')
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_events_bus ON events(bus_id)')

    conn.commit()
    conn.close()


def init_work_orders_table():
    """Creates the work_orders table if it doesn't exist."""
    conn = get_connection()
    conn.execute('''
        CREATE TABLE IF NOT EXISTS work_orders (
            id            TEXT PRIMARY KEY,
            event_id      TEXT NOT NULL,
            department    TEXT NOT NULL,
            priority      TEXT NOT NULL,
            status        TEXT NOT NULL DEFAULT 'Assigned',
            notes         TEXT,
            created_at    TEXT NOT NULL,
            updated_at    TEXT NOT NULL
        )
    ''')
    conn.execute('CREATE INDEX IF NOT EXISTS idx_wo_event ON work_orders(event_id)')
    conn.execute('CREATE INDEX IF NOT EXISTS idx_wo_status ON work_orders(status)')
    conn.commit()
    conn.close()


# =========================================================
# FLEET
# =========================================================

def get_all_buses():
    conn = get_connection()
    rows = conn.execute('SELECT * FROM fleet ORDER BY id').fetchall()
    conn.close()
    return [dict(row) for row in rows]


def get_bus(bus_id):
    conn = get_connection()
    row = conn.execute('SELECT * FROM fleet WHERE id = ?', (bus_id,)).fetchone()
    conn.close()
    return dict(row) if row else None


def insert_bus(bus):
    conn = get_connection()
    conn.execute('''
        INSERT OR IGNORE INTO fleet
        (id, route, destination, location, latitude, longitude,
         speed, passengers, capacity, progress, status, camera, last_update)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (
        bus['id'], bus['route'], bus['destination'], bus['location'],
        bus['latitude'], bus['longitude'], bus['speed'], bus['passengers'],
        bus['capacity'], bus['progress'], bus['status'], bus['camera'],
        bus.get('last_update', datetime.utcnow().isoformat()),
    ))
    conn.commit()
    conn.close()


def update_bus(bus_id, patch):
    if not patch:
        return
    fields = []
    values = []
    for key, value in patch.items():
        fields.append(key + ' = ?')
        values.append(value)
    fields.append('last_update = ?')
    values.append(datetime.utcnow().isoformat())
    values.append(bus_id)
    query = 'UPDATE fleet SET ' + ', '.join(fields) + ' WHERE id = ?'
    conn = get_connection()
    conn.execute(query, values)
    conn.commit()
    conn.close()


# =========================================================
# EVENTS
# =========================================================

def get_all_events(limit=100):
    conn = get_connection()
    rows = conn.execute(
        'SELECT * FROM events ORDER BY timestamp DESC LIMIT ?',
        (limit,)
    ).fetchall()
    conn.close()
    return [dict(row) for row in rows]


def get_event(event_id):
    conn = get_connection()
    row = conn.execute('SELECT * FROM events WHERE id = ?', (event_id,)).fetchone()
    conn.close()
    return dict(row) if row else None


def insert_event(event):
    conn = get_connection()
    conn.execute('''
        INSERT INTO events
        (id, type, severity, confidence, bus_id, route, location,
         latitude, longitude, status, vehicle_reg, camera_id, timestamp)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (
        event['id'], event['type'], event['severity'], event['confidence'],
        event['bus_id'], event['route'], event['location'],
        event['latitude'], event['longitude'], event['status'],
        event.get('vehicle_reg'), event.get('camera_id'),
        event.get('timestamp', datetime.utcnow().isoformat()),
    ))
    conn.commit()
    conn.close()
    return event


def update_event_status(event_id, new_status):
    conn = get_connection()
    conn.execute('UPDATE events SET status = ? WHERE id = ?', (new_status, event_id))
    conn.commit()
    conn.close()


def delete_event(event_id):
    conn = get_connection()
    conn.execute('DELETE FROM events WHERE id = ?', (event_id,))
    conn.commit()
    conn.close()


def clear_events():
    conn = get_connection()
    conn.execute('DELETE FROM events')
    conn.commit()
    conn.close()


# =========================================================
# STATS
# =========================================================

def get_stats():
    conn = get_connection()
    total_buses = conn.execute('SELECT COUNT(*) FROM fleet').fetchone()[0]
    active_buses = conn.execute("SELECT COUNT(*) FROM fleet WHERE status = 'ACTIVE'").fetchone()[0]
    total_events = conn.execute('SELECT COUNT(*) FROM events').fetchone()[0]
    open_events = conn.execute("SELECT COUNT(*) FROM events WHERE status != 'Resolved'").fetchone()[0]
    critical_events = conn.execute("SELECT COUNT(*) FROM events WHERE severity IN ('HIGH', 'CRITICAL')").fetchone()[0]
    avg_conf = conn.execute('SELECT AVG(confidence) FROM events').fetchone()[0] or 0
    total_work_orders = conn.execute('SELECT COUNT(*) FROM work_orders').fetchone()[0]
    conn.close()
    return {
        'fleet': {'total': total_buses, 'active': active_buses, 'idle': total_buses - active_buses},
        'events': {'total': total_events, 'open': open_events, 'critical': critical_events},
        'work_orders': {'total': total_work_orders},
        'avg_confidence': round(avg_conf, 1),
    }


def get_event_type_counts():
    conn = get_connection()
    rows = conn.execute('SELECT type, COUNT(*) as count FROM events GROUP BY type ORDER BY count DESC').fetchall()
    conn.close()
    return [{'type': r['type'], 'count': r['count']} for r in rows]


def get_zone_health():
    ZONES = [
        {'name': 'Central Zone', 'minLat': 12.9600, 'maxLat': 12.9800, 'minLng': 77.5850, 'maxLng': 77.6050},
        {'name': 'Ring Road', 'minLat': 12.9500, 'maxLat': 12.9680, 'minLng': 77.6000, 'maxLng': 77.6180},
        {'name': 'Industrial Area', 'minLat': 12.9800, 'maxLat': 13.0000, 'minLng': 77.6050, 'maxLng': 77.6200},
        {'name': 'Airport Road', 'minLat': 12.9400, 'maxLat': 12.9600, 'minLng': 77.6100, 'maxLng': 77.6300},
        {'name': 'Main Road', 'minLat': 12.9750, 'maxLat': 12.9900, 'minLng': 77.5750, 'maxLng': 77.5900},
        {'name': 'North Zone', 'minLat': 12.9900, 'maxLat': 13.0100, 'minLng': 77.5850, 'maxLng': 77.6050},
    ]
    WEIGHTS = {
        'Pothole': 3, 'Road Crack': 2, 'Waterlogging': 3,
        'Missing Divider': 2, 'Missing Sign': 2,
        'Missing Zebra': 1, 'Damaged Road': 3,
    }
    conn = get_connection()
    all_events = [dict(r) for r in conn.execute('SELECT * FROM events').fetchall()]
    conn.close()
    result = []
    for zone in ZONES:
        defects_in_zone = [
            e for e in all_events
            if (e['latitude'] is not None and e['longitude'] is not None and
                zone['minLat'] <= e['latitude'] <= zone['maxLat'] and
                zone['minLng'] <= e['longitude'] <= zone['maxLng'] and
                e['type'] in WEIGHTS)
        ]
        weight_sum = sum(WEIGHTS[e['type']] for e in defects_in_zone)
        score = max(0, 100 - min(80, weight_sum * 4))
        critical = sum(1 for e in defects_in_zone if e['severity'] in ('HIGH', 'CRITICAL'))
        result.append({
            'zone': zone['name'],
            'defects': len(defects_in_zone),
            'critical': critical,
            'score': score,
        })
    return result


# =========================================================
# WORK ORDERS
# =========================================================

def create_work_order(wo):
    conn = get_connection()
    conn.execute('''
        INSERT INTO work_orders
        (id, event_id, department, priority, status, notes, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ''', (
        wo['id'], wo['event_id'], wo['department'], wo['priority'],
        wo['status'], wo.get('notes'), wo['created_at'], wo['updated_at'],
    ))
    conn.commit()
    conn.close()
    return wo


def get_all_work_orders(limit=100):
    conn = get_connection()
    rows = conn.execute(
        'SELECT * FROM work_orders ORDER BY created_at DESC LIMIT ?',
        (limit,)
    ).fetchall()
    conn.close()
    return [dict(r) for r in rows]


def get_work_order(wo_id):
    conn = get_connection()
    row = conn.execute('SELECT * FROM work_orders WHERE id = ?', (wo_id,)).fetchone()
    conn.close()
    return dict(row) if row else None


def get_work_orders_for_event(event_id):
    conn = get_connection()
    rows = conn.execute(
        'SELECT * FROM work_orders WHERE event_id = ? ORDER BY created_at DESC',
        (event_id,)
    ).fetchall()
    conn.close()
    return [dict(r) for r in rows]


def update_work_order_status(wo_id, status):
    conn = get_connection()
    conn.execute(
        'UPDATE work_orders SET status = ?, updated_at = ? WHERE id = ?',
        (status, datetime.utcnow().isoformat(), wo_id)
    )
    conn.commit()
    conn.close()


# =========================================================
# SELF-TEST
# =========================================================

if __name__ == '__main__':
    print('[UrbanSense] Initializing database...')
    init_db()
    init_work_orders_table()
    print('[UrbanSense] DB file: ' + DB_PATH)
    print('[UrbanSense] Fleet count: ' + str(len(get_all_buses())))
    print('[UrbanSense] Event count: ' + str(len(get_all_events())))
    print('[UrbanSense] Work order count: ' + str(len(get_all_work_orders())))
    print('[UrbanSense] Database layer OK.')