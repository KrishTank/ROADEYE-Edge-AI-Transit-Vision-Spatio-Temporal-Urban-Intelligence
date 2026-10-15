"""
ROADEYE - AI ASSISTANT BLUEPRINT (RAVI)
Edge-AI Transit Vision & Spatio-Temporal Urban Intelligence
Real AI integration with Google Gemini & OpenAI models.
"""

from flask import Blueprint, jsonify, request
from datetime import datetime
import os
import re
import requests
import database as db

ai_bp = Blueprint('ai', __name__)

# =========================================================
# ENV LOADER (Zero-dependency .env reader)
# =========================================================

def _load_env():
    candidates = [
        os.path.join(os.path.dirname(__file__), '..', '.env'),
        os.path.join(os.path.dirname(__file__), '..', '..', '.env'),
        os.path.join(os.getcwd(), '.env'),
        os.path.join(os.getcwd(), 'backend', '.env')
    ]
    for p in candidates:
        if os.path.exists(p):
            try:
                with open(p, 'r', encoding='utf-8') as f:
                    for line in f:
                        line = line.strip()
                        if line and not line.startswith('#') and '=' in line:
                            k, v = line.split('=', 1)
                            k = k.strip()
                            v = v.strip().strip("'\"")
                            if k and k not in os.environ:
                                os.environ[k] = v
            except Exception:
                pass
            break

_load_env()


# =========================================================
# CONFIGURATION
# =========================================================

def get_ai_config():
    _load_env()
    gemini_key = os.environ.get('GEMINI_API_KEY') or os.environ.get('GOOGLE_API_KEY') or ''
    openai_key = os.environ.get('OPENAI_API_KEY') or ''

    # Filter out empty or placeholder strings
    if gemini_key and ('your_' in gemini_key.lower() or 'placeholder' in gemini_key.lower()):
        gemini_key = ''
    if openai_key and ('your_' in openai_key.lower() or 'placeholder' in openai_key.lower()):
        openai_key = ''

    if gemini_key:
        model = os.environ.get('GEMINI_MODEL', 'gemini-flash-lite-latest')
        return {
            'provider': 'Google Gemini',
            'model': model,
            'api_key': gemini_key,
            'configured': True
        }
    elif openai_key:
        model = os.environ.get('OPENAI_MODEL', 'gpt-4o-mini')
        return {
            'provider': 'OpenAI',
            'model': model,
            'api_key': openai_key,
            'configured': True
        }
    else:
        return {
            'provider': 'Google Gemini',
            'model': os.environ.get('GEMINI_MODEL', 'gemini-flash-lite-latest'),
            'api_key': '',
            'configured': False
        }


# =========================================================
# LIVE OPERATIONAL CONTEXT BUILDER
# =========================================================

