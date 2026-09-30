import random
from datetime import datetime, timedelta
import database as db

DEFAULT_FLEET = [
    {'id': 'BUS-101', 'route': 'R-05', 'destination': 'Central Station', 'location': 'Central Zone', 'latitude': 12.9716, 'longitude': 77.5946, 'speed': 42, 'passengers': 38, 'capacity': 60, 'progress': 64, 'status': 'ACTIVE', 'camera': 'ONLINE'},
    {'id': 'BUS-104', 'route': 'R-12', 'destination': 'Ring Road Terminal', 'location': 'Ring Road', 'latitude': 12.9600, 'longitude': 77.6050, 'speed': 31, 'passengers': 51, 'capacity': 60, 'progress': 72, 'status': 'ACTIVE', 'camera': 'ONLINE'},
    {'id': 'BUS-109', 'route': 'R-08', 'destination': 'Main Terminal', 'location': 'Main Road', 'latitude': 12.9800, 'longitude': 77.5820, 'speed': 27, 'passengers': 42, 'capacity': 55, 'progress': 48, 'status': 'ACTIVE', 'camera': 'ONLINE'},
    {'id': 'BUS-112', 'route': 'R-03', 'destination': 'City Depot', 'location': 'Central Depot', 'latitude': 12.9630, 'longitude': 77.5860, 'speed': 0, 'passengers': 0, 'capacity': 55, 'progress': 0, 'status': 'IDLE', 'camera': 'ONLINE'},
    {'id': 'BUS-118', 'route': 'R-17', 'destination': 'Industrial Area', 'location': 'Industrial Area', 'latitude': 12.9860, 'longitude': 77.6120, 'speed': 19, 'passengers': 54, 'capacity': 60, 'progress': 81, 'status': 'ACTIVE', 'camera': 'ONLINE'},
    {'id': 'BUS-121', 'route': 'R-21', 'destination': 'Airport Road', 'location': 'Airport Road', 'latitude': 12.9520, 'longitude': 77.6180, 'speed': 35, 'passengers': 46, 'capacity': 60, 'progress': 39, 'status': 'ACTIVE', 'camera': 'ONLINE'},
    {'id': 'BUS-125', 'route': 'R-11', 'destination': 'Old City', 'location': 'Old City', 'latitude': 12.9680, 'longitude': 77.6080, 'speed': 22, 'passengers': 34, 'capacity': 55, 'progress': 55, 'status': 'ACTIVE', 'camera': 'ONLINE'},
    {'id': 'BUS-130', 'route': 'R-07', 'destination': 'North Terminal', 'location': 'North Zone', 'latitude': 13.0000, 'longitude': 77.5940, 'speed': 0, 'passengers': 0, 'capacity': 60, 'progress': 0, 'status': 'IDLE', 'camera': 'ONLINE'},
]

DETECTION_TYPES = [
    {'type': 'Pothole', 'severity': 'HIGH'},
    {'type': 'Road Crack', 'severity': 'MEDIUM'},
    {'type': 'Waterlogging', 'severity': 'HIGH'},
    {'type': 'Missing Divider', 'severity': 'MEDIUM'},
    {'type': 'Missing Sign', 'severity': 'MEDIUM'},
    {'type': 'Missing Zebra', 'severity': 'LOW'},
    {'type': 'Pedestrian', 'severity': 'HIGH'},
    {'type': 'Rash Driving', 'severity': 'CRITICAL'},
    {'type': 'Traffic Sign', 'severity': 'LOW'},
    {'type': 'Traffic Density', 'severity': 'MEDIUM'},
]

SEED_ZONES = [
    {'name': 'Central Zone', 'lat': 12.9716, 'lng': 77.5946},
    {'name': 'Ring Road', 'lat': 12.9600, 'lng': 77.6050},
    {'name': 'Industrial Area', 'lat': 12.9860, 'lng': 77.6120},
    {'name': 'Airport Road', 'lat': 12.9520, 'lng': 77.6180},
    {'name': 'Main Road', 'lat': 12.9800, 'lng': 77.5820},
    {'name': 'North Zone', 'lat': 13.0000, 'lng': 77.5940},
]


_event_counter = [0]


def make_event_id():
    _event_counter[0] += 1
    return 'EVT-' + str(int(datetime.utcnow().timestamp()))[-6:] + str(_event_counter[0]).zfill(3)


def generate_plate():
    return (
        'KA' + str(random.randint(10, 99)) +
        chr(random.randint(65, 90)) + chr(random.randint(65, 90)) +
        str(random.randint(1000, 9999))
    )


def seed_fleet():
    print('[seed] Inserting fleet...')
    for bus in DEFAULT_FLEET:
        db.insert_bus(bus)
    print('[seed] Fleet count: ' + str(len(db.get_all_buses())))


def seed_events(count=55):
    print('[seed] Generating ' + str(count) + ' historical events...')
    fleet = db.get_all_buses()
    if not fleet:
        print('[seed] ERROR: No fleet.')
        return
    now = datetime.utcnow()
    for i in range(count):
        detection = random.choice(DETECTION_TYPES)
        zone = random.choice(SEED_ZONES)
        bus = random.choice(fleet)
        hours_ago = random.uniform(0, 48)
        timestamp = (now - timedelta(hours=hours_ago)).isoformat()
        lat = zone['lat'] + (random.random() - 0.5) * 0.012
        lng = zone['lng'] + (random.random() - 0.5) * 0.012
        r = random.random()
        status = 'Open' if r < 0.70 else ('Verified' if r < 0.90 else 'Resolved')
        confidence = round(random.uniform(78, 97), 1)
        severity = detection['severity']
        if detection['type'] == 'Rash Driving' and random.random() < 0.4:
            severity = 'CRITICAL'
        vehicle_reg = None
        if detection['type'] == 'Rash Driving':
            vehicle_reg = generate_plate()
        event = {
            'id': make_event_id(),
            'type': detection['type'],
            'severity': severity,
            'confidence': confidence,
            'bus_id': bus['id'],
            'route': bus['route'],
            'location': zone['name'],
            'latitude': round(lat, 6),
            'longitude': round(lng, 6),
            'status': status,
            'vehicle_reg': vehicle_reg,
            'camera_id': 'CAM-0' + str(random.randint(1, 4)),
            'timestamp': timestamp,
        }
        db.insert_event(event)
    print('[seed] Total events in DB: ' + str(len(db.get_all_events(limit=999))))


if __name__ == '__main__':
    print('=' * 55)
    print(' URBANSENSE AI - SEEDING DATABASE')
    print('=' * 55)
    db.init_db()
    db.clear_events()
    print('[seed] Cleared existing events.')
    seed_fleet()
    seed_events(55)
    print('=' * 55)
    print(' Done. Run: python app.py')
    print('=' * 55)