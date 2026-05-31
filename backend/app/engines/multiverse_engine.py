"""
Multiverse Engine — Manages universe branches and parallel timelines.
Knowledge Origin Tracker — Tracks information flow and detects bootstrap knowledge.
"""

import networkx as nx
from typing import List, Dict, Any, Optional
import uuid


class MultiverseEngine:

    def create_branch(
        self,
        events: List[Dict],
        relationships: List[Dict],
        branch_event_id: str,
        branch_name: str,
    ) -> Dict[str, Any]:
        """Create a new universe branch from a divergence point."""
        G = nx.DiGraph()
        for e in events:
            G.add_node(e["id"], label=e.get("label", ""), event_type=e.get("event_type", ""), description=e.get("description", ""))
        for r in relationships:
            G.add_edge(r["source_id"], r["target_id"], **r)

        if branch_event_id not in G:
            return {"error": "Branch event not found"}

        branch_label = G.nodes[branch_event_id].get("label", branch_event_id)

        # Events before branch point (ancestors + branch itself)
        ancestors = nx.ancestors(G, branch_event_id)
        pre_branch = ancestors | {branch_event_id}

        # Events after branch point
        descendants = nx.descendants(G, branch_event_id)

        # Alpha universe: keeps original path
        alpha_events = [e for e in events if e["id"] in pre_branch | descendants]
        alpha_rels = [r for r in relationships
                      if r["source_id"] in pre_branch | descendants
                      and r["target_id"] in pre_branch | descendants]

        # Beta universe (branch): shares pre-branch, diverges at branch point
        beta_events_base = [e for e in events if e["id"] in pre_branch]
        # The branch point event gets a new divergence marker
        beta_branch_event = {
            **{e for e in events if e["id"] == branch_event_id}.__iter__().__next__(),
            "label": f"{branch_label} [DIVERGENCE]",
            "color": "#7c3aed",
        } if any(e["id"] == branch_event_id for e in events) else None

        return {
            "branch_id": str(uuid.uuid4()),
            "branch_name": branch_name,
            "divergence_point": {
                "id": branch_event_id,
                "label": branch_label,
            },
            "shared_history": {
                "event_count": len(pre_branch),
                "events": [{"id": n, "label": G.nodes[n].get("label", n)} for n in ancestors],
            },
            "alpha_universe": {
                "name": "Alpha (Original)",
                "event_count": len(alpha_events),
                "relationship_count": len(alpha_rels),
                "events": alpha_events,
                "relationships": alpha_rels,
            },
            "beta_universe": {
                "name": f"Beta ({branch_name})",
                "event_count": len(beta_events_base),
                "relationship_count": sum(1 for r in relationships
                                         if r["source_id"] in pre_branch
                                         and r["target_id"] in pre_branch),
                "events": beta_events_base,
                "relationships": [r for r in relationships
                                  if r["source_id"] in pre_branch
                                  and r["target_id"] in pre_branch],
                "note": f"Timeline diverges after '{branch_label}'. Add new events to define this branch.",
            },
            "description": f"Universe branched at '{branch_label}'. Alpha continues the original timeline; Beta ({branch_name}) diverges from this point.",
        }

    def compare_branches(
        self,
        events_a: List[Dict],
        rels_a: List[Dict],
        events_b: List[Dict],
        rels_b: List[Dict],
        name_a: str = "Universe A",
        name_b: str = "Universe B",
    ) -> Dict[str, Any]:
        """Compare two universe branches."""
        ids_a = {e["id"] for e in events_a}
        ids_b = {e["id"] for e in events_b}

        shared = ids_a & ids_b
        only_a = ids_a - ids_b
        only_b = ids_b - ids_a

        labels_a = {e["id"]: e.get("label", e["id"]) for e in events_a}
        labels_b = {e["id"]: e.get("label", e["id"]) for e in events_b}

        return {
            "comparison": {
                name_a: {"event_count": len(events_a), "relationship_count": len(rels_a)},
                name_b: {"event_count": len(events_b), "relationship_count": len(rels_b)},
            },
            "shared_events": [{"id": n, "label": labels_a.get(n, n)} for n in shared],
            f"exclusive_to_{name_a}": [{"id": n, "label": labels_a.get(n, n)} for n in only_a],
            f"exclusive_to_{name_b}": [{"id": n, "label": labels_b.get(n, n)} for n in only_b],
            "divergence_score": round(len(only_a | only_b) / max(1, len(ids_a | ids_b)) * 100, 2),
            "shared_percentage": round(len(shared) / max(1, len(ids_a | ids_b)) * 100, 2),
        }


