import time
import config

# Lazily configure Gemini only if key is available
_model = None

def _get_model():
    global _model
    if _model is not None:
        return _model
    if not config.GEMINI_API_KEY:
        return None
    try:
        import google.generativeai as genai
        genai.configure(api_key=config.GEMINI_API_KEY)
        _model = genai.GenerativeModel('gemini-2.0-flash')
        return _model
    except Exception as e:
        print(f"[Gemini] Failed to initialize model: {e}")
        return None


def generate_playbook(alert: dict, attack_path: list) -> str:
    """
    Generate an AI playbook using Gemini.
    Returns the playbook text, or raises an exception that caller should handle.
    """
    model = _get_model()
    if not model:
        raise RuntimeError("Gemini model unavailable — API key not configured or invalid")

    path_str = ' → '.join(f"{s['id']} ({s['name']})" for s in attack_path) or 'Unknown'
    geo = alert.get('metadata', {}).get('geolocation') or 'Unknown location'
    source_file = alert.get('source_file', 'live simulation')

    prompt = f"""You are a senior SOC analyst. Generate an incident response playbook for this alert.

INCIDENT DATA:
- Alert Type: {alert.get('type')}
- Severity: {alert.get('severity')}
- Source IP: {alert.get('src_ip')} ({geo})
- Why Flagged: {alert.get('why_flagged')}
- Predicted Attack Path: {path_str}
- Correlated Multi-Vector: {alert.get('correlated', False)}
- Source Log File: {source_file}

RESPOND WITH EXACTLY THESE FOUR SECTIONS, no markdown, no preamble:

1. SUMMARY
[2 sentences specific to this IP, attack type, and geolocation]

2. NEXT MOVES
[What the attacker will do next based on the predicted path above. 2-3 sentences.]

3. IMMEDIATE ACTIONS
a) [action 1]
b) [action 2]
c) [action 3]
d) [action 4]

4. IOCs TO BLOCK
[List IPs, domains, hashes, or patterns to block immediately]

Be specific. Reference the actual IP address, attack type, and predicted next TTPs. Do NOT write generic advice."""

    response = model.generate_content(prompt)
    return response.text


def _rule_based_playbook(alert: dict, attack_path: list, reason: str = "") -> str:
    """Deterministic fallback playbook — no API required."""
    path_str = ' → '.join(f"{s['id']} ({s['name']})" for s in attack_path) if attack_path else 'Not predicted'
    src  = alert.get('src_ip', 'unknown')
    why  = alert.get('why_flagged', 'Suspicious activity detected')
    typ  = alert.get('type', 'Threat')
    sev  = alert.get('severity', 'High')
    port = alert.get('port', 'unknown')
    user = alert.get('user', 'unknown')

    note = f"\n[Note: Rule-based playbook — {reason}]" if reason else ""

    return (
        f"1. SUMMARY\n"
        f"{why}. {typ} incident ({sev} severity) from source {src} requires immediate containment.{note}\n\n"
        f"2. NEXT MOVES\n"
        f"Based on predicted path: {path_str}. Attacker may attempt lateral movement via port {port} "
        f"using compromised account \"{user}\".\n\n"
        f"3. IMMEDIATE ACTIONS\n"
        f"a) Block {src} at perimeter firewall and all edge devices immediately\n"
        f"b) Isolate affected endpoints and revoke active sessions\n"
        f"c) Rotate all credentials associated with account \"{user}\" and linked services\n"
        f"d) Notify SOC lead, open incident ticket, and escalate to IR team\n\n"
        f"4. IOCs TO BLOCK\n"
        f"IP: {src}\n"
        f"Port: {port}\n"
        f"User: {user}"
    )
