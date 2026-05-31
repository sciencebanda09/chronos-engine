# ⚛ CHRONOS ENGINE
## Causal Intelligence Platform

> A computational laboratory for modeling, simulating, analyzing, and stress-testing causal systems, paradoxes, alternate timelines, and decision pathways.

---

## 🌌 What is Chronos Engine?

Chronos Engine treats **reality as a graph**.

- **Nodes** = Events in a causal universe
- **Edges** = Cause-effect relationships
- **Algorithms** = The intelligence that reasons about causality

This is NOT a chatbot. This is NOT a timeline visualizer.
This is a **computational laboratory for causality**.

---

## ✨ Features

| Module | Description |
|---|---|
| **Universe Builder** | React Flow graph editor — drag, connect, create, delete events |
| **Causal Compiler** | 7-stage compilation pipeline — validates, detects contradictions, builds causal model |
| **Timeline Simulator** | Step-by-step event activation visualization with play/pause/rewind |
| **Paradox Engine** | Detects 8 paradox types: Grandfather, Bootstrap, Self-Causation, Infinite Loops, Ontological, Information Void, Timeline Contradictions, Recursive Reality |
| **Consequence Engine** | Propagates consequences 4 levels deep: immediate → secondary → tertiary → long-term |
| **Counterfactual Engine** | "What if this event never happened?" — full universe delta analysis |
| **Collapse Simulator** | Animates timeline collapse when an event is removed |
| **Influence Analysis** | PageRank, Betweenness Centrality, Fragility, Danger scores for every event |
| **Multiverse Engine** | Branch universes at any divergence point |
| **Knowledge Tracker** | Traces information origin, detects bootstrap knowledge loops |
| **AI Parser** | Uses Ollama + Qwen2.5:3B to convert natural language stories into universe graphs |
| **Analytics Dashboard** | Stability score, entropy, collapse risk, universe health index |

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- Python 3.11+
- Node.js 20+
- [Ollama](https://ollama.com) (optional, for AI parsing)

---

### 1. Backend Setup

```bash
cd backend
python -m venv venv

# Linux/macOS:
source venv/bin/activate

# Windows:
venv\Scripts\activate

pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Backend runs at: **http://localhost:8000**
API docs at: **http://localhost:8000/docs**

---

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at: **http://localhost:3000**

---

### 3. AI Parser Setup (Optional)

```bash
# Install Ollama from https://ollama.com
ollama pull qwen2.5:3b
ollama serve
```

The parser will automatically use Qwen2.5:3B when Ollama is running.
Falls back to regex extraction if Ollama is offline.

---

### 4. Docker (Full Stack)

```bash
docker-compose up --build
```

---

## 🧠 Architecture

```
chronos-engine/
├── backend/
│   ├── main.py                    # FastAPI app entry
│   ├── app/
│   │   ├── api/
│   │   │   ├── universes.py       # CRUD + compile + sync
│   │   │   ├── analysis.py        # All analysis endpoints
│   │   │   ├── parser.py          # AI story parser
│   │   │   ├── timeline.py        # Timeline simulator
│   │   │   └── multiverse.py      # Universe branching
│   │   ├── engines/
│   │   │   ├── paradox_engine.py      # 8 paradox detectors (NetworkX)
│   │   │   ├── consequence_engine.py  # BFS cascade propagation
│   │   │   ├── influence_engine.py    # PageRank, Betweenness, etc.
│   │   │   ├── timeline_engine.py     # Topological sort simulator
│   │   │   ├── causal_compiler.py     # 7-stage compilation pipeline
│   │   │   ├── counterfactual_engine.py # What-if analysis
│   │   │   └── multiverse_engine.py   # Branching + knowledge tracker
│   │   ├── db/database.py         # SQLAlchemy models (SQLite/PostgreSQL)
│   │   ├── schemas/universe.py    # Pydantic schemas
│   │   └── core/config.py         # Settings
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx           # Universe selector home
│   │   │   └── universe/[id]/     # Canvas workspace
│   │   ├── components/
│   │   │   ├── canvas/
│   │   │   │   ├── UniverseCanvas.tsx  # React Flow editor
│   │   │   │   ├── ChronosNode.tsx     # Custom node renderer
│   │   │   │   └── ChronosEdge.tsx     # Custom edge renderer
│   │   │   ├── layout/
│   │   │   │   ├── TopBar.tsx      # Navigation + compile button
│   │   │   │   ├── LeftSidebar.tsx # Events list
│   │   │   │   ├── RightPanel.tsx  # Analysis panel container
│   │   │   │   └── BottomBar.tsx   # Timeline simulator controls
│   │   │   └── panels/
│   │   │       ├── DashboardPanel.tsx
│   │   │       ├── ParadoxPanel.tsx
│   │   │       ├── InfluencePanel.tsx
│   │   │       ├── ConsequencePanel.tsx
│   │   │       ├── CounterfactualPanel.tsx
│   │   │       ├── TimelinePanel.tsx
│   │   │       ├── KnowledgePanel.tsx
│   │   │       ├── ParserPanel.tsx
│   │   │       └── EventEditModal.tsx
│   │   ├── store/index.ts         # Zustand global state
│   │   ├── utils/api.ts           # Backend API client
│   │   └── types/index.ts         # TypeScript type definitions
│
├── docker-compose.yml
└── README.md
```

---

## 📡 API Reference

All endpoints documented at `http://localhost:8000/docs`

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/universes/` | List all universes |
| POST | `/api/universes/` | Create universe |
| GET | `/api/universes/{id}` | Get universe with events |
| POST | `/api/universes/{id}/compile` | Compile & analyze universe |
| POST | `/api/universes/{id}/sync` | Bulk sync from React Flow |
| GET | `/api/analysis/{id}/paradoxes` | Detect all paradoxes |
| GET | `/api/analysis/{id}/influence` | Full influence analysis |
| GET | `/api/analysis/{id}/consequences/{event_id}` | Consequence cascade |
| GET | `/api/analysis/{id}/counterfactual/{event_id}` | What-if analysis |
| GET | `/api/analysis/{id}/collapse/{event_id}` | Collapse simulation |
| GET | `/api/analysis/{id}/dashboard` | All metrics dashboard |
| GET | `/api/timeline/{id}/compile` | Compile timeline steps |
| POST | `/api/multiverse/{id}/branch` | Create universe branch |
| POST | `/api/parser/parse` | AI story-to-graph extraction |
| GET | `/api/parser/status` | Ollama status |

---

## 🎮 How to Use

### Creating a Universe
1. Click **"New Universe"** on the home screen
2. Give it a name (e.g., "Dark Season 1", "Interstellar Timeline")
3. You're taken to the canvas workspace

### Building the Causal Graph
- **Double-click the canvas** to create a new event
- **Drag from one node's right handle to another's left** to create a relationship
- **Double-click a node** to edit its label, description, type, and metadata
- **Press Delete/Backspace** with a node selected to remove it
- **Click the minimap** to navigate large graphs

### Running Analysis
- Click any button in the **top navigation bar** to open an analysis panel
- **Dashboard** — overall health metrics
- **Paradoxes** — detects all causal contradictions
- **Influence** — ranks events by PageRank, betweenness centrality
- **Consequences** — click an event to see its full cascade tree
- **Counterfactual** — select an event to see what happens if it never occurred
- **Timeline** — compile and step through universe activation wave by wave

### Timeline Simulation
Use the **bottom bar** controls:
- ▶ **Play** — auto-advance through propagation steps
- ⏸ **Pause** — pause at current step
- ■ **Stop** — reset simulation
- **Step Forward/Back** — manual step control

### AI Parsing
1. Open the **AI Parser** panel
2. Paste or type a causal story (e.g., a summary of Dark Season 1)
3. Click **Parse** — Qwen2.5 extracts events and relationships
4. Click **Import to Current Universe** or **Create New Universe**

---

## 🔧 Configuration

### Backend `.env`
```env
DATABASE_URL=sqlite:///./chronos.db      # SQLite (default) or postgresql://...
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=qwen2.5:3b
CORS_ORIGINS=["http://localhost:3000"]
```

### Frontend `.env.local`
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## 🧬 Paradox Detection Algorithms

All paradox detection is **purely algorithmic** using NetworkX — no AI reasoning:

| Paradox Type | Detection Method |
|---|---|
| Self-Causation | Check for self-loops in DiGraph |
| Grandfather | Detect cycles containing "destroy/kill/prevent" labeled nodes |
| Bootstrap | Cycles containing knowledge-related nodes with no external input |
| Infinite Loop | General simple cycle detection (nx.simple_cycles) |
| Ontological | 2-node cycles with mutual dependency |
| Information Void | Strongly connected components with no external predecessors |
| Timeline Contradiction | Edge u→v where timestamp(u) > timestamp(v) |
| Recursive Reality | Long cycles (>6 nodes) |

---

## 📊 Graph Metrics Used

| Metric | Algorithm | Purpose |
|---|---|---|
| Composite Score | Weighted combination | Overall event importance |
| PageRank | nx.pagerank | Influence via incoming links |
| Betweenness Centrality | nx.betweenness_centrality | Bridge/bottleneck events |
| In/Out Degree Centrality | nx.in/out_degree_centrality | Dependency measure |
| Closeness Centrality | nx.closeness_centrality | How "close" to all other events |
| Reachability | nx.descendants | How many events depend on this one |
| Fragility Score | in_degree × (1 - out_degree/2) | Risk of cascade failure |
| Danger Score | (PageRank + Betweenness) × 50 | Damage if removed |

---

## 🏗 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15, React, TypeScript, Tailwind CSS |
| Graph Editor | React Flow (@xyflow/react) |
| Animations | Framer Motion |
| State | Zustand |
| Charts | Recharts |
| Backend | FastAPI, Python 3.11 |
| Graph Algorithms | NetworkX |
| Database | SQLite (dev) / PostgreSQL (prod) |
| AI Parser | Ollama + Qwen2.5:3B |
| Containerization | Docker + Docker Compose |

---

## 🌟 Critical Design Principle

> **Qwen is NOT the reasoning engine.**
>
> Qwen2.5 is only used for:
> - Natural language parsing
> - Event extraction from text
> - Relationship extraction
> - Generating graph structure from prose
>
> **All causal reasoning, paradox detection, stability analysis, and consequence propagation is performed algorithmically by Chronos Engine itself.**

---

Built as a flagship research-grade project demonstrating causal intelligence, consequence reasoning, graph analysis, alternate timelines, and computational causality.