class KnowledgeTracker:
    """
    Tracks the origin of information through a causal universe.
    Detects bootstrap knowledge (info with no external creator),
    information loops, and knowledge without origin.
    """

    KNOWLEDGE_KEYWORDS = [
        "research", "knowledge", "information", "data", "theorem", "discovery",
        "formula", "code", "book", "paper", "idea", "theory", "invention",
        "algorithm", "proof", "axiom", "document", "message", "secret",
    ]

    def build_graph(self, events: List[Dict], relationships: List[Dict]) -> nx.DiGraph:
        G = nx.DiGraph()
        for e in events:
            G.add_node(e["id"], label=e.get("label", ""), event_type=e.get("event_type", ""), description=e.get("description", ""))
        for r in relationships:
            G.add_edge(r["source_id"], r["target_id"])
        return G

    def analyze(self, events: List[Dict], relationships: List[Dict]) -> Dict[str, Any]:
        G = self.build_graph(events, relationships)

        # Identify knowledge nodes
        knowledge_nodes = []
        for e in events:
            label_lower = e.get("label", "").lower()
            description_lower = e.get("description", "").lower()
            is_knowledge = any(kw in label_lower or kw in description_lower
                               for kw in self.KNOWLEDGE_KEYWORDS)
            if is_knowledge:
                knowledge_nodes.append(e["id"])

        # Trace origins of each knowledge node
        origins = {}
        for kn in knowledge_nodes:
            ancestors = nx.ancestors(G, kn)
            external_origins = [n for n in ancestors if G.in_degree(n) == 0]
            origins[kn] = external_origins

        # Detect bootstrap knowledge (knowledge that appears in its own causal chain)
        bootstrap = []
        try:
            cycles = list(nx.simple_cycles(G))
            knowledge_set = set(knowledge_nodes)
            for cycle in cycles:
                knowledge_in_cycle = [n for n in cycle if n in knowledge_set]
                if knowledge_in_cycle:
                    bootstrap.append({
                        "cycle": cycle,
                        "knowledge_nodes": knowledge_in_cycle,
                        "labels": [G.nodes[n].get("label", n) for n in knowledge_in_cycle],
                        "type": "bootstrap",
                        "description": "Knowledge exists in a causal loop — it creates itself without external origin.",
                    })
        except Exception:
            pass

        # Knowledge with no external origin
        orphan_knowledge = []
        for kn in knowledge_nodes:
            if not origins.get(kn) and G.in_degree(kn) == 0:
                orphan_knowledge.append({
                    "id": kn,
                    "label": G.nodes[kn].get("label", kn),
                    "type": "orphan_knowledge",
                    "description": "This knowledge has no causal predecessor — it appears from nowhere.",
                })

        # Information flow chains
        info_chains = []
        for kn in knowledge_nodes[:10]:
            descendants = nx.descendants(G, kn)
            chain = [kn] + list(descendants)[:5]
            if len(chain) > 1:
                info_chains.append({
                    "origin_id": kn,
                    "origin_label": G.nodes[kn].get("label", kn),
                    "flows_to": [{"id": n, "label": G.nodes[n].get("label", n)} for n in list(descendants)[:10]],
                })

        return {
            "knowledge_nodes_count": len(knowledge_nodes),
            "knowledge_nodes": [{"id": n, "label": G.nodes[n].get("label", n)} for n in knowledge_nodes],
            "bootstrap_knowledge": bootstrap,
            "orphan_knowledge": orphan_knowledge,
            "information_chains": info_chains,
            "origins_map": {
                kn: [{"id": o, "label": G.nodes[o].get("label", o)} for o in origs]
                for kn, origs in origins.items()
            },
            "summary": self._generate_summary(knowledge_nodes, bootstrap, orphan_knowledge),
        }

    def _generate_summary(self, knowledge_nodes: List, bootstrap: List, orphan: List) -> str:
        parts = [f"{len(knowledge_nodes)} knowledge node(s) identified."]
        if bootstrap:
            parts.append(f"{len(bootstrap)} bootstrap knowledge loop(s) detected — information creating itself.")
        if orphan:
            parts.append(f"{len(orphan)} orphaned knowledge node(s) with no origin.")
        if not bootstrap and not orphan:
            parts.append("All knowledge traces back to an origin. No self-creating information detected.")
        return " ".join(parts)

