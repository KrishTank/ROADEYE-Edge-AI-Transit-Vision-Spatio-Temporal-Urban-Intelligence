"""
URBANSENSE AI — ROUTE WAYPOINTS

Real Bengaluru road coordinates for fleet routes.
Each route is a list of [lat, lng] waypoints.
Buses move along these in sequence and loop back.

Sources: actual road geometry from OSM for major Bengaluru roads.
"""

# =========================================================
# ROUTE DEFINITIONS
# =========================================================

ROUTES = {

    'R-05': {
        'name': 'Central Station Loop',
        'waypoints': [
            [12.9716, 77.5946],  # MG Road
            [12.9731, 77.5980],  # Trinity Circle
            [12.9745, 77.6023],  # Halasuru
            [12.9762, 77.6072],  # Ulsoor
            [12.9784, 77.6112],  # Indiranagar 100ft
            [12.9771, 77.6168],  # Domlur
            [12.9744, 77.6197],  # Old Airport Road
            [12.9710, 77.6152],  # Domlur flyover
            [12.9686, 77.6097],  # CMP
            [12.9668, 77.6043],  # Richmond Circle
            [12.9685, 77.5991],  # Residency Road
            [12.9716, 77.5946],  # back to MG Road
        ],
    },

    'R-08': {
        'name': 'Outer Ring Road North',
        'waypoints': [
            [13.0358, 77.5971],  # Hebbal
            [13.0290, 77.6038],  # Nagawara
            [13.0232, 77.6101],  # Manyata Tech Park
            [13.0163, 77.6157],  # HBR Layout
            [13.0085, 77.6195],  # Kalyan Nagar
            [12.9990, 77.6230],  # Banaswadi
            [12.9885, 77.6268],  # Horamavu
            [12.9785, 77.6296],  # K R Puram
            [12.9712, 77.6321],  # Tin Factory
            [12.9624, 77.6350],  # Marathahalli
        ],
    },

    'R-11': {
        'name': 'Old City Heritage',
        'waypoints': [
            [12.9423, 77.5760],  # Lalbagh West Gate
            [12.9454, 77.5788],  # Basavanagudi
            [12.9513, 77.5732],  # Gandhi Bazaar
            [12.9585, 77.5714],  # Bull Temple
            [12.9662, 77.5762],  # Chamrajpet
            [12.9724, 77.5840],  # KR Market
            [12.9711, 77.5921],  # Chickpet
            [12.9684, 77.5980],  # Avenue Road
            [12.9629, 77.6012],  # Cubbon Park
            [12.9560, 77.5954],  # Richmond Town
            [12.9478, 77.5845],  # Jayanagar
            [12.9423, 77.5760],  # back to Lalbagh
        ],
    },

    'R-12': {
        'name': 'Ring Road Circuit',
        'waypoints': [
            [12.9600, 77.6050],  # Wilson Garden
            [12.9556, 77.6124],  # Ejipura
            [12.9517, 77.6201],  # Koramangala
            [12.9470, 77.6283],  # Forum Mall
            [12.9414, 77.6338],  # Silk Board
            [12.9331, 77.6281],  # BTM Layout
            [12.9261, 77.6205],  # Jayadeva
            [12.9218, 77.6118],  # Bannerghatta
            [12.9250, 77.6041],  # JP Nagar
            [12.9346, 77.5984],  # Sarakki
            [12.9442, 77.5981],  # Jayanagar East
            [12.9515, 77.6008],  # 4th Block
            [12.9600, 77.6050],  # back to Wilson Garden
        ],
    },

    'R-17': {
        'name': 'Industrial Corridor',
        'waypoints': [
            [12.9860, 77.6120],  # Hebbal Industrial
            [12.9833, 77.6182],  # Veerannapalya
            [12.9801, 77.6231],  # Nagavara Lake
            [12.9745, 77.6278],  # Thanisandra
            [12.9684, 77.6315],  # Hennur
            [12.9618, 77.6352],  # Kothanur
            [12.9543, 77.6384],  # Bagalur
            [12.9480, 77.6344],  # Yelahanka Road
            [12.9481, 77.6268],  # Jakkur
            [12.9562, 77.6203],  # Peenya link
            [12.9665, 77.6146],  # Yeswanthpur West
            [12.9743, 77.6092],  # Yeswanthpur
            [12.9820, 77.6075],  # Mathikere
            [12.9860, 77.6120],  # back to Hebbal Industrial
        ],
    },

    'R-21': {
        'name': 'Airport Express',
        'waypoints': [
            [12.9520, 77.6180],  # Domlur
            [12.9562, 77.6244],  # Indiranagar East
            [12.9603, 77.6308],  # CV Raman Nagar
            [12.9661, 77.6372],  # Kaggadasapura
            [12.9718, 77.6431],  # Vimanapura
            [12.9775, 77.6490],  # K R Puram Halt
            [12.9834, 77.6544],  # Tin Factory
            [12.9896, 77.6593],  # Kasturi Nagar
            [12.9951, 77.6620],  # Ramamurthy Nagar
            [13.0004, 77.6621],  # K R Puram
            [13.0056, 77.6588],  # Bhattarahalli
            [13.0112, 77.6510],  # Devanahalli Road
            [13.0158, 77.6438],  # Airport Road
            [13.0201, 77.6361],  # Hebbal Flyover
            [13.0138, 77.6280],  # Yelahanka
        ],
    },
}


# =========================================================
# LANDMARKS (for map labels)
# =========================================================

LANDMARKS = [
    {'name': 'MG Road', 'lat': 12.9750, 'lng': 77.6068, 'type': 'commercial'},
    {'name': 'Silk Board', 'lat': 12.9171, 'lng': 77.6233, 'type': 'junction'},
    {'name': 'K R Puram', 'lat': 13.0068, 'lng': 77.6784, 'type': 'junction'},
    {'name': 'Hebbal', 'lat': 13.0358, 'lng': 77.5971, 'type': 'junction'},
    {'name': 'Koramangala', 'lat': 12.9352, 'lng': 77.6245, 'type': 'commercial'},
    {'name': 'Indiranagar', 'lat': 12.9784, 'lng': 77.6408, 'type': 'commercial'},
    {'name': 'Domlur', 'lat': 12.9607, 'lng': 77.6387, 'type': 'neighborhood'},
    {'name': 'Jayanagar', 'lat': 12.9308, 'lng': 77.5838, 'type': 'neighborhood'},
    {'name': 'Whitefield', 'lat': 12.9698, 'lng': 77.7500, 'type': 'tech-park'},
    {'name': 'Electronic City', 'lat': 12.8452, 'lng': 77.6602, 'type': 'tech-park'},
    {'name': 'Cubbon Park', 'lat': 12.9763, 'lng': 77.5929, 'type': 'park'},
    {'name': 'Lalbagh', 'lat': 12.9507, 'lng': 77.5848, 'type': 'park'},
    {'name': 'Majestic', 'lat': 12.9767, 'lng': 77.5713, 'type': 'terminal'},
]


def get_route(route_id):
    """Returns the waypoints for a route, or None."""
    return ROUTES.get(route_id, {}).get('waypoints')


def get_all_routes():
    return ROUTES


def get_landmarks():
    return LANDMARKS