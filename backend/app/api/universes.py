from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import uuid
from datetime import datetime

from app.db.database import get_db, UniverseModel, EventModel, RelationshipModel
from app.schemas.universe import (
    UniverseCreate, UniverseUpdate, UniverseResponse,
    EventCreate, EventUpdate, EventResponse,
    RelationshipCreate, RelationshipResponse,
)
from app.engines.causal_compiler import CausalCompiler

router = APIRouter()
compiler = CausalCompiler()


def _universe_to_dict(u: UniverseModel) -> dict:
    return {
        "id": u.id,
        "name": u.name,
        "description": u.description,
        "stability_score": u.stability_score,
        "paradox_count": u.paradox_count,
        "created_at": u.created_at,
        "updated_at": u.updated_at,
        "meta": u.meta or {},
        "events": [_event_to_dict(e) for e in u.events],
        "relationships": [_rel_to_dict(r) for r in u.relationships],
    }


def _event_to_dict(e: EventModel) -> dict:
    return {
        "id": e.id,
        "universe_id": e.universe_id,
        "label": e.label,
        "description": e.description,
        "event_type": e.event_type,
        "timestamp_value": e.timestamp_value,
        "pos_x": e.pos_x,
        "pos_y": e.pos_y,
        "color": e.color,
        "is_origin": e.is_origin,
        "is_terminal": e.is_terminal,
        "meta": e.meta or {},
    }


def _rel_to_dict(r: RelationshipModel) -> dict:
    return {
        "id": r.id,
        "universe_id": r.universe_id,
        "source_id": r.source_id,
        "target_id": r.target_id,
        "label": r.label,
        "strength": r.strength,
        "delay": r.delay,
        "rel_type": r.rel_type,
        "meta": r.meta or {},
    }


# ─── Universes ────────────────────────────────────────────────────────────────

@router.get("/", response_model=List[dict])
def list_universes(db: Session = Depends(get_db)):
    universes = db.query(UniverseModel).order_by(UniverseModel.updated_at.desc()).all()
    return [_universe_to_dict(u) for u in universes]


@router.post("/", response_model=dict, status_code=201)
def create_universe(body: UniverseCreate, db: Session = Depends(get_db)):
    u = UniverseModel(
        id=str(uuid.uuid4()),
        name=body.name,
        description=body.description,
        meta=body.meta,
    )
    db.add(u)
    db.commit()
    db.refresh(u)
    return _universe_to_dict(u)


@router.get("/{universe_id}", response_model=dict)
def get_universe(universe_id: str, db: Session = Depends(get_db)):
    u = db.query(UniverseModel).filter(UniverseModel.id == universe_id).first()
    if not u:
        raise HTTPException(status_code=404, detail="Universe not found")
    return _universe_to_dict(u)


@router.patch("/{universe_id}", response_model=dict)
def update_universe(universe_id: str, body: UniverseUpdate, db: Session = Depends(get_db)):
    u = db.query(UniverseModel).filter(UniverseModel.id == universe_id).first()
    if not u:
        raise HTTPException(status_code=404, detail="Universe not found")
    if body.name is not None:
        u.name = body.name
    if body.description is not None:
        u.description = body.description
    if body.meta is not None:
        u.meta = body.meta
    u.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(u)
    return _universe_to_dict(u)


@router.delete("/{universe_id}", status_code=204)
def delete_universe(universe_id: str, db: Session = Depends(get_db)):
    u = db.query(UniverseModel).filter(UniverseModel.id == universe_id).first()
    if not u:
        raise HTTPException(status_code=404, detail="Universe not found")
    db.delete(u)
    db.commit()


# ─── Events ───────────────────────────────────────────────────────────────────

@router.post("/{universe_id}/events", response_model=dict, status_code=201)
def create_event(universe_id: str, body: EventCreate, db: Session = Depends(get_db)):
    u = db.query(UniverseModel).filter(UniverseModel.id == universe_id).first()
    if not u:
        raise HTTPException(status_code=404, detail="Universe not found")
    e = EventModel(
        id=str(uuid.uuid4()),
        universe_id=universe_id,
        label=body.label,
        description=body.description,
        event_type=body.event_type,
        timestamp_value=body.timestamp_value,
        pos_x=body.pos_x,
        pos_y=body.pos_y,
        color=body.color,
        is_origin=body.is_origin,
        is_terminal=body.is_terminal,
        meta=body.meta,
    )
    db.add(e)
    u.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(e)
    return _event_to_dict(e)


