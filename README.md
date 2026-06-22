<div align="center">

<img src="https://img.shields.io/badge/ACDS-AI%20Cyber%20Defense%20System-00ff88?style=for-the-badge&logo=shield&logoColor=black" />

<br />

```
 █████╗  ██████╗██████╗ ███████╗
██╔══██╗██╔════╝██╔══██╗██╔════╝
███████║██║     ██║  ██║███████╗
██╔══██║██║     ██║  ██║╚════██║
██║  ██║╚██████╗██████╔╝███████║
╚═╝  ╚═╝ ╚═════╝╚═════╝ ╚══════╝
```

**AI-Powered Cyber Defense System** — Real-time threat detection, MITRE ATT&CK mapping, and AI-generated incident response playbooks.

<br />

![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?style=flat-square&logo=fastapi&logoColor=white)
![React](https://img.shields.io/badge/React-19-61dafb?style=flat-square&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-8-646cff?style=flat-square&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8?style=flat-square&logo=tailwindcss&logoColor=white)
![Python](https://img.shields.io/badge/Python-3.12-3776ab?style=flat-square&logo=python&logoColor=white)
![Gemini](https://img.shields.io/badge/Gemini%20AI-2.0%20Flash-8e75b2?style=flat-square&logo=google&logoColor=white)

<br />

[🚀 Live Demo](#-live-demo) · [⚡ Quick Start](#-quick-start) · [🧠 Features](#-features) · [📦 Tech Stack](#-tech-stack) · [🌐 Deploy to Vercel](#-deploy-to-vercel)

</div>

---

## 🧠 What is ACDS?

**ACDS (AI Cyber Defense System)** is a high-fidelity, production-grade SOC (Security Operations Center) dashboard that ingests, normalizes, detects, and responds to security threats in real-time.

It combines a **FastAPI** backend with a **React** frontend to deliver a full security intelligence platform — complete with a live 3D globe threat map, MITRE ATT&CK coverage matrix, AI-generated playbooks (via **Google Gemini**), and real-time WebSocket streaming.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🔴 **Real-Time Threat Detection** | Live WebSocket stream of security alerts — brute force, C2 beacon, exfiltration, correlated multi-vector attacks |
| 🌍 **3D Interactive Globe** | Animated globe showing attack origin countries with live IP geolocation |
| 🤖 **AI Playbooks (Gemini)** | One-click AI-generated incident response playbooks for Critical alerts using Google Gemini 2.0 Flash |
| 🗺️ **MITRE ATT&CK Matrix** | Live TTP coverage heatmap across 5 tactics (Initial Access → Defense Evasion) |
| 📊 **Analytics Dashboard** | Real-time stats: total alerts, critical count, false positives, correlated incidents |
| 📂 **Log Archive** | Paginated archive of 5,000+ normalized security events with playbook filter |
| ⚡ **WARP Replay Mode** | Replay 5,000 events at 500/sec speed to stress-test the dashboard |
| 📤 **Log Upload / Filebeat Ingest** | Upload JSON/NDJSON logs or stream from Filebeat via HTTP |
| ⚙️ **Settings Panel** | Tune detection thresholds, whitelist IPs, manage input modes live |
| 🛡️ **Deploy Shield** | Toggle live log monitoring ON/OFF from the UI |

---

## 📸 Screenshots

<details>
<summary><b>🖥️ Blueprints — Command Center Dashboard</b></summary>
<br />

> Real-time alert stream, system health stats, 3D globe threat map, and WARP replay controls.

</details>

<details>
<summary><b>⚠️ Threats — Live Threat Intelligence</b></summary>
<br />

> System integrity monitor, active detectors, network latency, AI-powered attack path prediction.

</details>

<details>
<summary><b>🔬 Intelligence — MITRE ATT&CK Coverage</b></summary>
<br />

> Live MITRE TTP matrix, IOC tracker, propagation vector analysis.

</details>

<details>
<summary><b>🗃️ Archives — Log History</b></summary>
<br />

> Paginated archive of all events. Filter by correlated incidents or alerts with AI playbooks.

</details>

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────┐
│                   ACDS Architecture                  │
├──────────────────────┬──────────────────────────────┤
│     FRONTEND         │        BACKEND                │
│   React + Vite       │      FastAPI + Uvicorn        │
│   Tailwind CSS       │                               │
│   react-globe.gl     │  ┌─────────────────────────┐ │
│   Chart.js           │  │   Normalizer             │ │
│   react-leaflet      │  │   (network / app logs)   │ │
│   WebSocket          │  ├─────────────────────────┤ │
│                      │  │   Detection Engine       │ │
│   localhost:5173 ────┼─►│   (brute force, C2,     │ │
│                      │  │    exfil, correlation)   │ │
│                      │  ├─────────────────────────┤ │
│                      │  │   Gemini AI              │ │
│                      │  │   (playbook generator)   │ │
│                      │  ├─────────────────────────┤ │
│                      │  │   Log Monitor            │ │
│                      │  │   (fake_logs/*.log)      │ │
│                      │  └─────────────────────────┘ │
│                      │       localhost:8000          │
└──────────────────────┴──────────────────────────────┘
```

---

## 📂 Project Structure

```
acds/
├── acds/
│   ├── backend/                  # FastAPI backend
│   │   ├── main.py               # API routes, WebSocket, startup
│   │   ├── config.py             # Environment variables
│   │   ├── detection_engine.py   # Threat detection rules
│   │   ├── normalizer.py         # Log normalization pipeline
│   │   ├── playbook_generator.py # Gemini AI playbook generator
│   │   ├── simulation_engine.py  # Attack path simulator
│   │   ├── log_monitor.py        # Live log file monitor
│   │   ├── log_generator.py      # Fake log generator
│   │   ├── sample_logs.json      # Sample log dataset
│   │   └── requirements.txt      # Python dependencies
│   │
│   └── frontend/                 # React + Vite frontend
│       ├── src/
│       │   ├── pages/            # Blueprints, Threats, Intelligence, Archives, Settings
│       │   ├── components/       # Sidebar, Topbar, shared components
│       │   ├── context/          # SocketContext (WebSocket + state)
│       │   ├── App.jsx           # Router setup
│       │   └── index.css         # Tailwind + custom styles
│       ├── package.json
│       └── vite.config.js
│
├── stitch_screens/               # UI design reference (HTML/PNG mockups)
└── README.md
```

---

## ⚡ Quick Start

### Prerequisites

- **Python 3.10+**
- **Node.js 18+** (or install via `winget install OpenJS.NodeJS.LTS`)
- **Gemini API Key** (optional, for AI playbooks) → [Get one free here](https://aistudio.google.com/app/apikey)

---

### 1. Clone the Repository

```bash
git clone https://github.com/sathwikkbhat/ACDS---SOC-ANALYST-DASHBOARD.git
cd ACDS---SOC-ANALYST-DASHBOARD
```

### 2. Backend Setup

```bash
cd acds/backend

# Create virtual environment
python -m venv venv

# Activate it
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r ../requirements.txt

# Create .env file
cp .env.example .env
# Edit .env and add your GEMINI_API_KEY
```

### 3. Frontend Setup

```bash
cd acds/frontend

# Install dependencies
npm install
```

### 4. Run Both Services

**Terminal 1 — Backend:**
```bash
cd acds/backend
venv\Scripts\python.exe main.py
# ✅ Running on http://localhost:8000
```

**Terminal 2 — Frontend:**
```bash
cd acds/frontend
npm run dev
# ✅ Running on http://localhost:5173
```

### 5. Open the Dashboard

```
http://localhost:5173
```

---

## 🔑 Environment Variables

Create `acds/backend/.env` with the following:

```env
# Required for AI playbooks (Critical alerts only)
GEMINI_API_KEY=your_gemini_api_key_here

# Detection mode: 'simulate' (fake logs) or 'file' (upload logs)
INPUT_MODE=simulate

# Detection thresholds (optional — can be tuned via Settings UI)
BRUTE_FORCE_THRESHOLD=5
BRUTE_FORCE_WINDOW_SEC=60
EXFIL_THRESHOLD_BYTES=10485760
CORRELATION_WINDOW_SEC=300
GEMINI_RATE_LIMIT_SEC=10
ADMIN_WHITELIST=192.168.1.1
```

> ⚠️ **Never commit your `.env` file.** It is already listed in `.gitignore`.

---

## 📦 Tech Stack

### Backend
| Package | Version | Purpose |
|---|---|---|
| FastAPI | 0.115.0 | REST API + WebSocket server |
| Uvicorn | 0.30.0 | ASGI server |
| Google Generative AI | 0.8.3 | Gemini 2.0 Flash playbook generation |
| python-dotenv | 1.0.1 | Environment variable loading |
| requests | 2.32.3 | IP geolocation proxy |

### Frontend
| Package | Version | Purpose |
|---|---|---|
| React | 19 | UI framework |
| Vite | 8 | Build tool & dev server |
| Tailwind CSS | 3.4 | Utility-first styling |
| react-globe.gl | 2.37 | Interactive 3D threat globe |
| react-leaflet | 5.0 | 2D threat map |
| Chart.js | 4.5 | Analytics charts |
| Axios | 1.15 | HTTP client |
| lucide-react | 1.8 | Icon set |

---

## 🌐 Deploy to Vercel

> The **frontend** can be deployed to Vercel. The **backend** requires a server (e.g. Render, Railway, or a VPS).

### Frontend (Vercel)

1. Import your GitHub repo to [vercel.com](https://vercel.com)
2. Set **Root Directory** → `acds/frontend`
3. Set **Framework Preset** → `Vite`
4. Add environment variable:
   - `VITE_API_URL` = `https://your-backend-url.com`

### Backend (Render / Railway)

1. Set **Root Directory** → `acds/backend`
2. Set **Start Command** → `python main.py`
3. Add all environment variables from `.env`
4. Make sure port **8000** is exposed

---

## 🔌 API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/stats` | System stats (total, critical, false positives) |
| `GET` | `/alerts` | Latest 50 alerts |
| `GET` | `/threats` | Full threat list with filters |
| `GET` | `/threats/stats` | System health & detector status |
| `GET` | `/intelligence/mitre` | MITRE ATT&CK TTP coverage |
| `GET` | `/intelligence/iocs` | Top 20 IOCs |
| `POST` | `/upload` | Upload JSON/NDJSON log file |
| `POST` | `/warp` | Trigger WARP replay (5000 events) |
| `POST` | `/playbooks/generate/{id}` | Generate AI playbook for alert |
| `POST` | `/monitor/start` | Start live log monitoring |
| `POST` | `/monitor/stop` | Stop live log monitoring |
| `POST` | `/reset` | Reset all alerts & state |
| `WS` | `/ws/alerts` | Real-time alert WebSocket stream |

---

## 🛡️ Detection Capabilities

```
┌──────────────────┬──────────────────────────────────────────────────┐
│ Threat Type      │ Detection Logic                                   │
├──────────────────┼──────────────────────────────────────────────────┤
│ Brute Force      │ >5 failed auths from same IP in 60s window       │
│ C2 Beacon        │ Regular interval connections (±15% variance)     │
│ Exfiltration     │ Single connection >10MB data transfer            │
│ Correlated       │ 2+ different threat types from same IP in 300s   │
│ False Positive   │ Source IP on admin whitelist                     │
└──────────────────┴──────────────────────────────────────────────────┘
```

**MITRE ATT&CK Tactics Covered:**
- `TA0001` Initial Access (T1190, T1566, T1133)
- `TA0002` Execution (T1059, T1204, T1053)
- `TA0003` Persistence (T1098, T1547, T1574)
- `TA0004` Privilege Escalation (T1548, T1068, T1055)
- `TA0005` Defense Evasion (T1140, T1070, T1562)

---

## 🤖 AI Playbook Generation

When a **Critical** severity alert is detected, you can trigger an AI-generated playbook:

1. Click the alert in the **Blueprints** page
2. Hit **"Generate AI Playbook"**
3. Gemini 2.0 Flash responds with:
   - **Summary** — What happened and why it's flagged
   - **Next Moves** — Predicted attacker actions based on MITRE path
   - **Immediate Actions** — 4 specific containment steps
   - **IOCs to Block** — IPs, domains, patterns to block immediately

> Requires `GEMINI_API_KEY` to be set in `.env`

---

## 📄 License

MIT License — feel free to fork, modify, and deploy.

---

<div align="center">

Built with ❤️ by **Sathwik K Bhat**

⭐ Star this repo if you found it useful!

</div>