def build_operational_context(user_message=''):
    """
    Builds a comprehensive, grounded, query-aware operational telemetry summary 
    from the live database, dynamically extracting targeted records based on 
    buses, routes, or defect types mentioned in the operator's query.
    """
    try:
        stats = db.get_stats()
        buses = db.get_all_buses()
        recent_events = db.get_all_events(limit=25)
        work_orders = db.get_all_work_orders(limit=10)
        zone_health = db.get_zone_health()
        type_counts = db.get_event_type_counts()
        route_summary = db.get_route_summary() if hasattr(db, 'get_route_summary') else []
        critical_events = db.get_critical_events(limit=10) if hasattr(db, 'get_critical_events') else []

        # 1. Format buses
        active_buses_list = []
        for b in buses:
            active_buses_list.append(
                f"- {b['id']} | Route: {b['route']} | Destination: {b['destination']} | "
                f"Location: {b['location']} (lat {b['latitude']:.4f}, lng {b['longitude']:.4f}) | "
                f"Speed: {b['speed']} km/h | Passengers: {b['passengers']}/{b['capacity']} | "
                f"Status: {b['status']} | Camera: {b['camera']}"
            )
        buses_str = "\n".join(active_buses_list) if active_buses_list else "No active buses found."

        # 2. Format Route Performance Corridor Matrix
        route_lines = []
        for r in route_summary:
            route_lines.append(
                f"- Route {r['route']}: Total Defects={r['total_events']} | Open={r['open_events']} | "
                f"Critical/High Hazards={r['critical_events']} | Avg AI Conf={r['avg_confidence']}%"
            )
        routes_str = "\n".join(route_lines) if route_lines else "No route summary available."

        # 3. Format Critical & High-Priority Alerts
        crit_lines = []
        for c in critical_events:
            crit_lines.append(
                f"- [{c['id']}] {c['type']} (SEVERITY: {c['severity']}, {c['confidence']}% conf) | "
                f"Bus {c['bus_id']} on {c['route']} near {c['location']} | Status: {c['status']} | Detected: {c['timestamp']}"
            )
        critical_str = "\n".join(crit_lines) if crit_lines else "No critical events pending."

        # 4. Format recent events sample
        events_list = []
        for e in recent_events[:10]:
            events_list.append(
                f"- [{e['id']}] {e['type']} ({e['severity']} severity, {e['confidence']}% conf) | "
                f"Bus: {e['bus_id']} on {e['route']} near {e['location']} | Status: {e['status']} | Time: {e['timestamp']}"
            )
        events_str = "\n".join(events_list) if events_list else "No recent events recorded."

        # 5. Format defect breakdown
        breakdown = ", ".join([f"{item['type']}: {item['count']}" for item in type_counts]) or "None"

        # 6. Format zone health
        zones_list = []
        for z in zone_health:
            zones_list.append(f"- {z['zone']}: Defects={z['defects']}, Critical={z['critical']}, Safety Score={z['score']}/100")
        zones_str = "\n".join(zones_list) if zones_list else "No zone data available."

        # 7. Format work orders
        wo_list = []
        for w in work_orders:
            wo_list.append(
                f"- [{w['id']}] Event: {w['event_id']} | Dept: {w['department']} | "
                f"Priority: {w['priority']} | Status: {w['status']} | Notes: {w.get('notes', 'N/A')}"
            )
        wo_str = "\n".join(wo_list) if wo_list else "No active work orders."

        # 8. Dynamic Intent-Aware Targeted Telemetry
        query_specific_sections = []
        if user_message:
            msg_upper = user_message.upper()

            # A. Bus matching (e.g. BUS-101 .. BUS-130)
            bus_matches = re.findall(r'\b(BUS-\d+)\b', msg_upper)
            for bid in set(bus_matches):
                if hasattr(db, 'get_bus_events_summary'):
                    bus_summary = db.get_bus_events_summary(bid)
                    if bus_summary.get('type_counts') or bus_summary.get('recent_events'):
                        type_str = ", ".join([f"{tc['type']}: {tc['count']}" for tc in bus_summary['type_counts']]) or "None"
                        rec_str = "; ".join([f"[{re_ev['id']}] {re_ev['type']} ({re_ev['severity']}, {re_ev['location']})" for re_ev in bus_summary['recent_events'][:5]])
                        query_specific_sections.append(
                            f"TARGETED TELEMETRY FOR {bid}:\n- Defect Types Captured: {type_str}\n- Recent Detections by {bid}: {rec_str}"
                        )

            # B. Route matching (e.g. R-03, R-17)
            route_matches = re.findall(r'\b(R-\d+)\b', msg_upper)
            for rid in set(route_matches):
                if hasattr(db, 'search_events'):
                    route_events = db.search_events(rid, limit=8)
                    if route_events:
                        r_lines = [f"[{re_ev['id']}] {re_ev['type']} ({re_ev['severity']}, Bus {re_ev['bus_id']}, {re_ev['location']})" for re_ev in route_events[:6]]
                        query_specific_sections.append(
                            f"TARGETED TELEMETRY FOR CORRIDOR {rid}:\n- Incidents on this route: " + "; ".join(r_lines)
                        )

            # C. Defect keyword matching
            defect_keywords = ['pothole', 'crack', 'waterlog', 'waterlogging', 'divider', 'sign', 'accident', 'garbage', 'rash', 'speed', 'zebra', 'light', 'signal']
            msg_lower = user_message.lower()
            for kw in defect_keywords:
                if kw in msg_lower and hasattr(db, 'search_events'):
                    kw_results = db.search_events(kw, limit=6)
                    if kw_results:
                        kw_lines = [f"[{k['id']}] {k['type']} ({k['severity']}, Route {k['route']}, Bus {k['bus_id']}, {k['location']})" for k in kw_results[:5]]
                        query_specific_sections.append(
                            f"TARGETED RECORDS FOR KEYWORD '{kw}':\n- Detections: " + "; ".join(kw_lines)
                        )
                        break  # Limit to 1 keyword to keep prompt focused

        query_specific_str = ("\n\n" + "\n\n".join(query_specific_sections)) if query_specific_sections else ""

        context = f"""
=== ROADEYE LIVE OPERATIONAL TELEMETRY (CURRENT TIME: {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S UTC')}) ===

1. FLEET STATUS:
- Total Fleet: {stats['fleet']['total']} buses ({stats['fleet']['active']} ACTIVE, {stats['fleet']['idle']} IDLE)
- Sensing Coverage: 100% optical bus cameras online
Active Sensing Units:
{buses_str}

2. ROUTE CORRIDOR PERFORMANCE MATRIX:
{routes_str}

3. ACTIVE CRITICAL & HIGH SEVERITY HAZARDS (IMMEDIATE INTERVENTION REQUIRED):
{critical_str}

4. AGGREGATE INCIDENT & ROAD INFRASTRUCTURE DETECTIONS:
- Total Events Logged: {stats['events']['total']}
- Open (Unresolved) Events: {stats['events']['open']}
- Critical / High Severity Events: {stats['events']['critical']}
- Average AI Detection Confidence: {stats['avg_confidence']}%
- Defect Type Breakdown: {breakdown}

Recent Detections Sample:
{events_str}

5. ZONE HEALTH & PAVEMENT INDICES:
{zones_str}

6. MUNICIPAL WORK ORDERS:
- Total Work Orders: {stats['work_orders']['total']}
Active Orders:
{wo_str}{query_specific_str}
=== END OF TELEMETRY ===
"""
        return context
    except Exception as e:
        return f"[Error assembling live telemetry: {str(e)}]"


