from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.database import get_db, UniverseModel, EventModel, RelationshipModel
from app.engines.paradox_engine import ParadoxEngine
from app.engines.influence_engine import InfluenceEngine
from app.engines.consequence_engine import ConsequenceEngine
from app.engines.counterfactual_engine import CounterfactualEngine
from app.engines.multiverse_engine import KnowledgeTracker

router = APIRouter()
paradox_engine = ParadoxEngine()
influence_engine = InfluenceEngine()
consequence_engine = ConsequenceEngine()
counterfactual_engine = CounterfactualEngine()
knowledge_tracker = KnowledgeTracker()


def _get_universe_data(universe_id: str, db: Session):
    u = db.query(UniverseModel).filter(UniverseModel.id == universe_id).first()
    if not u:
        raise HTTPException(status_code=404, detail="Universe not found")
    events = [{"id": e.id, "label": e.label, "description": e.description,
               "event_type": e.event_type, "timestamp_value": e.timestamp_value,
               "pos_x": e.pos_x, "pos_y": e.pos_y, "color": e.color,
               "is_origin": e.is_origin, "is_terminal": e.is_terminal, "meta": e.meta or {}}
              for e in u.events]
    rels = [{"id": r.id, "source_id": r.source_id, "target_id": r.target_id,
             "label": r.label, "strength": r.strength, "delay": r.delay,
             "rel_type": r.rel_type, "meta": r.meta or {}}
            for r in u.relationships]
    return events, rels


@router.get("/{universe_id}/paradoxes")
def get_paradoxes(universe_id: str, db: Session = Depends(get_db)):
    events, rels = _get_universe_data(universe_id, db)
    paradoxes = paradox_engine.detect_all(events, rels)
    stability = paradox_engine.calculate_stability_score(events, rels)
    entropy = paradox_engine.calculate_timeline_entropy(events, rels)
    return {
        "universe_id": universe_id,
        "paradox_count": len(paradoxes),
        "paradoxes": paradoxes,
        "stability_score": stability,
        "timeline_entropy": entropy,
        "severity_breakdown": {
            "critical": sum(1 for p in paradoxes if p["severity"] == "critical"),
            "high": sum(1 for p in paradoxes if p["severity"] == "high"),
            "medium": sum(1 for p in paradoxes if p["severity"] == "medium"),
            "low": sum(1 for p in paradoxes if p["severity"] == "low"),
        },
    }


@router.get("/{universe_id}/influence")
def get_influence(universe_id: str, db: Session = Depends(get_db)):
    events, rels = _get_universe_data(universe_id, db)
    return influence_engine.analyze(events, rels)


@router.get("/{universe_id}/consequences/{event_id}")
def get_consequences(universe_id: str, event_id: str, db: Session = Depends(get_db)):
    events, rels = _get_universe_data(universe_id, db)
    return consequence_engine.analyze(events, rels, event_id)


@router.get("/{universe_id}/counterfactual/{event_id}")
def get_counterfactual(universe_id: str, event_id: str, db: Session = Depends(get_db)):
    events, rels = _get_universe_data(universe_id, db)
    return counterfactual_engine.analyze(events, rels, event_id)


@router.get("/{universe_id}/collapse/{event_id}")
def get_collapse(universe_id: str, event_id: str, db: Session = Depends(get_db)):
    events, rels = _get_universe_data(universe_id, db)
    return consequence_engine.collapse_simulation(events, rels, event_id)


@router.get("/{universe_id}/knowledge")
def get_knowledge(universe_id: str, db: Session = Depends(get_db)):
    events, rels = _get_universe_data(universe_id, db)
    return knowledge_tracker.analyze(events, rels)


@router.get("/{universe_id}/dashboard")
def get_dashboard(universe_id: str, db: Session = Depends(get_db)):
    events, rels = _get_universe_data(universe_id, db)
    paradoxes = paradox_engine.detect_all(events, rels)
    stability = paradox_engine.calculate_stability_score(events, rels)
    entropy = paradox_engine.calculate_timeline_entropy(events, rels)
    influence = influence_engine.analyze(events, rels)
    graph_metrics = influence.get("graph_metrics", {})

    top_events = influence.get("events", [])[:5]
    paradox_penalty = sum({"critical": 20, "high": 12, "medium": 6, "low": 2}.get(p["severity"], 3) for p in paradoxes)
    health_index = max(0.0, min(100.0, stability - paradox_penalty * 0.5))

    collapse_risk = 0.0
    if len(events) > 0:
        most_influential = influence.get("rankings", {}).get("most_influential", {})
        reachability = most_influential.get("reachability", 0) if most_influential else 0
        collapse_risk = min(100.0, (reachability / max(1, len(events))) * 100)

    return {
        "universe_id": universe_id,
        "stability_score": stability,
        "timeline_entropy": entropy,
        "paradox_count": len(paradoxes),
        "collapse_risk": round(collapse_risk, 2),
        "universe_health_index": round(health_index, 2),
        "dependency_density": round(graph_metrics.get("density", 0) * 100, 2),
        "event_count": len(events),
        "relationship_count": len(rels),
        "is_dag": graph_metrics.get("is_dag", True),
        "cycle_count": graph_metrics.get("cycle_count", 0),
        "top_influential_events": top_events,
        "severity_breakdown": {
            "critical": sum(1 for p in paradoxes if p["severity"] == "critical"),
            "high": sum(1 for p in paradoxes if p["severity"] == "high"),
            "medium": sum(1 for p in paradoxes if p["severity"] == "medium"),
            "low": sum(1 for p in paradoxes if p["severity"] == "low"),
        },
        "graph_metrics": graph_metrics,
        "rankings": influence.get("rankings", {}),
    }
