from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import universes, analysis, parser, timeline, multiverse
from app.core.config import settings
from app.db.database import create_tables

app = FastAPI(
    title="Chronos Engine API",
    description="Causal Intelligence Platform — Computational Laboratory for Causality",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup():
    create_tables()

app.include_router(universes.router, prefix="/api/universes", tags=["universes"])
app.include_router(analysis.router, prefix="/api/analysis", tags=["analysis"])
app.include_router(parser.router, prefix="/api/parser", tags=["parser"])
app.include_router(timeline.router, prefix="/api/timeline", tags=["timeline"])
app.include_router(multiverse.router, prefix="/api/multiverse", tags=["multiverse"])

@app.get("/")
async def root():
    return {"status": "Chronos Engine Online", "version": "1.0.0", "tagline": "Computational Laboratory for Causality"}

@app.get("/health")
async def health():
    return {"status": "healthy", "database": "connected", "engines": "ready"}
