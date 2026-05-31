from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
import httpx
import json
import re
import uuid
from app.core.config import settings

router = APIRouter()


class ParseRequest(BaseModel):
    text: str
    universe_name: Optional[str] = None


SYSTEM_PROMPT = """You are a causal graph extractor for Chronos Engine.

Return ONLY valid JSON. No explanation. No markdown. No code blocks.

Output format:
{
  "events": [
    {"id": "e1", "label": "Short Event Name", "description": "Brief description", "event_type": "standard"}
  ],
  "relationships": [
    {"source_id": "e1", "target_id": "e2", "label": "causes", "strength": 0.9}
  ]
}

Rules:
- Every event gets a short unique id: e1, e2, e3...
- Labels must be concise (2-5 words max)
- Relationships must use source_id and target_id matching event ids
- strength is 0.0 to 1.0 (how strongly one event causes another)
- event_type options: standard, origin, terminal, decision, paradox
- Mark the first event(s) in the chain as "origin" type
- Mark the last event(s) with no consequences as "terminal" type
- Mark events involving paradoxes, contradictions, or impossibilities as "paradox" type
- Mark events involving choices or branching as "decision" type
- CRITICAL: If the story mentions time travel, loops, bootstrap paradoxes, or circular causation,
  you MUST create circular relationships in the graph.
  Example: if event A causes B causes C causes A again, add relationships e1->e2, e2->e3, e3->e1
- CRITICAL: If someone erases themselves from history, connect the erasure back to the original action
- CRITICAL: If knowledge comes from the future, connect the future event back to the past event
- Extract ALL causal relationships, not just sequential ones
- Return ONLY the JSON object, nothing else"""


@router.post("/parse")
async def parse_story(body: ParseRequest):
    if not body.text.strip():
        raise HTTPException(status_code=400, detail="Text cannot be empty")
    if len(body.text) > 50000:
        raise HTTPException(status_code=400, detail="Text too long (max 50000 chars)")

    try:
        async with httpx.AsyncClient(timeout=300.0) as client:
            response = await client.post(
                f"{settings.OLLAMA_URL}/api/generate",
                json={
                    "model": settings.OLLAMA_MODEL,
                    "prompt": f"{SYSTEM_PROMPT}\n\nExtract the causal graph from this text:\n\n{body.text}",
                    "stream": False,
                    "options": {"temperature": 0.1, "top_p": 0.9},
                },
            )
            if response.status_code != 200:
                raise HTTPException(status_code=503, detail="Ollama service unavailable")

            data = response.json()
            raw_text = data.get("response", "")
            parsed = _extract_json(raw_text)

            if not parsed:
                return _fallback_parse(body.text)

            events = parsed.get("events", [])
            relationships = parsed.get("relationships", [])

            # Assign real UUIDs
            id_map = {}
            for e in events:
                old_id = e.get("id", str(uuid.uuid4()))
                new_id = str(uuid.uuid4())
                id_map[old_id] = new_id
                e["id"] = new_id
                e["pos_x"] = 0.0
                e["pos_y"] = 0.0
                e["color"] = _color_for_type(e.get("event_type", "standard"))

            for r in relationships:
                r["id"] = str(uuid.uuid4())
                r["source_id"] = id_map.get(r.get("source_id", ""), r.get("source_id", ""))
                r["target_id"] = id_map.get(r.get("target_id", ""), r.get("target_id", ""))

            # Auto-layout positions
            _auto_layout(events, relationships)

            return {
                "success": True,
                "source": "ollama",
                "model": settings.OLLAMA_MODEL,
                "events": events,
                "relationships": relationships,
                "universe_name": body.universe_name or _infer_title(body.text),
                "event_count": len(events),
                "relationship_count": len(relationships),
            }

    except httpx.ConnectError:
        return _fallback_parse(body.text)
    except Exception as e:
        return _fallback_parse(body.text)


def _extract_json(text: str) -> Optional[dict]:
    try:
        return json.loads(text.strip())
    except Exception:
        pass
    match = re.search(r"```(?:json)?\s*(\{.*?\})\s*```", text, re.DOTALL)
    if match:
        try:
            return json.loads(match.group(1))
        except Exception:
            pass
    match2 = re.search(r"\{.*\}", text, re.DOTALL)
    if match2:
        try:
            return json.loads(match2.group(0))
        except Exception:
            pass
    return None


