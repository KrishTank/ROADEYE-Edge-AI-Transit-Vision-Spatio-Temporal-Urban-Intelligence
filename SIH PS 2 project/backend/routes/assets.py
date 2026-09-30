"""
URBANSENSE AI — ASSETS API

Serves a manifest of available images and videos from assets/.
The frontend uses this to populate galleries, camera tiles, and demo uploads.

Endpoints:
  GET /api/assets/manifest          -> full manifest
  GET /api/assets/images/<category> -> images in a category
  GET /api/assets/videos/<cam>      -> videos for a camera type
  GET /api/assets/vehicles          -> vehicle data JSON
  GET /api/assets/file/<path>       -> serve a file
"""

from flask import Blueprint, jsonify, send_from_directory, abort
import os
import json

assets_bp = Blueprint('assets', __name__)

# Root of the assets folder (project_root/assets)
ASSETS_ROOT = os.path.abspath(
    os.path.join(os.path.dirname(__file__), '..', '..', 'assets')
)


# =========================================================
# HELPERS
# =========================================================

def _list_files(folder, extensions):
    """Returns sorted list of files in folder matching extensions."""
    path = os.path.join(ASSETS_ROOT, folder)
    if not os.path.isdir(path):
        return []
    try:
        names = os.listdir(path)
    except OSError:
        return []
    filtered = [
        n for n in names
        if n.lower().endswith(tuple(extensions))
        and not n.startswith('.')
    ]
    filtered.sort()
    return filtered


def _build_image_category(category):
    folder = 'images/' + category
    files = _list_files(folder, ('.jpg', '.jpeg', '.png', '.webp'))
    return {
        'category': category,
        'count': len(files),
        'files': [
            {
                'name': f,
                'url': '/api/assets/file/' + folder + '/' + f,
            }
            for f in files
        ],
    }


def _build_video_category(camera):
    folder = 'videos/' + camera
    files = _list_files(folder, ('.mp4', '.webm', '.mov'))
    return {
        'camera': camera,
        'count': len(files),
        'files': [
            {
                'name': f,
                'url': '/api/assets/file/' + folder + '/' + f,
            }
            for f in files
        ],
    }


# =========================================================
# MANIFEST
# =========================================================

@assets_bp.route('/api/assets/manifest', methods=['GET'])
def manifest():
    image_categories = [
        'pothole', 'road-crack', 'waterlogging',
        'traffic', 'pedestrian', 'vehicles', 'misc',
    ]
    video_categories = [
        'cam-front', 'cam-side-l', 'cam-side-r', 'cam-rear', 'misc',
    ]

    images = {c: _build_image_category(c) for c in image_categories}
    videos = {c: _build_video_category(c) for c in video_categories}

    total_images = sum(v['count'] for v in images.values())
    total_videos = sum(v['count'] for v in videos.values())

    return jsonify({
        'success': True,
        'total_images': total_images,
        'total_videos': total_videos,
        'images': images,
        'videos': videos,
        'assets_root_exists': os.path.isdir(ASSETS_ROOT),
    })


# =========================================================
# CATEGORY LISTS
# =========================================================

@assets_bp.route('/api/assets/images/<category>', methods=['GET'])
def list_image_category(category):
    return jsonify({
        'success': True,
        'data': _build_image_category(category),
    })


@assets_bp.route('/api/assets/videos/<camera>', methods=['GET'])
def list_video_category(camera):
    return jsonify({
        'success': True,
        'data': _build_video_category(camera),
    })


# =========================================================
# VEHICLE DATA
# =========================================================

@assets_bp.route('/api/assets/vehicles', methods=['GET'])
def vehicles():
    path = os.path.join(ASSETS_ROOT, 'data', 'vehicles.json')
    if not os.path.exists(path):
        return jsonify({
            'success': True,
            'data': [],
            'note': 'Place vehicles.json in assets/data/',
        })
    try:
        with open(path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        return jsonify({'success': True, 'data': data})
    except Exception as e:
        return jsonify({
            'success': False,
            'error': 'Failed to parse vehicles.json: ' + str(e),
        }), 500


# =========================================================
# SERVE FILES
# =========================================================

@assets_bp.route('/api/assets/file/<path:filepath>', methods=['GET'])
def serve_file(filepath):
    if not os.path.isdir(ASSETS_ROOT):
        abort(404)

    full = os.path.abspath(os.path.join(ASSETS_ROOT, filepath))
    if not full.startswith(ASSETS_ROOT):
        abort(403)

    directory = os.path.dirname(full)
    filename = os.path.basename(full)

    if not os.path.exists(full):
        abort(404)

    return send_from_directory(directory, filename)