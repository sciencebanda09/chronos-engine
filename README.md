
```
 ██████╗██╗  ██╗██████╗  ██████╗ ███╗   ██╗ ██████╗ ███████╗
██╔════╝██║  ██║██╔══██╗██╔═══██╗████╗  ██║██╔═══██╗██╔════╝
██║     ███████║██████╔╝██║   ██║██╔██╗ ██║██║   ██║███████╗
██║     ██╔══██║██╔══██╗██║   ██║██║╚██╗██║██║   ██║╚════██║
╚██████╗██║  ██║██║  ██║╚██████╔╝██║ ╚████║╚██████╔╝███████║
 ╚═════╝╚═╝  ╚═╝╚═╝  ╚═╝ ╚═════╝ ╚═╝  ╚═══╝ ╚═════╝ ╚══════╝

███████╗███╗   ██╗ ██████╗ ██╗███╗   ██╗███████╗
██╔════╝████╗  ██║██╔════╝ ██║████╗  ██║██╔════╝
█████╗  ██╔██╗ ██║██║  ███╗██║██╔██╗ ██║█████╗
██╔══╝  ██║╚██╗██║██║   ██║██║██║╚██╗██║██╔══╝
███████╗██║ ╚████║╚██████╔╝██║██║ ╚████║███████╗
╚══════╝╚═╝  ╚═══╝ ╚═════╝ ╚═╝╚═╝  ╚═══╝╚══════╝
```

> What if one event changed everything?  
> Chronos Engine lets you build causal timelines, fork realities, and simulate the roads not taken.

---

```
  [Event A] ──causes──> [Event B] ──triggers──> [Event C]
      |                                               |
      |                   PARADOX                     |
      +<──────────────── detected ───────────────────+
```

---

## What Is This

Chronos Engine is a computational laboratory for causality.

It models reality as a directed graph — events as nodes, cause-effect relationships as edges — and then runs algorithms on top of that graph to answer questions that normally take pages of analysis:

- What are the downstream consequences of this event?
- If this event never happened, what would the universe look like?
- Where is the most dangerous single point of failure in this timeline?
- Is there a paradox buried inside this causal chain?
- What information exists with no traceable origin?

This is not a chatbot. The AI is only used to parse natural language into graphs. Everything else — reasoning, detection, simulation, analysis — is algorithmic.

---

## Core Modules

```
+------------------+    +-------------------+    +----------------------+
|  Universe Builder |    |  Causal Compiler  |    |  Paradox Engine      |
|  React Flow graph |    |  7-stage pipeline |    |  8 paradox types     |
|  editor with drag,|    |  validates and    |    |  detected via graph  |
|  connect, delete  |    |  builds the model |    |  algorithms          |
+------------------+    +-------------------+    +----------------------+

+------------------+    +-------------------+    +----------------------+
|  Timeline        |    |  Consequence      |    |  Counterfactual      |
|  Simulator       |    |  Engine           |    |  Engine              |
|  step-by-step    |    |  BFS cascade 4    |    |  full delta analysis |
|  activation view |    |  levels deep      |    |  on event removal    |
+------------------+    +-------------------+    +----------------------+

+------------------+    +-------------------+    +----------------------+
|  Influence       |    |  Multiverse       |    |  Knowledge           |
|  Analysis        |    |  Engine           |    |  Tracker             |
|  PageRank,       |    |  branch universes |    |  traces info origin, |
|  Betweenness,    |    |  at any divergence|    |  detects bootstrap   |
|  Fragility score |    |  point            |    |  loops               |
+------------------+    +-------------------+    +----------------------+

+------------------+    +-------------------+
|  AI Parser       |    |  Analytics        |
|  Ollama + LLM    |    |  Dashboard        |
|  converts prose  |    |  stability score, |
|  into graphs     |    |  entropy, health  |
+------------------+    +-------------------+
```

---

## Paradox Detection

All detection is purely algorithmic using NetworkX. No LLM reasoning involved.

```
Paradox Type           Detection Method
--------------------   --------------------------------------------------
Self-Causation         Self-loops in DiGraph
Grandfather            Cycles with destroy/kill/prevent labeled nodes
Bootstrap              Cycles containing knowledge nodes with no input
Infinite Loop          General simple cycle detection
Ontological            2-node mutual dependency cycles
Information Void       Strongly connected components with no predecessors
Timeline Contradiction Edge u->v where timestamp(u) > timestamp(v)
Recursive Reality      Long cycles of more than 6 nodes
```

---

## Graph Metrics