def _fallback_parse(text: str) -> dict:
    lines = [l.strip() for l in text.strip().split("\n") if l.strip()]
    events = []
    relationships = []
    event_ids = {}

    for i, line in enumerate(lines[:20]):
        clean = re.sub(r"[↓→←↑\.\-\*\#]", "", line).strip()
        if len(clean) < 3:
            continue
        eid = str(uuid.uuid4())
        event_ids[i] = eid
        events.append({
            "id": eid,
            "label": clean[:50],
            "description": f"Extracted from: {clean}",
            "event_type": "origin" if i == 0 else "terminal" if i == len(lines) - 1 else "standard",
            "pos_x": 200.0,
            "pos_y": i * 120.0,
            "color": _color_for_type("origin" if i == 0 else "standard"),
        })
        if i > 0 and (i - 1) in event_ids:
            relationships.append({
                "id": str(uuid.uuid4()),
                "source_id": event_ids[i - 1],
                "target_id": eid,
                "label": "causes",
                "strength": 1.0,
            })

    return {
        "success": True,
        "source": "fallback",
        "model": "regex-fallback",
        "events": events,
        "relationships": relationships,
        "universe_name": _infer_title(text),
        "event_count": len(events),
        "relationship_count": len(relationships),
        "note": "Ollama unavailable - used fallback line extraction. Start Ollama for AI parsing.",
    }


def _color_for_type(event_type: str) -> str:
    return {
        "origin": "#00ff88",
        "terminal": "#ff4466",
        "decision": "#ffaa00",
        "paradox": "#cc44ff",
        "standard": "#00d4ff",
    }.get(event_type, "#00d4ff")


def _infer_title(text: str) -> str:
    words = text.strip().split()[:6]
    return " ".join(words).strip(".,!?") or "Parsed Universe"


def _auto_layout(events: list, relationships: list) -> None:
    if not events:
        return
    id_to_idx = {e["id"]: i for i, e in enumerate(events)}
    in_degree = {e["id"]: 0 for e in events}
    adj = {e["id"]: [] for e in events}

    for r in relationships:
        s, t = r.get("source_id"), r.get("target_id")
        if s in adj and t in in_degree:
            adj[s].append(t)
            in_degree[t] += 1

    layers = {}
    queue = [eid for eid, deg in in_degree.items() if deg == 0]
    if not queue:
        queue = [list(in_degree.keys())[0]]
    current_layer = 0
    visited = set()

    while queue:
        next_queue = []
        for eid in queue:
            if eid not in visited:
                visited.add(eid)
                layers[eid] = current_layer
                next_queue.extend(adj.get(eid, []))
        queue = [n for n in next_queue if n not in visited]
        current_layer += 1

    layer_counts = {}
    for eid, layer in layers.items():
        layer_counts[layer] = layer_counts.get(layer, 0) + 1

    layer_pos = {}
    for eid, layer in layers.items():
        if layer not in layer_pos:
            layer_pos[layer] = 0
        col = layer_pos[layer]
        count = layer_counts[layer]
        idx = id_to_idx.get(eid, 0)
        events[idx]["pos_x"] = float(layer * 280 + 100)
        events[idx]["pos_y"] = float(col * 150 - (count - 1) * 75 + 300)
        layer_pos[layer] += 1

    for e in events:
        if e["pos_x"] == 0.0 and e["pos_y"] == 0.0 and e["id"] not in layers:
            e["pos_x"] = float(current_layer * 280 + 100)
            e["pos_y"] = float(200.0)


@router.get("/status")
async def ollama_status():
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            r = await client.get(f"{settings.OLLAMA_URL}/api/tags")
            if r.status_code == 200:
                models = r.json().get("models", [])
                model_names = [m.get("name", "") for m in models]
                model_available = any(settings.OLLAMA_MODEL in m for m in model_names)
                return {
                    "ollama_online": True,
                    "target_model": settings.OLLAMA_MODEL,
                    "model_available": model_available,
                    "available_models": model_names,
                }
    except Exception:
        pass
    return {
        "ollama_online": False,
        "target_model": settings.OLLAMA_MODEL,
        "model_available": False,
        "note": "Start Ollama and run: ollama pull qwen2.5:7b",
    }