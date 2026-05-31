from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
import uuid


class EventCreate(BaseModel):
    label: str
    description: str = ""
    event_type: str = "standard"
    timestamp_value: float = 0.0
    pos_x: float = 0.0
    pos_y: float = 0.0
    color: str = "#00d4ff"
    is_origin: bool = False
    is_terminal: bool = False
    meta: Dict[str, Any] = {}


class EventUpdate(BaseModel):
    label: Optional[str] = None
    description: Optional[str] = None
    event_type: Optional[str] = None
    timestamp_value: Optional[float] = None
    pos_x: Optional[float] = None
    pos_y: Optional[float] = None
    color: Optional[str] = None
    is_origin: Optional[bool] = None
    is_terminal: Optional[bool] = None
    meta: Optional[Dict[str, Any]] = None


class EventResponse(BaseModel):
    id: str
    universe_id: str
    label: str
    description: str
    event_type: str
    timestamp_value: float
    pos_x: float
    pos_y: float
    color: str
    is_origin: bool
    is_terminal: bool
    meta: Dict[str, Any]

    class Config:
        from_attributes = True


class RelationshipCreate(BaseModel):
    source_id: str
    target_id: str
    label: str = "causes"
    strength: float = Field(1.0, ge=0.0, le=1.0)
    delay: float = 0.0
    rel_type: str = "causal"
    meta: Dict[str, Any] = {}


class RelationshipResponse(BaseModel):
    id: str
    universe_id: str
    source_id: str
    target_id: str
    label: str
    strength: float
    delay: float
    rel_type: str
    meta: Dict[str, Any]

    class Config:
        from_attributes = True


class UniverseCreate(BaseModel):
    name: str
    description: str = ""
    meta: Dict[str, Any] = {}


class UniverseUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    meta: Optional[Dict[str, Any]] = None


class UniverseResponse(BaseModel):
    id: str
    name: str
    description: str
    stability_score: float
    paradox_count: int
    created_at: datetime
    updated_at: datetime
    meta: Dict[str, Any]
    events: List[EventResponse] = []
    relationships: List[RelationshipResponse] = []

    class Config:
        from_attributes = True


class UniverseGraphInput(BaseModel):
    events: List[Dict[str, Any]]
    relationships: List[Dict[str, Any]]


class AIParseRequest(BaseModel):
    text: str
    universe_id: Optional[str] = None


class CounterfactualRequest(BaseModel):
    universe_id: str
    remove_event_id: str


class MultiverseRequest(BaseModel):
    universe_id: str
    branch_event_id: str
    branch_name: str
