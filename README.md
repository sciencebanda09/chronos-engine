<div align="center">

<img src="https://capsule-render.vercel.app/api?type=venom&color=0:000000,30:0a0a0a,60:00d4ff,100:7c3aed&height=250&section=header&text=CHRONOS%20ENGINE&fontSize=72&fontColor=ffffff&fontAlignY=50&animation=fadeIn&stroke=00d4ff&strokeWidth=2&desc=Computational%20Laboratory%20for%20Causality&descAlignY=70&descSize=20&descColor=00d4ff&fontStyle=bold" width="100%"/>

<img src="https://readme-typing-svg.herokuapp.com?font=Share+Tech+Mono&size=15&duration=3000&pause=800&color=00D4FF&center=true&vCenter=true&width=700&lines=—+What+if+one+event+changed+everything+—;—+Model+universes.+Fork+realities.+—;—+Detect+paradoxes.+Simulate+collapse.+—;—+Deterministic.+Transparent.+Reproducible.+—" alt="Tagline" />

<br/>

[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org)
[![NetworkX](https://img.shields.io/badge/NetworkX-3.3-FF6B35?style=for-the-badge)](https://networkx.org)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://docker.com)
[![Ollama](https://img.shields.io/badge/Ollama-qwen2.5:14b-8A2BE2?style=for-the-badge)](https://ollama.com)

<br/>

![Engines](https://img.shields.io/badge/ENGINES-8-00d4ff?style=flat-square&labelColor=0d1117)
![Paradox Types](https://img.shields.io/badge/PARADOX_TYPES-8-ff4466?style=flat-square&labelColor=0d1117)
![Graph Metrics](https://img.shields.io/badge/GRAPH_METRICS-8-7c3aed?style=flat-square&labelColor=0d1117)
![API Endpoints](https://img.shields.io/badge/API_ENDPOINTS-15-00ff88?style=flat-square&labelColor=0d1117)

</div>

<img src="https://capsule-render.vercel.app/api?type=rect&color=0:000000,100:0d1117&height=3&section=header" width="100%"/>

---

## WHAT IS THIS

Chronos Engine models reality as a **directed causal graph** — events as nodes, cause-effect relationships as edges — then runs deterministic algorithms to answer questions that normally take pages of analysis.

| Question | Engine |
|---|---|
| What are the downstream consequences of this event? | Consequence Engine |
| If this event never happened, what would change? | Counterfactual Engine |
| Where is the most dangerous single point of failure? | Influence Engine |
| Is there a paradox buried in this causal chain? | Paradox Engine |
| What information exists with no traceable origin? | Knowledge Tracker |

> **The LLM is not the brain. It is the mouth.**
> Ollama handles one thing: converting natural language prose into a graph. Every analysis that follows is deterministic, transparent, and reproducible.

---

## HOME — UNIVERSE SELECTOR

Create and manage causal universes. Each universe tracks total events, links, paradoxes, and timeline stability at a glance.

<div align="center">
<img src="docs/screenshots/home.jpeg" width="90%" alt="Chronos Engine Home"/>
</div>

---

## CANVAS — CAUSAL GRAPH EDITOR

React Flow graph editor with drag, connect, and delete. Double-click canvas to add events, drag between nodes to create causal links, delete key to remove. Supports 5 node types: `origin` `terminal` `decision` `paradox` `standard`.

<div align="center">
<img src="docs/screenshots/canvas.jpeg" width="90%" alt="Causal Graph Canvas"/>
</div>

---

## UNIVERSE DASHBOARD

7-stage compilation pipeline: Parse → Validate → Detect Contradictions → Build Model → Simulate → Calculate Stability. Dashboard shows real-time health index, collapse risk, entropy, and density.

<div align="center">
<img src="docs/screenshots/dashboard.jpeg" width="60%" alt="Universe Dashboard"/>
</div>

---

## PARADOX DETECTION

8 paradox types detected purely via graph algorithms. No LLM reasoning involved.

<div align="center">
<img src="docs/screenshots/paradox.jpeg" width="55%" alt="Paradox Engine"/>
</div>

<br/>

| Paradox Type | Detection Method |
|---|---|
| Self-Causation | Self-loops in DiGraph |
| Grandfather | Cycles with destroy/kill/prevent labeled edges |
| Bootstrap | Cycles containing knowledge nodes with no external input |
| Infinite Loop | General simple cycle detection |
| Ontological | 2-node mutual dependency cycles |
| Information Void | Strongly connected components with no predecessors |
| Timeline Contradiction | Edge `u→v` where `timestamp(u) > timestamp(v)` |
| Recursive Reality | Long cycles of more than 6 nodes |

---

## CONSEQUENCE ENGINE

BFS cascade propagation 4 levels deep — immediate, secondary, tertiary, and long-term consequences. Click any event to see what it triggers downstream.

<div align="center">
<img src="docs/screenshots/consequence.jpeg" width="90%" alt="Consequence Analysis"/>
</div>

---

## COUNTERFACTUAL ENGINE

Full delta analysis on event removal: what's lost, what's preserved, stability shift, paradox delta. Animate the timeline collapse to visualize the impact.

<div align="center">
<img src="docs/screenshots/counterfactual.jpeg" width="55%" alt="Counterfactual Engine"/>
</div>

---

## INFLUENCE ANALYSIS

PageRank, Betweenness Centrality, Fragility Score, Danger Score — ranks every event by causal weight and identifies the most dangerous single point of failure.

<div align="center">
<img src="docs/screenshots/influence-panel.jpeg" width="48%" alt="Influence Panel"/>
&nbsp;&nbsp;
<img src="docs/screenshots/influence-table.jpeg" width="42%" alt="Influence Table"/>
</div>

<br/>

| Metric | Algorithm | Purpose |
|---|---|---|
| Composite Score | Weighted combination | Overall event importance |
| PageRank | `nx.pagerank` | Influence via incoming links |
| Betweenness | `nx.betweenness_centrality` | Bridge / bottleneck events |
| Fragility Score | `in_degree x (1 - out/2)` | Cascade failure risk |
| Danger Score | `(PageRank + Betweenness) x 50` | Damage potential if removed |

---

## KNOWLEDGE ORIGIN TRACKER

Traces information flow through the graph. Detects bootstrap loops — knowledge that caused itself with no external origin.

<div align="center">
<img src="docs/screenshots/knowledge.jpeg" width="55%" alt="Knowledge Tracker"/>
</div>

---

## AI STORY PARSER

Paste any narrative text. Ollama + `qwen2.5:14b` extracts events and causal relationships and builds the graph automatically. Regex fallback if Ollama is offline.

<div align="center">
<img src="docs/screenshots/parser.jpeg" width="55%" alt="AI Story Parser"/>
</div>

---

## EDIT EVENTS

Double-click any node to edit its label, description, type, and timestamp inline.

<div align="center">
<img src="docs/screenshots/edit-event.jpeg" width="55%" alt="Edit Event"/>
</div>

---

## QUICK START

**One Command — Windows**
```cmd
cd chronos-engine && start.bat
```

**Docker — Full Stack**
```bash
docker-compose up --build
```

<details>
<summary><b>Backend — Manual</b></summary>

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```
</details>

<details>
<summary><b>Frontend — Manual</b></summary>

```bash
cd frontend
npm install
npm run dev
```
</details>

<details>
<summary><b>AI Parser — Optional</b></summary>

```bash
ollama pull qwen2.5:14b
ollama serve
```
</details>

---

## ARCHITECTURE

```
chronos-engine/
├── backend/
│   ├── main.py
│   └── app/
│       ├── api/
│       │   ├── universes.py             ← CRUD + compile + sync
│       │   ├── analysis.py              ← all analysis endpoints
│       │   ├── parser.py                ← AI story parser
│       │   ├── timeline.py              ← timeline simulator
│       │   └── multiverse.py            ← universe branching
│       ├── engines/
│       │   ├── paradox_engine.py        ← 8 paradox detectors
│       │   ├── consequence_engine.py    ← BFS cascade propagation
│       │   ├── influence_engine.py      ← PageRank + Betweenness
│       │   ├── timeline_engine.py       ← topological sort simulator
│       │   ├── causal_compiler.py       ← 7-stage compilation
│       │   ├── counterfactual_engine.py ← what-if analysis
│       │   └── multiverse_engine.py     ← branching + knowledge
│       ├── db/database.py
│       ├── schemas/universe.py
│       └── core/config.py
│
└── frontend/
    └── src/
        ├── app/
        │   ├── page.tsx                 ← universe selector home
        │   └── universe/[id]/           ← canvas workspace
        ├── components/
        │   ├── canvas/                  ← React Flow editor + nodes
        │   ├── layout/                  ← TopBar, Sidebar, Panels
        │   └── panels/                  ← all analysis panel UIs
        ├── store/index.ts               ← Zustand global state
        ├── utils/api.ts                 ← backend API client
        └── types/index.ts               ← TypeScript definitions
```

---

## TECH STACK

| Layer | Technology |
|---|---|
| Frontend | Next.js 15, React, TypeScript, Tailwind CSS |
| Graph Editor | React Flow (`@xyflow/react`) |
| Animations | Framer Motion |
| State | Zustand |
| Charts | Recharts |
| Backend | FastAPI, Python 3.11 |
| Graph Engine | NetworkX 3.3 |
| Database | SQLite (dev) / PostgreSQL (prod) |
| AI Parser | Ollama + `qwen2.5:14b` |
| Containers | Docker + Docker Compose |

---

## API REFERENCE

Full interactive docs at `http://localhost:8000/docs`

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/universes/` | List all universes |
| `POST` | `/api/universes/` | Create universe |
| `GET` | `/api/universes/{id}` | Get universe with events |
| `POST` | `/api/universes/{id}/compile` | Compile and analyze |
| `POST` | `/api/universes/{id}/sync` | Bulk sync from React Flow |
| `GET` | `/api/analysis/{id}/paradoxes` | Detect all paradoxes |
| `GET` | `/api/analysis/{id}/influence` | Full influence analysis |
| `GET` | `/api/analysis/{id}/consequences/{event_id}` | Consequence cascade |
| `GET` | `/api/analysis/{id}/counterfactual/{event_id}` | What-if analysis |
| `GET` | `/api/analysis/{id}/collapse/{event_id}` | Collapse simulation |
| `GET` | `/api/analysis/{id}/dashboard` | All metrics combined |
| `GET` | `/api/timeline/{id}/compile` | Compile timeline steps |
| `POST` | `/api/multiverse/{id}/branch` | Create universe branch |
| `POST` | `/api/parser/parse` | AI story-to-graph |
| `GET` | `/api/parser/status` | Ollama status check |

---

## CONFIGURATION

**`backend/.env`**
```env
DATABASE_URL=sqlite:///./chronos.db
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=qwen2.5:14b
CORS_ORIGINS=["http://localhost:3000"]
```

**`frontend/.env.local`**
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## DESIGN PRINCIPLE

```
  Natural Language
        |
        v
  +--------------+
  |  Ollama LLM  |  <- only touches this part
  +--------------+
        |
        v  structured graph
  +------------------------------------------+
  |        Chronos Engine Algorithms         |
  |  paradox  consequence  influence         |
  |  counterfactual  timeline  multiverse    |
  +------------------------------------------+
        |
        v
  Deterministic · Reproducible · Transparent
```

Built to demonstrate that causal intelligence does not require a black box.

---

<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:7c3aed,50:00d4ff,100:000000&height=120&section=footer&text=sciencebanda09&fontSize=24&fontColor=ffffff&fontAlignY=65&animation=fadeIn&descColor=00d4ff" width="100%"/>

</div>