@router.patch("/{universe_id}/events/{event_id}", response_model=dict)
def update_event(universe_id: str, event_id: str, body: EventUpdate, db: Session = Depends(get_db)):
    e = db.query(EventModel).filter(EventModel.id == event_id, EventModel.universe_id == universe_id).first()
    if not e:
        raise HTTPException(status_code=404, detail="Event not found")
    for field, value in body.model_dump(exclude_none=True).items():
        setattr(e, field, value)
    db.commit()
    db.refresh(e)
    return _event_to_dict(e)


@router.delete("/{universe_id}/events/{event_id}", status_code=204)
def delete_event(universe_id: str, event_id: str, db: Session = Depends(get_db)):
    e = db.query(EventModel).filter(EventModel.id == event_id, EventModel.universe_id == universe_id).first()
    if not e:
        raise HTTPException(status_code=404, detail="Event not found")
    db.delete(e)
    db.commit()


# ─── Relationships ────────────────────────────────────────────────────────────

@router.post("/{universe_id}/relationships", response_model=dict, status_code=201)
def create_relationship(universe_id: str, body: RelationshipCreate, db: Session = Depends(get_db)):
    u = db.query(UniverseModel).filter(UniverseModel.id == universe_id).first()
    if not u:
        raise HTTPException(status_code=404, detail="Universe not found")
    r = RelationshipModel(
        id=str(uuid.uuid4()),
        universe_id=universe_id,
        source_id=body.source_id,
        target_id=body.target_id,
        label=body.label,
        strength=body.strength,
        delay=body.delay,
        rel_type=body.rel_type,
        meta=body.meta,
    )
    db.add(r)
    u.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(r)
    return _rel_to_dict(r)


@router.delete("/{universe_id}/relationships/{rel_id}", status_code=204)
def delete_relationship(universe_id: str, rel_id: str, db: Session = Depends(get_db)):
    r = db.query(RelationshipModel).filter(RelationshipModel.id == rel_id, RelationshipModel.universe_id == universe_id).first()
    if not r:
        raise HTTPException(status_code=404, detail="Relationship not found")
    db.delete(r)
    db.commit()


# ─── Compile ──────────────────────────────────────────────────────────────────

@router.post("/{universe_id}/compile", response_model=dict)
def compile_universe(universe_id: str, db: Session = Depends(get_db)):
    u = db.query(UniverseModel).filter(UniverseModel.id == universe_id).first()
    if not u:
        raise HTTPException(status_code=404, detail="Universe not found")
    events = [_event_to_dict(e) for e in u.events]
    rels = [_rel_to_dict(r) for r in u.relationships]
    result = compiler.compile(events, rels)
    # Update universe stability
    u.stability_score = result.get("compiled", {}).get("stability_score", u.stability_score)
    u.paradox_count = result.get("compiled", {}).get("paradox_count", u.paradox_count)
    u.updated_at = datetime.utcnow()
    db.commit()
    return result


# ─── Bulk sync (for frontend React Flow state) ────────────────────────────────

@router.post("/{universe_id}/sync", response_model=dict)
def sync_universe(universe_id: str, body: dict, db: Session = Depends(get_db)):
    """Bulk sync: replace all events and relationships from frontend state."""
    u = db.query(UniverseModel).filter(UniverseModel.id == universe_id).first()
    if not u:
        raise HTTPException(status_code=404, detail="Universe not found")

    # Delete existing events and relationships
    db.query(EventModel).filter(EventModel.universe_id == universe_id).delete()
    db.query(RelationshipModel).filter(RelationshipModel.universe_id == universe_id).delete()

    events_data = body.get("events", [])
    rels_data = body.get("relationships", [])

    for e in events_data:
        event = EventModel(
            id=e.get("id", str(uuid.uuid4())),
            universe_id=universe_id,
            label=e.get("label", "Event"),
            description=e.get("description", ""),
            event_type=e.get("event_type", "standard"),
            timestamp_value=e.get("timestamp_value", 0.0),
            pos_x=e.get("pos_x", 0.0),
            pos_y=e.get("pos_y", 0.0),
            color=e.get("color", "#00d4ff"),
            is_origin=e.get("is_origin", False),
            is_terminal=e.get("is_terminal", False),
            meta=e.get("meta", {}),
        )
        db.add(event)

    for r in rels_data:
        rel = RelationshipModel(
            id=r.get("id", str(uuid.uuid4())),
            universe_id=universe_id,
            source_id=r.get("source_id"),
            target_id=r.get("target_id"),
            label=r.get("label", "causes"),
            strength=r.get("strength", 1.0),
            delay=r.get("delay", 0.0),
            rel_type=r.get("rel_type", "causal"),
            meta=r.get("meta", {}),
        )
        db.add(rel)

    u.updated_at = datetime.utcnow()
    db.commit()
    return {"synced": True, "events": len(events_data), "relationships": len(rels_data)}
