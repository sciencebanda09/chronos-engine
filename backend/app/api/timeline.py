from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.database import get_db, UniverseModel
from app.engines.timeline_engine import TimelineEngine

router = APIRouter()
timeline_engine = TimelineEngine()


def _get_universe_data(universe_id: str, db: Session):
    u = db.query(UniverseModel).filter(UniverseModel.id == universe_id).first()
    if not u:
        raise HTTPException(status_code=404, detail="Universe not found")
    events = [{"id": e.id, "label": e.label, "description": e.description,
               "timestamp_value": e.timestamp_value, "is_origin": e.is_origin,
               "is_terminal": e.is_terminal}
              for e in u.events]
    rels = [{"id": r.id, "source_id": r.source_id, "target_id": r.target_id,
             "label": r.label, "strength": r.strength, "delay": r.delay}
            for r in u.relationships]
    return events, rels


@router.get("/{universe_id}/compile")
def compile_timeline(universe_id: str, db: Session = Depends(get_db)):
    events, rels = _get_universe_data(universe_id, db)
    return timeline_engine.compile_timeline(events, rels)


@router.get("/{universe_id}/activation-times")
def get_activation_times(universe_id: str, db: Session = Depends(get_db)):
    events, rels = _get_universe_data(universe_id, db)
    return timeline_engine.get_event_activation_time(events, rels)