# =========================================================
# SYSTEM INSTRUCTION
# =========================================================

SYSTEM_PROMPT = """You are RAVI (Road AI Vision Intelligence), the real-time AI Operations Assistant for the ROADEYE Edge-AI Transit Vision & Spatio-Temporal Urban Intelligence platform.

ROADEYE transforms public transport bus fleets into mobile edge sensing units equipped with cameras running computer vision models (such as YOLOv8) to detect road degradation (potholes, cracks, waterlogging), infrastructure hazards (missing signs, missing zebra crossings, damaged dividers), and traffic violations in real time.

Your role is to assist municipal road engineers, transit fleet managers, and civic command center operators by providing authoritative, context-aware operational intelligence.

Strict Guidelines:
1. GROUNDING: Ground your answers strictly in the LIVE OPERATIONAL TELEMETRY provided above. CITE exact Bus IDs (e.g., BUS-101), routes, zone names (e.g., Ring Road, Central Zone), event IDs, defect types, severity levels, and work order numbers.
2. HONESTY: Never fabricate incidents, buses, routes, or statistics. If a user asks about data that is not present in the telemetry (e.g. weather sensor readings, subway trains, historical records from 2020), explicitly state that this information is unavailable in current ROADEYE operational records.
3. DISTINCTION: Clearly distinguish verified system records from your own analytical recommendations or suggestions.
4. FORMATTING: Use crisp, well-structured Markdown. Use clear headings (###), bullet points, bold key metrics, and markdown tables where comparing multiple buses or routes. Keep your tone professional, concise, and focused on civic safety and fleet operations.
5. DESTRUCTIVE ACTIONS: You cannot modify records or execute destructive actions directly. Always advise operators on the proper municipal workflow.
"""


# =========================================================
# API ROUTES
# =========================================================

@ai_bp.route('/api/ai/status', methods=['GET'])
def ai_status():
    """Returns AI provider connection state and model name."""
    cfg = get_ai_config()
    return jsonify({
        'success': True,
        'configured': cfg['configured'],
        'provider': cfg['provider'],
        'model': cfg['model'],
        'status': 'online' if cfg['configured'] else 'unavailable',
        'message': (
            f"Connected to {cfg['provider']} ({cfg['model']})"
            if cfg['configured'] else
            "API key not configured. Add GEMINI_API_KEY in backend/.env to activate live operations intelligence."
        )
    })


@ai_bp.route('/api/ai/chat', methods=['POST'])
def ai_chat():
    """
    Handles user chat queries, injects live operational data,
    and calls the configured real AI model.
    """
    body = request.get_json(silent=True) or {}
    message = (body.get('message') or '').strip()
    history = body.get('history') or []

    # Validate message
    if not message:
        return jsonify({'success': False, 'error': 'Message content cannot be empty.'}), 400

    if len(message) > 2500:
        return jsonify({'success': False, 'error': 'Message exceeds maximum length (2500 characters).'}), 400

    cfg = get_ai_config()
    if not cfg['configured']:
        return jsonify({
            'success': False,
            'configured': False,
            'error': 'Gemini API key is not configured. Please set GEMINI_API_KEY in backend/.env to enable live AI responses.',
            'provider': cfg['provider'],
            'model': cfg['model']
        }), 200

    # Build fresh live context with query-aware targeting
    operational_context = build_operational_context(message)
    full_system_prompt = f"{SYSTEM_PROMPT}\n\n{operational_context}"

    try:
        if cfg['provider'] == 'Google Gemini':
            reply, used_model = _call_gemini(cfg['api_key'], cfg['model'], full_system_prompt, history, message)
        else:
            reply, used_model = _call_openai(cfg['api_key'], cfg['model'], full_system_prompt, history, message)

        return jsonify({
            'success': True,
            'reply': reply,
            'provider': cfg['provider'],
            'model': used_model,
            'timestamp': datetime.utcnow().isoformat()
        })

    except requests.exceptions.Timeout:
        return jsonify({
            'success': False,
            'error': 'AI request timed out. The model took too long to respond. Please try again.'
        }), 504
    except requests.exceptions.RequestException as e:
        return jsonify({
            'success': False,
            'error': f'Network error communicating with {cfg["provider"]}: {str(e)}'
        }), 502
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'AI Service error: {str(e)}'
        }), 500


