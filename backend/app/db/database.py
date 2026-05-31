from sqlalchemy import create_engine, Column, String, Float, Text, Integer, DateTime, JSON, ForeignKey, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from datetime import datetime
import uuid
from app.core.config import settings

connect_args = {"check_same_thread": False} if "sqlite" in settings.DATABASE_URL else {}

engine = create_engine(settings.DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


class UniverseModel(Base):
    __tablename__ = "universes"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False)
    description = Column(Text, default="")
    stability_score = Column(Float, default=100.0)
    paradox_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    meta = Column(JSON, default=dict)
    events = relationship("EventModel", back_populates="universe", cascade="all, delete-orphan")
    relationships = relationship("RelationshipModel", back_populates="universe", cascade="all, delete-orphan")


class EventModel(Base):
    __tablename__ = "events"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    universe_id = Column(String, ForeignKey("universes.id"), nullable=False)
    label = Column(String, nullable=False)
    description = Column(Text, default="")
    event_type = Column(String, default="standard")
    timestamp_value = Column(Float, default=0.0)
    pos_x = Column(Float, default=0.0)
    pos_y = Column(Float, default=0.0)
    color = Column(String, default="#00d4ff")
    is_origin = Column(Boolean, default=False)
    is_terminal = Column(Boolean, default=False)
    meta = Column(JSON, default=dict)
    universe = relationship("UniverseModel", back_populates="events")


class RelationshipModel(Base):
    __tablename__ = "relationships"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    universe_id = Column(String, ForeignKey("universes.id"), nullable=False)
    source_id = Column(String, nullable=False)
    target_id = Column(String, nullable=False)
    label = Column(String, default="causes")
    strength = Column(Float, default=1.0)
    delay = Column(Float, default=0.0)
    rel_type = Column(String, default="causal")
    meta = Column(JSON, default=dict)
    universe = relationship("UniverseModel", back_populates="relationships")


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def create_tables():
    Base.metadata.create_all(bind=engine)
