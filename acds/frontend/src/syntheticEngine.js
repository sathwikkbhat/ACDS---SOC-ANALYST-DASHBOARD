/**
 * ACDS Synthetic Data Engine
 * Generates realistic security alerts entirely in the browser.
 * Used when the backend is not reachable (e.g. Vercel-only deployment).
 */

const SEVERITIES = ['Critical', 'Critical', 'High', 'High', 'High', 'Medium', 'Medium', 'Low'];
const TYPES      = ['BruteForce', 'C2Beacon', 'Exfiltration', 'LateralMovement', 'Correlated'];
const TACTICS    = ['CredentialAccess', 'CommandAndControl', 'Exfiltration', 'LateralMovement', 'Persistence'];
const TECHNIQUES = ['T1110', 'T1071', 'T1048', 'T1021', 'T1190', 'T1059', 'T1133'];

const SRC_IPS = [
  '185.220.101.45', '45.33.32.156', '198.199.85.1', '104.131.64.11',
  '91.108.4.202', '103.21.244.0', '162.158.0.1', '10.0.0.45',
  '192.168.1.100', '172.16.10.5', '203.0.113.42', '198.51.100.88',
  '5.188.206.14', '77.88.55.66', '185.130.44.108', '94.102.49.190',
  '89.248.165.30', '45.153.160.2', '193.106.30.98', '178.73.215.171',
];

const DST_IPS = [
  '10.0.0.1', '10.0.0.2', '10.0.0.10', '172.16.0.1',
  '192.168.1.1', '192.168.1.5', '192.168.1.20', '10.10.10.1',
];

const USERS = ['admin', 'root', 'svc-account', 'john.doe', 'deploy-bot', 'SYSTEM', 'backup_user', 'api-key'];

let idCounter = 1;

function rand(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function randBytes() { return randInt(500, 15_000_000); }

function generateAlert(offsetMs = 0) {
  const severity = rand(SEVERITIES);
  const type     = rand(TYPES);
  const id       = `SYNTH-${String(idCounter++).padStart(6, '0')}`;
  const ts       = new Date(Date.now() - offsetMs).toISOString();
  const isFP     = Math.random() < 0.22;
  const isCorr   = type === 'Correlated' || Math.random() < 0.12;

  return {
    alert_id: id,
    timestamp: ts,
    type,
    severity,
    src_ip: rand(SRC_IPS),
    dst_ip: rand(DST_IPS),
    user: rand(USERS),
    port: rand([22, 80, 443, 3306, 3389, 8080, 21, 25, 445, 8443]),
    bytes_sent: type === 'Exfiltration' ? randBytes() : randInt(64, 2048),
    attempts: type === 'BruteForce' ? randInt(5, 200) : undefined,
    interval: type === 'C2Beacon' ? (randInt(280, 320) / 10) : undefined,
    false_positive: isFP,
    correlated: isCorr,
    confidence: randInt(60, 100),
    technique: rand(TECHNIQUES),
    tactic: rand(TACTICS),
    playbook: null,
    description: `${type} detected from ${rand(SRC_IPS)} — confidence ${randInt(60, 100)}%`,
  };
}

/**
 * Generate N alerts spread over the last `spanHours` hours.
 */
export function generateBatch(count = 5000, spanHours = 72) {
  const spanMs = spanHours * 60 * 60 * 1000;
  const alerts = [];
  for (let i = 0; i < count; i++) {
    const offsetMs = Math.random() * spanMs;
    alerts.push(generateAlert(offsetMs));
  }
  // Sort newest first
  alerts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  return alerts;
}

/**
 * Compute stats from an alert array.
 */
export function computeStats(alerts) {
  return {
    total           : alerts.length,
    critical        : alerts.filter(a => a.severity === 'Critical').length,
    high            : alerts.filter(a => a.severity === 'High').length,
    false_positives : alerts.filter(a => a.false_positive).length,
    correlated      : alerts.filter(a => a.correlated).length,
    monitor         : { running: true, mode: 'synthetic' },
  };
}

/**
 * Drip one random new alert (for live streaming simulation).
 */
export function generateLiveAlert() {
  return generateAlert(randInt(0, 3000));
}

/**
 * Generate a highly realistic simulated Gemini AI playbook on the frontend.
 */
export function generateClientPlaybook(alert) {
  const type = alert.type || 'Threat';
  const src = alert.src_ip || 'Unknown';
  const dst = alert.dst_ip || 'Internal';
  const why = alert.why_flagged || 'Suspicious activity detected.';
  const user = alert.user || 'Unknown';
  const port = alert.port || 'Unknown';
  const technique = alert.technique || 'T1000';
  const tactic = alert.tactic || 'Unknown';

  return `1. SUMMARY
Critical security incident detected. A potential ${type} attack is originating from source IP ${src} targeting node ${dst}. Active indicator: ${why}.

2. NEXT MOVES
Based on MITRE ATT&CK technique ${technique} (${tactic}), the threat actor will likely attempt credential escalation or lateral movement via port ${port} using account "${user}".

3. IMMEDIATE ACTIONS
a) Block source IP ${src} at the perimeter firewall immediately.
b) Isolate target host ${dst} from the active network segment.
c) Terminate session and rotate credentials for user account "${user}".
d) Trigger immediate endpoint verification scans and review active TCP connections.

4. IOCs TO BLOCK
IP: ${src} (Attacker)
Target: ${dst}
Port: ${port}
Technique: ${technique}`;
}

