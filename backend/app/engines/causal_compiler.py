"""
Causal Compiler - Treats universes like source code and compiles them into validated causal models.

Stages: Parse -> Validate -> Detect Contradictions -> Build Model -> Simulate -> Calculate Stability
"""

import networkx as nx
from typing import List, Dict, Any, Tuple
from datetime import datetime
from .paradox_engine import ParadoxEngine
from .influence_engine import InfluenceEngine
from .timeline_engine import TimelineEngine


class CausalCompiler:

    def __init__(self):
        self.paradox_engine = ParadoxEngine()
        self.influence_engine = InfluenceEngine()
        self.timeline_engine = TimelineEngine()

    def compile(self, events: List[Dict], relationships: List[Dict]) -> Dict[str, Any]:
        """Full compilation pipeline for a universe."""
        started_at = datetime.utcnow().isoformat()
        stages = []
        warnings = []
        errors = []

        stage1 = self._stage_parse(events, relationships)
        stages.append(stage1)
        if stage1["status"] == "error":
            return self._build_result("failed", stages, errors, warnings, {}, started_at)

        G: nx.DiGraph = stage1["graph"]

        stage2 = self._stage_validate_events(events, G)
        stages.append(stage2)
        warnings.extend(stage2.get("warnings", []))
        errors.extend(stage2.get("errors", []))

        stage3 = self._stage_validate_dependencies(relationships, G)
        stages.append(stage3)
        warnings.extend(stage3.get("warnings", []))
        errors.extend(stage3.get("errors", []))

        stage4 = self._stage_detect_contradictions(events, relationships, G)
        stages.append(stage4)
        warnings.extend(stage4.get("warnings", []))

        stage5 = self._stage_build_model(events, relationships, G)
        stages.append(stage5)

        stage6 = self._stage_simulate(events, relationships)
        stages.append(stage6)

        stage7 = self._stage_stability(events, relationships, stage4.get("paradox_count", 0))
        stages.append(stage7)

        final_status = "failed" if errors else ("warning" if warnings else "success")

        compiled = {
            "stability_score": stage7.get("stability_score", 100.0),
            "timeline_entropy": stage7.get("timeline_entropy", 0.0),
            "paradox_count": stage4.get("paradox_count", 0),
            "event_count": len(events),
            "relationship_count": len(relationships),
            "is_dag": nx.is_directed_acyclic_graph(G),
            "strongly_connected_components": nx.number_strongly_connected_components(G),
            "weakly_connected_components": nx.number_weakly_connected_components(G),
            "graph_density": round(nx.density(G), 4),
            "model": stage5.get("model", {}),
            "simulation": stage6.get("simulation", {}),
        }

        return self._build_result(final_status, stages, errors, warnings, compiled, started_at)

    def _stage_parse(self, events: List[Dict], relationships: List[Dict]) -> Dict[str, Any]:
        try:
            G = nx.DiGraph()
            for e in events:
                G.add_node(
                    e["id"],
                    label=e.get("label", ""),
                    event_type=e.get("event_type", ""),
                    description=e.get("description", ""),
                    importance=e.get("importance", 5),
                    timestamp_value=e.get("timestamp_value", 0.0),
                )
            for r in relationships:
                G.add_edge(
                    r["source_id"], r["target_id"],
                    label=r.get("label", "causes"),
                    strength=r.get("strength", 1.0),
                    delay=r.get("delay", 0.0),
                    relationship_type=r.get("relationship_type", ""),
                )
            return {
                "stage": 1,
                "name": "Parse Graph",
                "status": "success",
                "graph": G,
                "message": f"Parsed {len(events)} events and {len(relationships)} relationships.",
            }
        except Exception as ex:
            return {"stage": 1, "name": "Parse Graph", "status": "error",
                    "message": f"Parse error: {str(ex)}", "graph": nx.DiGraph()}

    def _stage_validate_events(self, events: List[Dict], G: nx.DiGraph) -> Dict[str, Any]:
        warnings, errors = [], []
        for e in events:
            if not e.get("label", "").strip():
                warnings.append(f"Event '{e.get('id', '?')}' has no label.")
        isolated = [n for n in G.nodes() if G.degree(n) == 0]
        if isolated:
            warnings.append(f"{len(isolated)} isolated event(s) with no connections: {', '.join(isolated[:5])}")
        return {
            "stage": 2,
            "name": "Validate Events",
            "status": "warning" if warnings else "success",
            "warnings": warnings,
            "errors": errors,
            "message": f"Validated {len(events)} events. {len(warnings)} warning(s).",
        }

    def _stage_validate_dependencies(self, relationships: List[Dict], G: nx.DiGraph) -> Dict[str, Any]:
        warnings, errors = [], []
        dangling = [(r["source_id"], r["target_id"]) for r in relationships
                    if r["source_id"] not in G.nodes() or r["target_id"] not in G.nodes()]
        if dangling:
            errors.append(f"{len(dangling)} relationship(s) reference non-existent events.")
        self_loops = [(u, v) for u, v in G.edges() if u == v]
        if self_loops:
            warnings.append(f"{len(self_loops)} self-referential relationship(s) detected.")
        return {
            "stage": 3,
            "name": "Validate Dependencies",
            "status": "error" if errors else ("warning" if warnings else "success"),
            "warnings": warnings,
            "errors": errors,
            "message": f"Validated {len(relationships)} relationships. {len(errors)} error(s).",
        }

    def _stage_detect_contradictions(self, events: List[Dict], relationships: List[Dict], G: nx.DiGraph) -> Dict[str, Any]:
        paradoxes = self.paradox_engine.detect_all(events, relationships)
        warnings = []
        if paradoxes:
            warnings.append(f"{len(paradoxes)} paradox/contradiction(s) detected in this universe.")
        return {
            "stage": 4,
            "name": "Detect Contradictions",
            "status": "warning" if paradoxes else "success",
            "warnings": warnings,
            "paradox_count": len(paradoxes),
            "paradoxes_summary": [{"type": p["paradox_type"], "severity": p["severity"]} for p in paradoxes],
            "message": f"Contradiction analysis complete. {len(paradoxes)} paradox(es) found.",
        }

    def _stage_build_model(self, events: List[Dict], relationships: List[Dict], G: nx.DiGraph) -> Dict[str, Any]:
        try:
            roots = [n for n in G.nodes() if G.in_degree(n) == 0]
            terminals = [n for n in G.nodes() if G.out_degree(n) == 0]
            influence_data = self.influence_engine.analyze(events, relationships)
            return {
                "stage": 5,
                "name": "Build Causal Model",
                "status": "success",
                "model": {
                    "root_events": roots,
                    "terminal_events": terminals,
                    "causal_chains": len(roots),
                    "graph_metrics": influence_data.get("graph_metrics", {}),
                },
                "message": "Causal model built successfully.",
            }
        except Exception as ex:
            return {"stage": 5, "name": "Build Causal Model", "status": "error", "message": str(ex), "model": {}}

    def _stage_simulate(self, events: List[Dict], relationships: List[Dict]) -> Dict[str, Any]:
        try:
            timeline = self.timeline_engine.compile_timeline(events, relationships)
            return {
                "stage": 6,
                "name": "Simulate Propagation",
                "status": "success",
                "simulation": {
                    "total_steps": timeline.get("total_steps", 0),
                    "is_deterministic": timeline.get("is_deterministic", True),
                    "root_events": timeline.get("root_events", []),
                    "terminal_events": timeline.get("terminal_events", []),
                },
                "message": f"Simulation complete: {timeline.get('total_steps', 0)} propagation steps.",
            }
        except Exception as ex:
            return {"stage": 6, "name": "Simulate Propagation", "status": "error", "message": str(ex), "simulation": {}}

    def _stage_stability(self, events: List[Dict], relationships: List[Dict], paradox_count: int) -> Dict[str, Any]:
        stability = self.paradox_engine.calculate_stability_score(events, relationships)
        entropy = self.paradox_engine.calculate_timeline_entropy(events, relationships)
        health_index = self._calculate_health_index(stability, entropy, paradox_count, len(events))
        return {
            "stage": 7,
            "name": "Calculate Stability",
            "status": "success",
            "stability_score": stability,
            "timeline_entropy": entropy,
            "universe_health_index": health_index,
            "message": f"Stability: {stability:.1f}/100 | Entropy: {entropy:.1f} | Health: {health_index:.1f}/100",
        }

    def _calculate_health_index(self, stability: float, entropy: float, paradoxes: int, events: int) -> float:
        if events == 0:
            return 100.0
        paradox_penalty = min(50, paradoxes * 10)
        entropy_penalty = entropy * 0.3
        health = stability - paradox_penalty - entropy_penalty
        return round(max(0.0, min(100.0, health)), 2)

    def _build_result(self, status: str, stages: List[Dict], errors: List[str], warnings: List[str], compiled: Dict, started_at: str) -> Dict[str, Any]:
        clean_stages = [{k: v for k, v in s.items() if k != "graph"} for s in stages]
        return {
            "status": status,
            "started_at": started_at,
            "completed_at": datetime.utcnow().isoformat(),
            "stages": clean_stages,
            "errors": errors,
            "warnings": warnings,
            "compiled": compiled,
        }