```
Metric                 Algorithm                   Purpose
--------------------   -------------------------   --------------------------
Composite Score        Weighted combination        Overall event importance
PageRank               nx.pagerank                 Influence via incoming links
Betweenness            nx.betweenness_centrality   Bridge / bottleneck events
In/Out Degree          nx.degree_centrality        Dependency measurement
Closeness              nx.closeness_centrality     Distance to all other nodes
Reachability           nx.descendants              Downstream dependency count
Fragility Score        in_degree x (1-out/2)       Cascade failure risk
Danger Score           (PageRank + Betweenness)x50 Damage potential if removed
```

---

## Tech Stack

```
Layer            Technology
--------------   ----------------------------------------
Frontend         Next.js 15, React, TypeScript, Tailwind
Graph Editor     React Flow (@xyflow/react)
Animations       Framer Motion
State            Zustand
Charts           Recharts
Backend          FastAPI, Python 3.11
Graph Engine     NetworkX
Database         SQLite (dev) / PostgreSQL (prod)
AI Parser        Ollama + llama3.1:8b
Containers       Docker + Docker Compose
```

---

## Architecture

```
chronos-engine/
├── backend/
│   ├── main.py
│   └── app/
│       ├── api/
│       │   ├── universes.py          CRUD + compile + sync
│       │   ├── analysis.py           all analysis endpoints
│       │   ├── parser.py             AI story parser
│       │   ├── timeline.py           timeline simulator
│       │   └── multiverse.py         universe branching
│       ├── engines/
│       │   ├── paradox_engine.py     8 paradox detectors
│       │   ├── consequence_engine.py BFS cascade propagation
│       │   ├── influence_engine.py   PageRank, Betweenness
│       │   ├── timeline_engine.py    topological sort simulator
│       │   ├── causal_compiler.py    7-stage compilation
│       │   ├── counterfactual_engine.py  what-if analysis
│       │   └── multiverse_engine.py  branching + knowledge
│       ├── db/database.py
│       ├── schemas/universe.py
│       └── core/config.py
│
└── frontend/
    └── src/
        ├── app/
        │   ├── page.tsx              universe selector home
        │   └── universe/[id]/        canvas workspace
        ├── components/
        │   ├── canvas/               React Flow editor + nodes
        │   ├── layout/               TopBar, Sidebar, Panels
        │   └── panels/               all analysis panel UIs
        ├── store/index.ts            Zustand global state
        ├── utils/api.ts              backend API client
        └── types/index.ts            TypeScript definitions
```

---

## Quick Start

### Prerequisites

- Python 3.11+
- Node.js 20+
- Ollama (optional, for AI parsing) — https://ollama.com

### Windows (one command)

```cmd
cd chronos-engine
start.bat
```

### Manual Setup

Backend:
```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Frontend:
```bash
cd frontend
npm install
npm run dev
```

AI Parser (optional):
```bash
ollama pull llama3.1:8b
ollama serve
```

Docker (full stack):
```bash
docker-compose up --build
```

---

## Configuration

`backend/.env`
```env
DATABASE_URL=sqlite:///./chronos.db
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=llama3.1:8b
CORS_ORIGINS=["http://localhost:3000"]
```

`frontend/.env.local`
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## API Reference

Full docs at `http://localhost:8000/docs`

```
Method   Endpoint                                      Description
------   -------------------------------------------   ---------------------------
GET      /api/universes/                               List all universes
POST     /api/universes/                               Create universe
GET      /api/universes/{id}                           Get universe with events
POST     /api/universes/{id}/compile                   Compile and analyze
POST     /api/universes/{id}/sync                      Bulk sync from React Flow
GET      /api/analysis/{id}/paradoxes                  Detect all paradoxes
GET      /api/analysis/{id}/influence                  Full influence analysis
GET      /api/analysis/{id}/consequences/{event_id}    Consequence cascade
GET      /api/analysis/{id}/counterfactual/{event_id}  What-if analysis
GET      /api/analysis/{id}/collapse/{event_id}        Collapse simulation
GET      /api/analysis/{id}/dashboard                  All metrics
GET      /api/timeline/{id}/compile                    Compile timeline steps
POST     /api/multiverse/{id}/branch                   Create universe branch
POST     /api/parser/parse                             AI story-to-graph
GET      /api/parser/status                            Ollama status
```

---

## Design Principle

The LLM is not the brain. It is the mouth.

Ollama handles one thing: converting natural language prose into a graph structure. That is it.

Every analysis that follows — paradox detection, consequence propagation, influence ranking, counterfactual simulation, collapse modeling — is performed by Chronos Engine's own deterministic algorithms. The reasoning is transparent, reproducible, and does not depend on a model getting lucky.

---

Built to demonstrate that causal intelligence does not require a black box.
