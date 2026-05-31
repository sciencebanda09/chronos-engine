"""
Influence Engine — Calculates causal influence metrics using graph centrality algorithms.

Uses NetworkX: PageRank, Betweenness Centrality, Degree Centrality, Closeness Centrality.
All reasoning is purely algorithmic.
"""

import networkx as nx
from typing import List, Dict, Any, Optional
from dataclasses import dataclass, asdict


@dataclass
class EventInfluence:
    event_id: str
    label: str
    composite_score: float
    pagerank: float
    betweenness: float
    in_degree_centrality: float
    out_degree_centrality: float
    closeness: float
    reachability: int
    dependency_count: int
    fragility_score: float
    danger_score: float
    rank: int

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


class InfluenceEngine:

    def build_graph(self, events: List[Dict], relationships: List[Dict]) -> nx.DiGraph:
        G = nx.DiGraph()
        for e in events:
            G.add_node(e["id"], label=e.get("label", ""), event_type=e.get("event_type", ""), description=e.get("description", ""), importance=e.get("importance", 5))
        for r in relationships:
            G.add_edge(
                r["source_id"],
                r["target_id"],
                weight=r.get("strength", 1.0),
            )
        return G

    def analyze(self, events: List[Dict], relationships: List[Dict]) -> Dict[str, Any]:
        G = self.build_graph(events, relationships)
        n = len(G.nodes())

        if n == 0:
            return {"events": [], "rankings": {}, "summary": "No events to analyze."}

        # Compute centrality metrics
        try:
            pagerank = nx.pagerank(G, weight="weight", alpha=0.85, max_iter=100)
        except Exception:
            pagerank = {n: 1.0 / max(1, len(G.nodes())) for n in G.nodes()}

        try:
            betweenness = nx.betweenness_centrality(G, weight="weight", normalized=True)
        except Exception:
            betweenness = {n: 0.0 for n in G.nodes()}

        try:
            in_deg = nx.in_degree_centrality(G)
            out_deg = nx.out_degree_centrality(G)
        except Exception:
            in_deg = {n: 0.0 for n in G.nodes()}
            out_deg = {n: 0.0 for n in G.nodes()}

        try:
            closeness = nx.closeness_centrality(G)
        except Exception:
            closeness = {n: 0.0 for n in G.nodes()}

        # Compute composite scores
        event_influences: List[EventInfluence] = []
        for node in G.nodes():
            label = G.nodes[node].get("label", node)
            pr = pagerank.get(node, 0.0)
            bt = betweenness.get(node, 0.0)
            indg = in_deg.get(node, 0.0)
            outdg = out_deg.get(node, 0.0)
            cl = closeness.get(node, 0.0)

            # Composite influence: PageRank (40%), Betweenness (30%), OutDegree (20%), Closeness (10%)
            composite = (pr * 0.4 + bt * 0.3 + outdg * 0.2 + cl * 0.1)

            # Reachability: how many nodes can be reached from this one
            try:
                reachability = len(nx.descendants(G, node))
            except Exception:
                reachability = 0

            # Dependency count: how many nodes depend on this one (ancestors)
            try:
                dependency_count = len(nx.ancestors(G, node))
            except Exception:
                dependency_count = 0

            # Fragility: high in-degree but low out-degree (many things depend on it, few outputs)
            fragility = indg * (1.0 - outdg * 0.5)

            # Danger: high pagerank + high betweenness = removing it would cause most damage
            danger = (pr * 0.5 + bt * 0.5) * 100

            event_influences.append(EventInfluence(
                event_id=node,
                label=label,
                composite_score=round(composite * 100, 4),
                pagerank=round(pr * 100, 4),
                betweenness=round(bt * 100, 4),
                in_degree_centrality=round(indg * 100, 4),
                out_degree_centrality=round(outdg * 100, 4),
                closeness=round(cl * 100, 4),
                reachability=reachability,
                dependency_count=dependency_count,
                fragility_score=round(fragility * 100, 4),
                danger_score=round(danger, 4),
                rank=0,
            ))

        # Rank by composite score
        event_influences.sort(key=lambda x: x.composite_score, reverse=True)
        for i, ev in enumerate(event_influences):
            ev.rank = i + 1

        influence_data = [e.to_dict() for e in event_influences]

        # Rankings
        rankings = {
            "most_influential": self._top_by(influence_data, "composite_score", 1),
            "highest_dependency": self._top_by(influence_data, "dependency_count", 1),
            "most_fragile": self._top_by(influence_data, "fragility_score", 1),
            "most_dangerous": self._top_by(influence_data, "danger_score", 1),
            "most_central": self._top_by(influence_data, "betweenness", 1),
            "highest_reachability": self._top_by(influence_data, "reachability", 1),
            "top_5_influential": self._top_by(influence_data, "composite_score", 5),
        }

        # Graph-level metrics
        graph_metrics = self._compute_graph_metrics(G)

        return {
            "events": influence_data,
            "rankings": rankings,
            "graph_metrics": graph_metrics,
            "summary": self._generate_summary(influence_data, rankings, graph_metrics),
        }

    def _top_by(self, data: List[Dict], field: str, n: int) -> Any:
        sorted_data = sorted(data, key=lambda x: x.get(field, 0), reverse=True)
        result = sorted_data[:n]
        return result[0] if n == 1 and result else result

    def _compute_graph_metrics(self, G: nx.DiGraph) -> Dict[str, Any]:
        n = len(G.nodes())
        e = len(G.edges())

        metrics: Dict[str, Any] = {
            "node_count": n,
            "edge_count": e,
            "density": round(nx.density(G), 4),
            "is_dag": nx.is_directed_acyclic_graph(G),
        }

        if n > 0:
            try:
                metrics["weakly_connected_components"] = nx.number_weakly_connected_components(G)
            except Exception:
                metrics["weakly_connected_components"] = 1

            try:
                metrics["strongly_connected_components"] = nx.number_strongly_connected_components(G)
            except Exception:
                metrics["strongly_connected_components"] = n

            # Average path length (only if connected and not too large)
            if n <= 500 and nx.is_weakly_connected(G):
                try:
                    G_undirected = G.to_undirected()
                    metrics["average_path_length"] = round(nx.average_shortest_path_length(G_undirected), 3)
                    metrics["diameter"] = nx.diameter(G_undirected)
                except Exception:
                    pass

            # Cycle count
            try:
                cycle_count = sum(1 for _ in nx.simple_cycles(G))
                metrics["cycle_count"] = cycle_count
            except Exception:
                metrics["cycle_count"] = 0

            # Degree stats
            in_degrees = [G.in_degree(n) for n in G.nodes()]
            out_degrees = [G.out_degree(n) for n in G.nodes()]
            metrics["avg_in_degree"] = round(sum(in_degrees) / max(1, n), 2)
            metrics["avg_out_degree"] = round(sum(out_degrees) / max(1, n), 2)
            metrics["max_in_degree"] = max(in_degrees) if in_degrees else 0
            metrics["max_out_degree"] = max(out_degrees) if out_degrees else 0

        return metrics

    def _generate_summary(self, events: List[Dict], rankings: Dict, graph_metrics: Dict) -> str:
        if not events:
            return "No events to analyze."
        top = rankings.get("most_influential", {})
        fragile = rankings.get("most_fragile", {})
        lines = []
        if top:
            lines.append(f"Most influential event: '{top.get('label', '?')}' (score: {top.get('composite_score', 0):.1f})")
        if fragile:
            lines.append(f"Most fragile event: '{fragile.get('label', '?')}' (fragility: {fragile.get('fragility_score', 0):.1f})")
        density = graph_metrics.get("density", 0)
        lines.append(f"Graph density: {density:.3f} ({'tightly coupled' if density > 0.3 else 'loosely coupled'})")
        is_dag = graph_metrics.get("is_dag", True)
        if not is_dag:
            lines.append(f"⚠ Universe contains {graph_metrics.get('cycle_count', 0)} causal cycle(s) — paradoxes possible.")
        return " | ".join(lines)

