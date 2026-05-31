"""
Counterfactual Engine — "What if this event never happened?"

Clones universe, removes event, recomputes graph, shows delta.
"""

import networkx as nx
from typing import List, Dict, Any
from .paradox_engine import ParadoxEngine


class CounterfactualEngine:

    def __init__(self):
        self.paradox_engine = ParadoxEngine()

    def build_graph(self, events: List[Dict], relationships: List[Dict]) -> nx.DiGraph:
        G = nx.DiGraph()
        for e in events:
            G.add_node(e["id"], label=e.get("label", ""), event_type=e.get("event_type", ""), description=e.get("description", ""), importance=e.get("importance", 5))
        for r in relationships:
            G.add_edge(r["source_id"], r["target_id"],
                       strength=r.get("strength", 1.0),
                       label=r.get("label", "causes"))
        return G

    def analyze(self, events: List[Dict], relationships: List[Dict], removed_event_id: str) -> Dict[str, Any]:
        G_original = self.build_graph(events, relationships)

        if removed_event_id not in G_original:
            return {"error": f"Event '{removed_event_id}' not found in this universe."}

        removed_label = G_original.nodes[removed_event_id].get("label", removed_event_id)

        # Build counterfactual universe (without the removed event)
        counterfactual_events = [e for e in events if e["id"] != removed_event_id]
        counterfactual_rels = [r for r in relationships
                               if r["source_id"] != removed_event_id and r["target_id"] != removed_event_id]
        G_cf = self.build_graph(counterfactual_events, counterfactual_rels)

        # What was reachable in original
        original_descendants = nx.descendants(G_original, removed_event_id)
        original_ancestors = nx.ancestors(G_original, removed_event_id)

        # In counterfactual, which nodes are now unreachable from any origin?
        cf_origins = [n for n in G_cf.nodes() if G_cf.in_degree(n) == 0]
        cf_reachable = set()
        for origin in cf_origins:
            cf_reachable.add(origin)
            cf_reachable.update(nx.descendants(G_cf, origin))
        cf_orphaned = set(G_cf.nodes()) - cf_reachable

        # Events that exist in counterfactual and are still reachable
        cf_nodes = set(G_cf.nodes())
        original_nodes = set(G_original.nodes())

        lost = original_descendants
        preserved = cf_nodes - cf_orphaned

        # Stability comparison
        original_stability = self.paradox_engine.calculate_stability_score(events, relationships)
        cf_stability = self.paradox_engine.calculate_stability_score(counterfactual_events, counterfactual_rels)
        original_entropy = self.paradox_engine.calculate_timeline_entropy(events, relationships)
        cf_entropy = self.paradox_engine.calculate_timeline_entropy(counterfactual_events, counterfactual_rels)

        # Paradox comparison
        original_paradoxes = self.paradox_engine.detect_all(events, relationships)
        cf_paradoxes = self.paradox_engine.detect_all(counterfactual_events, counterfactual_rels)

        # Timeline difference
        changed_outcomes = self._find_changed_outcomes(G_original, G_cf, removed_event_id)

        return {
            "scenario": f"What if '{removed_label}' never happened?",
            "removed_event": {"id": removed_event_id, "label": removed_label},
            "original_universe": {
                "event_count": len(events),
                "relationship_count": len(relationships),
                "stability": original_stability,
                "entropy": original_entropy,
                "paradox_count": len(original_paradoxes),
            },
            "counterfactual_universe": {
                "event_count": len(counterfactual_events),
                "relationship_count": len(counterfactual_rels),
                "stability": cf_stability,
                "entropy": cf_entropy,
                "paradox_count": len(cf_paradoxes),
            },
            "delta": {
                "stability_change": round(cf_stability - original_stability, 2),
                "entropy_change": round(cf_entropy - original_entropy, 2),
                "paradox_change": len(cf_paradoxes) - len(original_paradoxes),
                "events_lost": len(lost),
                "events_orphaned": len(cf_orphaned),
                "events_preserved": len(preserved),
            },
            "lost_events": [
                {"id": n, "label": G_original.nodes[n].get("label", n)}
                for n in lost
            ],
            "orphaned_events": [
                {"id": n, "label": G_cf.nodes[n].get("label", n)}
                for n in cf_orphaned
            ],
            "affected_ancestors": [
                {"id": n, "label": G_original.nodes[n].get("label", n)}
                for n in original_ancestors
            ],
            "changed_outcomes": changed_outcomes,
            "new_paradoxes": [p for p in cf_paradoxes if p["paradox_type"] not in [op["paradox_type"] for op in original_paradoxes]],
            "resolved_paradoxes": [p for p in original_paradoxes if p["paradox_type"] not in [cp["paradox_type"] for cp in cf_paradoxes]],
            "verdict": self._generate_verdict(removed_label, lost, cf_orphaned, original_stability, cf_stability),
        }

    def _find_changed_outcomes(self, G_orig: nx.DiGraph, G_cf: nx.DiGraph, removed_id: str) -> List[Dict[str, Any]]:
        changed = []
        for node in G_orig.nodes():
            if node == removed_id:
                continue
            orig_preds = set(G_orig.predecessors(node))
            cf_preds = set(G_cf.predecessors(node)) if node in G_cf else set()
            if orig_preds != cf_preds:
                label = G_orig.nodes[node].get("label", node)
                lost_inputs = orig_preds - cf_preds
                changed.append({
                    "event_id": node,
                    "label": label,
                    "change": "lost_inputs",
                    "lost_cause_ids": list(lost_inputs),
                    "still_exists": node in G_cf and node not in (set(G_orig.nodes()) - set(G_cf.nodes())),
                })
        return changed[:20]  # Limit for response size

    def _generate_verdict(self, label: str, lost: set, orphaned: set, orig_stab: float, cf_stab: float) -> str:
        total_affected = len(lost) + len(orphaned)
        stab_delta = cf_stab - orig_stab
        if total_affected == 0:
            return f"Removing '{label}' has minimal impact. The universe restructures cleanly."
        severity = "catastrophic" if total_affected > 10 else "significant" if total_affected > 5 else "moderate"
        stab_desc = "increasing" if stab_delta > 5 else "decreasing" if stab_delta < -5 else "roughly maintaining"
        return f"Removing '{label}' causes {severity} timeline collapse, affecting {total_affected} event(s) and {stab_desc} stability by {stab_delta:+.1f} points."

