"""
Paradox Engine — Detects causal paradoxes in universe graphs.

All reasoning is algorithmic using NetworkX. No AI involved in detection.
"""

import networkx as nx
from typing import List, Dict, Any, Set, Optional
from enum import Enum
from dataclasses import dataclass, asdict


class ParadoxType(str, Enum):
    GRANDFATHER = "grandfather"
    BOOTSTRAP = "bootstrap"
    SELF_CAUSATION = "self_causation"
    INFINITE_LOOP = "infinite_loop"
    ONTOLOGICAL = "ontological"
    INFORMATION_VOID = "information_void"
    TIMELINE_CONTRADICTION = "timeline_contradiction"
    RECURSIVE_REALITY = "recursive_reality"


class ParadoxSeverity(str, Enum):
    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"


@dataclass
class Paradox:
    id: str
    paradox_type: str
    severity: str
    explanation: str
    impacted_nodes: List[str]
    cycle: List[str]
    recommended_fix: str
    confidence: float
    cycle_length: int
    external_impact: int

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


class ParadoxEngine:
    def __init__(self):
        self._paradox_counter = 0

    def _next_id(self) -> str:
        self._paradox_counter += 1
        return f"pdx_{self._paradox_counter:04d}"

    def build_graph(self, events: List[Dict], relationships: List[Dict]) -> nx.DiGraph:
        G = nx.DiGraph()
        for e in events:
            G.add_node(e["id"], label=e.get("label", ""), event_type=e.get("event_type", ""), description=e.get("description", ""), importance=e.get("importance", 5))
        for r in relationships:
            G.add_edge(
                r["source_id"],
                r["target_id"],
                id=r.get("id", ""),
                label=r.get("label", "causes"),
                strength=r.get("strength", 1.0),
                weight=r.get("strength", 1.0),
            )
        return G

    def detect_all(self, events: List[Dict], relationships: List[Dict]) -> List[Dict[str, Any]]:
        self._paradox_counter = 0
        G = self.build_graph(events, relationships)
        paradoxes = []

        paradoxes.extend(self._detect_self_causation(G))
        paradoxes.extend(self._detect_cycles(G))
        paradoxes.extend(self._detect_information_voids(G))
        paradoxes.extend(self._detect_timeline_contradictions(G, events))

        # Deduplicate by cycle signature
        seen = set()
        unique = []
        for p in paradoxes:
            sig = frozenset(p.cycle)
            if sig not in seen:
                seen.add(sig)
                unique.append(p)

        return [p.to_dict() for p in unique]

    def _detect_self_causation(self, G: nx.DiGraph) -> List[Paradox]:
        result = []
        for node in G.nodes():
            if G.has_edge(node, node):
                label = G.nodes[node].get("label", node)
                result.append(Paradox(
                    id=self._next_id(),
                    paradox_type=ParadoxType.SELF_CAUSATION,
                    severity=ParadoxSeverity.CRITICAL,
                    explanation=f"'{label}' directly causes itself. This is a fundamental self-referential paradox — an event cannot be its own origin.",
                    impacted_nodes=[node],
                    cycle=[node],
                    recommended_fix=f"Remove the self-referential edge on '{label}', or introduce an external triggering event that precedes it.",
                    confidence=1.0,
                    cycle_length=1,
                    external_impact=G.in_degree(node) + G.out_degree(node) - 2,
                ))
        return result

    def _detect_cycles(self, G: nx.DiGraph) -> List[Paradox]:
        result = []
        try:
            cycles = list(nx.simple_cycles(G))
        except Exception:
            return result

        for cycle in cycles:
            if len(cycle) < 2:
                continue
            ptype = self._classify_cycle_type(G, cycle)
            severity = self._calculate_severity(G, cycle)
            explanation = self._generate_explanation(G, ptype, cycle)
            fix = self._generate_fix(ptype, cycle, G)
            ext_impact = self._count_external_connections(G, cycle)

            result.append(Paradox(
                id=self._next_id(),
                paradox_type=ptype,
                severity=severity,
                explanation=explanation,
                impacted_nodes=list(cycle),
                cycle=list(cycle),
                recommended_fix=fix,
                confidence=self._calculate_confidence(cycle),
                cycle_length=len(cycle),
                external_impact=ext_impact,
            ))
        return result

    def _detect_information_voids(self, G: nx.DiGraph) -> List[Paradox]:
        result = []
        try:
            sccs = list(nx.strongly_connected_components(G))
        except Exception:
            return result

        for scc in sccs:
            if len(scc) < 2:
                continue
            has_external = any(
                any(pred not in scc for pred in G.predecessors(n))
                for n in scc
            )
            if not has_external:
                scc_list = list(scc)
                labels = [G.nodes[n].get("label", n) for n in scc_list[:3]]
                label_str = ", ".join(labels) + ("..." if len(scc_list) > 3 else "")
                result.append(Paradox(
                    id=self._next_id(),
                    paradox_type=ParadoxType.INFORMATION_VOID,
                    severity=ParadoxSeverity.HIGH,
                    explanation=f"This causal cluster ({label_str}) has absolutely no external inputs. It exists without any cause outside itself — an isolated causation bubble with no origin point.",
                    impacted_nodes=scc_list,
                    cycle=scc_list,
                    recommended_fix="Add an external origin event that bootstraps one event in this cluster. Every closed system needs an initial condition.",
                    confidence=0.88,
                    cycle_length=len(scc_list),
                    external_impact=sum(G.out_degree(n) for n in scc_list),
                ))
        return result

    def _detect_timeline_contradictions(self, G: nx.DiGraph, events: List[Dict]) -> List[Paradox]:
        result = []
        event_map = {e["id"]: e for e in events}

        for u, v in G.edges():
            u_ts = event_map.get(u, {}).get("timestamp_value", None)
            v_ts = event_map.get(v, {}).get("timestamp_value", None)
            if u_ts is not None and v_ts is not None and u_ts > v_ts and u_ts != 0 and v_ts != 0:
                u_label = G.nodes[u].get("label", u)
                v_label = G.nodes[v].get("label", v)
                result.append(Paradox(
                    id=self._next_id(),
                    paradox_type=ParadoxType.TIMELINE_CONTRADICTION,
                    severity=ParadoxSeverity.MEDIUM,
                    explanation=f"Temporal violation: '{u_label}' (T={u_ts}) is said to cause '{v_label}' (T={v_ts}), but the effect precedes its cause in time.",
                    impacted_nodes=[u, v],
                    cycle=[u, v],
                    recommended_fix=f"Correct the timestamps so '{u_label}' occurs before '{v_label}', or introduce time travel mechanics explicitly.",
                    confidence=0.95,
                    cycle_length=2,
                    external_impact=1,
                ))
        return result

    def _classify_cycle_type(self, G: nx.DiGraph, cycle: List[str]) -> str:
        labels_lower = " ".join(G.nodes[n].get("label", "").lower() for n in cycle)
        if any(kw in labels_lower for kw in ["kill", "destroy", "prevent", "stop", "erase", "murder", "death", "eliminate"]):
            return ParadoxType.GRANDFATHER
        if any(kw in labels_lower for kw in ["research", "knowledge", "info", "data", "theorem", "book", "paper", "idea", "code", "formula"]):
            return ParadoxType.BOOTSTRAP
        if len(cycle) == 2:
            return ParadoxType.ONTOLOGICAL
        if len(cycle) > 6:
            return ParadoxType.RECURSIVE_REALITY
        return ParadoxType.INFINITE_LOOP

    def _calculate_severity(self, G: nx.DiGraph, cycle: List[str]) -> str:
        ext = self._count_external_connections(G, cycle)
        if ext > 10 or len(cycle) > 5:
            return ParadoxSeverity.CRITICAL
        elif ext > 5 or len(cycle) > 3:
            return ParadoxSeverity.HIGH
        elif ext > 2:
            return ParadoxSeverity.MEDIUM
        return ParadoxSeverity.LOW

    def _count_external_connections(self, G: nx.DiGraph, cycle: List[str]) -> int:
        cycle_set = set(cycle)
        count = 0
        for n in cycle:
            for pred in G.predecessors(n):
                if pred not in cycle_set:
                    count += 1
            for succ in G.successors(n):
                if succ not in cycle_set:
                    count += 1
        return count

    def _generate_explanation(self, G: nx.DiGraph, ptype: str, cycle: List[str]) -> str:
        labels = [G.nodes[n].get("label", n) for n in cycle]
        chain = " → ".join(labels) + f" → {labels[0]}"
        explanations = {
            ParadoxType.GRANDFATHER: f"A destructive causal loop detected: {chain}. An event in this cycle causes the prevention of one of its own preconditions — making its own existence impossible.",
            ParadoxType.BOOTSTRAP: f"Bootstrap paradox: {chain}. Knowledge or information in this cycle has no external origin — it creates itself. The information exists without ever being created.",
            ParadoxType.ONTOLOGICAL: f"Ontological paradox: {chain}. These two events are mutually dependent — each one causes the other to exist, but neither has an independent origin.",
            ParadoxType.INFINITE_LOOP: f"Infinite causal loop: {chain}. These {len(cycle)} events perpetually cause each other in a closed cycle with no external input or exit condition.",
            ParadoxType.RECURSIVE_REALITY: f"Deep recursive reality loop across {len(cycle)} events: {chain}. Reality folds into itself across this extended chain, creating a self-sustaining causal prison.",
            ParadoxType.SELF_CAUSATION: f"Self-causation: an event is its own direct cause.",
        }
        return explanations.get(ptype, f"Causal cycle detected: {chain}")

    def _generate_fix(self, ptype: str, cycle: List[str], G: nx.DiGraph) -> str:
        first_label = G.nodes[cycle[0]].get("label", cycle[0]) if cycle else "?"
        last_label = G.nodes[cycle[-1]].get("label", cycle[-1]) if cycle else "?"
        fixes = {
            ParadoxType.GRANDFATHER: f"Break the destructive link from '{last_label}' back to '{first_label}'. Consider introducing a parallel timeline branch to absorb the contradiction.",
            ParadoxType.BOOTSTRAP: f"Introduce an external origin event that creates the initial information independently. Every piece of knowledge must have a creator outside the loop.",
            ParadoxType.ONTOLOGICAL: f"Add a common ancestor event that independently causes both '{first_label}' and '{last_label}', breaking their mutual dependency.",
            ParadoxType.INFINITE_LOOP: f"Remove the weakest causal link in the cycle (typically '{last_label}' → '{first_label}'). Alternatively, introduce a stabilizing terminal event.",
            ParadoxType.RECURSIVE_REALITY: f"Introduce timeline branches at 2+ points in this loop. Consider marking one event as an axiom — a self-evident starting point requiring no cause.",
        }
        return fixes.get(ptype, f"Remove the causal link from '{last_label}' to '{first_label}' to break the cycle.")

    def _calculate_confidence(self, cycle: List[str]) -> float:
        return max(0.7, min(1.0, 1.0 - len(cycle) * 0.04))

    def calculate_stability_score(self, events: List[Dict], relationships: List[Dict]) -> float:
        if not events:
            return 100.0
        G = self.build_graph(events, relationships)
        paradoxes = self.detect_all(events, relationships)
        score = 100.0
        penalties = {
            ParadoxSeverity.CRITICAL: 20.0,
            ParadoxSeverity.HIGH: 12.0,
            ParadoxSeverity.MEDIUM: 6.0,
            ParadoxSeverity.LOW: 2.0,
        }
        for p in paradoxes:
            score -= penalties.get(p.get("severity", "low"), 3.0)

        # Density penalty
        n, e = len(events), len(relationships)
        if n > 1:
            density = e / (n * (n - 1))
            if density > 0.5:
                score -= (density - 0.5) * 20

        return round(max(0.0, min(100.0, score)), 2)

    def calculate_timeline_entropy(self, events: List[Dict], relationships: List[Dict]) -> float:
        if not events:
            return 0.0
        G = self.build_graph(events, relationships)
        n = len(G.nodes())
        if n < 2:
            return 0.0
        try:
            cycles = list(nx.simple_cycles(G))
            cycle_score = min(1.0, len(cycles) / max(1, n))
        except Exception:
            cycle_score = 0.0
        try:
            components = nx.number_weakly_connected_components(G)
            fragmentation = (components - 1) / n
        except Exception:
            fragmentation = 0.0
        density = nx.density(G)
        entropy = (cycle_score * 0.5 + fragmentation * 0.3 + density * 0.2) * 100
        return round(min(100.0, entropy), 2)

