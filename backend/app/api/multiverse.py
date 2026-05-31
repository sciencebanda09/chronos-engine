from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.db.database import get_db, UniverseModel
from app.engines.multiverse_engine import MultiverseEngine

router = APIRouter()
multiverse_engine = MultiverseEngine()


class BranchRequest(BaseModel):
    branch_event_id: str
    branch_name: str = "Beta"


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
             "rel_type": r.rel_type}
            for r in u.relationships]
    return events, rels


@router.post("/{universe_id}/branch")
def create_branch(universe_id: str, body: BranchRequest, db: Session = Depends(get_db)):
    events, rels = _get_universe_data(universe_id, db)
    return multiverse_engine.create_branch(events, rels, body.branch_event_id, body.branch_name)