# =========================================================
# PROVIDER IMPLEMENTATIONS
# =========================================================

def _call_gemini(api_key, model, system_prompt, history, user_message):
    """Invokes Google Gemini v1beta generateContent API with fallback resilience."""
    models_to_try = [model]
    for alt in ['gemini-flash-lite-latest', 'gemini-3.5-flash-lite', 'gemini-3.1-flash-lite', 'gemini-3.8-flash']:
        if alt not in models_to_try:
            models_to_try.append(alt)

    contents = []
    # Include up to last 10 history items
    for item in history[-10:]:
        role = item.get('role', 'user')
        text = item.get('content') or item.get('text') or ''
        if text:
            # Map role to Gemini expected: 'user' or 'model'
            gemini_role = 'model' if role in ('assistant', 'bot', 'model') else 'user'
            contents.append({
                'role': gemini_role,
                'parts': [{'text': text}]
            })

    # Add current user message
    contents.append({
        'role': 'user',
        'parts': [{'text': user_message}]
    })

    payload = {
        'system_instruction': {
            'parts': [{'text': system_prompt}]
        },
        'contents': contents,
        'generationConfig': {
            'temperature': 0.2,
            'maxOutputTokens': 2048,
        }
    }

    last_err = 'Gemini API call failed'
    for candidate in models_to_try:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{candidate}:generateContent?key={api_key}"
        try:
            res = requests.post(url, json=payload, timeout=18)
            if res.status_code == 200:
                data = res.json()
                candidates = data.get('candidates') or []
                if candidates:
                    parts = (candidates[0].get('content') or {}).get('parts') or []
                    if parts and 'text' in parts[0]:
                        return parts[0]['text'], candidate

            # Parse error
            try:
                err_json = res.json()
                if 'error' in err_json and 'message' in err_json['error']:
                    last_err = err_json['error']['message']
            except Exception:
                last_err = f"HTTP {res.status_code}: {res.text[:200]}"

            # If error is invalid key or bad payload, do not continue trying
            if res.status_code not in (404, 429, 503) and 'high demand' not in last_err.lower():
                break

        except requests.exceptions.Timeout:
            last_err = f"Request to {candidate} timed out."
            continue
        except Exception as e:
            last_err = str(e)
            continue

    raise RuntimeError(last_err)


def _call_openai(api_key, model, system_prompt, history, user_message):
    """Invokes OpenAI Chat Completions API."""
    url = "https://api.openai.com/v1/chat/completions"

    messages = [{'role': 'system', 'content': system_prompt}]

    for item in history[-10:]:
        role = item.get('role', 'user')
        text = item.get('content') or item.get('text') or ''
        if text:
            oa_role = 'assistant' if role in ('assistant', 'bot', 'model') else 'user'
            messages.append({'role': oa_role, 'content': text})

    messages.append({'role': 'user', 'content': user_message})

    payload = {
        'model': model,
        'messages': messages,
        'temperature': 0.2,
        'max_tokens': 2048
    }

    headers = {
        'Authorization': f'Bearer {api_key}',
        'Content-Type': 'application/json'
    }

    res = requests.post(url, json=payload, headers=headers, timeout=28)
    if res.status_code != 200:
        err_msg = 'OpenAI API call failed'
        try:
            err_json = res.json()
            if 'error' in err_json and 'message' in err_json['error']:
                err_msg = err_json['error']['message']
        except Exception:
            err_msg = f"HTTP {res.status_code}: {res.text[:200]}"
        raise RuntimeError(err_msg)

    data = res.json()
    choices = data.get('choices') or []
    if not choices:
        raise RuntimeError("No choices returned by OpenAI.")

    return choices[0].get('message', {}).get('content', ''), model
