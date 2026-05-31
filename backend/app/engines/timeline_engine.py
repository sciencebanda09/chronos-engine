"""
Timeline Engine - Simulates the temporal evolution of a universe.

Uses topological sort for event ordering, then simulates activation wave-by-wave.
"""

import networkx as nx
from typing import List, Dict, Any, Optional
from collections import deque


class TimelineEngine:

    def build_graph(self, events: List[Dict], relationships: List[Dict]) -> nx.DiGraph:
        G = nx.DiGraph()
        for e in events:
            G.add_node(
                e["id"],
                label=e.get("label", e.get("id", "")),
                timestamp=e.get("timestamp_value", 0.0),
                event_type=e.get("event_type", ""),
                description=e.get("description", ""),
                importance=e.get("importance", 5),
            )
        for r in relationships:
            G.add_edge(
                r["source_id"], r["target_id"],
                delay=r.get("delay", 0.0),
                strength=r.get("strength", 1.0),
                label=r.get("label", "causes"),
            )
        return G

    def compile_timeline(self, events: List[Dict], relationships: List[Dict]) -> Dict[str, Any]:
        G = self.build_graph(events, relationships)
        n = len(G.nodes())
        if n == 0:
            return {"steps": [], "total_steps": 0, "is_deterministic": True, "errors": []}

        errors = []
        steps = []

        is_dag = nx.is_directed_acyclic_graph(G)
        if is_dag:
            try:
                topo_order = list(nx.topological_sort(G))
                steps = self._build_topo_steps(G, topo_order)
            except nx.NetworkXUnfeasible:
                errors.append("Topological sort failed - cycles present")
                steps = self._build_wave_steps(G)
        else:
            errors.append("Universe contains cycles - using wave propagation simulation")
            steps = self._build_wave_steps(G)

        root_events = [node for node in G.nodes() if G.in_degree(node) == 0]
        terminal_events = [node for node in G.nodes() if G.out_degree(node) == 0]

        return {
            "steps": steps,
            "total_steps": len(steps),
            "total_events": n,
            "is_deterministic": is_dag,
            "root_events": [{"id": node, "label": G.nodes[node].get("label", node)} for node in root_events],
            "terminal_events": [{"id": node, "label": G.nodes[node].get("label", node)} for node in terminal_events],
            "errors": errors,
            "execution_order": self._get_execution_order(G, is_dag),
        }

    def _build_topo_steps(self, G: nx.DiGraph, order: List[str]) -> List[Dict[str, Any]]:
        waves: List[List[str]] = []
        activated = set()
        remaining = set(order)

        while remaining:
            wave = []
            for node in order:
                if node in remaining:
                    preds = set(G.predecessors(node))
                    if preds.issubset(activated):
                        wave.append(node)
            if not wave:
                wave = list(remaining)
            for node in wave:
                activated.add(node)
                remaining.discard(node)
            waves.append(wave)

        steps = []
        for i, wave in enumerate(waves):
            activated_events = []
            for node in wave:
                edges_in = []
                for pred in G.predecessors(node):
                    edge_data = G[pred][node]
                    edges_in.append({
                        "from_id": pred,
                        "from_label": G.nodes[pred].get("label", pred),
                        "label": edge_data.get("label", "causes"),
                        "strength": edge_data.get("strength", 1.0),
                    })
                activated_events.append({
                    "id": node,
                    "label": G.nodes[node].get("label", node),
                    "triggered_by": edges_in,
                    "activates": [
                        {"id": s, "label": G.nodes[s].get("label", s)}
                        for s in G.successors(node)
                    ],
                })
            steps.append({
                "step": i + 1,
                "wave": i,
                "events_activated": activated_events,
                "count": len(activated_events),
                "cumulative_activated": sum(s["count"] for s in steps) + len(activated_events),
                "description": self._describe_step(i, activated_events),
            })
        return steps

    def _build_wave_steps(self, G: nx.DiGraph) -> List[Dict[str, Any]]:
        root_nodes = [node for node in G.nodes() if G.in_degree(node) == 0]
        if not root_nodes:
            root_nodes = list(G.nodes())[:1]

        steps = []
        visited = set()
        queue = deque([(node, 0) for node in root_nodes])
        wave_map: Dict[int, List[str]] = {}

        while queue:
            node, wave = queue.popleft()
            if node in visited:
                continue
            visited.add(node)
            wave_map.setdefault(wave, []).append(node)
            for succ in G.successors(node):
                if succ not in visited:
                    queue.append((succ, wave + 1))

        unvisited = set(G.nodes()) - visited
        if unvisited:
            max_wave = max(wave_map.keys(), default=0) + 1
            wave_map[max_wave] = list(unvisited)

        for wave_idx in sorted(wave_map.keys()):
            nodes_in_wave = wave_map[wave_idx]
            activated_events = []
            for node in nodes_in_wave:
                activated_events.append({
                    "id": node,
                    "label": G.nodes[node].get("label", node),
                    "triggered_by": [
                        {"from_id": p, "from_label": G.nodes[p].get("label", p), "label": "causes"}
                        for p in G.predecessors(node) if p in visited
                    ],
                    "activates": [
                        {"id": s, "label": G.nodes[s].get("label", s)}
                        for s in G.successors(node)
                    ],
                })
            steps.append({
                "step": wave_idx + 1,
                "wave": wave_idx,
                "events_activated": activated_events,
                "count": len(activated_events),
                "cumulative_activated": sum(s["count"] for s in steps) + len(activated_events),
                "description": self._describe_step(wave_idx, activated_events),
            })
        return steps

    def _describe_step(self, step_idx: int, events: List[Dict]) -> str:
        if step_idx == 0:
            labels = [e["label"] for e in events[:3]]
            suffix = "..." if len(events) > 3 else ""
            return f"Origin event{'s' if len(events) > 1 else ''} initiated: {', '.join(labels)}{suffix}"
        labels = [e["label"] for e in events[:3]]
        suffix = "..." if len(events) > 3 else ""
        return f"Caused: {', '.join(labels)}{suffix}"

    def _get_execution_order(self, G: nx.DiGraph, is_dag: bool) -> List[Dict[str, Any]]:
        if is_dag:
            try:
                order = list(nx.topological_sort(G))
                return [{"id": node, "label": G.nodes[node].get("label", node), "position": i + 1}
                        for i, node in enumerate(order)]
            except Exception:
                pass
        return [{"id": node, "label": G.nodes[node].get("label", node), "position": i + 1}
                for i, node in enumerate(G.nodes())]

    def get_event_activation_time(self, events: List[Dict], relationships: List[Dict]) -> Dict[str, Any]:
        G = self.build_graph(events, relationships)
        activation_times: Dict[str, float] = {}

        root_nodes = [node for node in G.nodes() if G.in_degree(node) == 0]
        for root in root_nodes:
            activation_times[root] = G.nodes[root].get("timestamp", 0.0)

        if nx.is_directed_acyclic_graph(G):
            try:
                for node in nx.topological_sort(G):
                    if node not in activation_times:
                        max_pred_time = 0.0
                        for pred in G.predecessors(node):
                            edge_delay = G[pred][node].get("delay", 0.0)
                            pred_time = activation_times.get(pred, 0.0)
                            max_pred_time = max(max_pred_time, pred_time + edge_delay)
                        activation_times[node] = max_pred_time
            except Exception:
                pass

        return {
            node: {
                "id": node,
                "label": G.nodes[node].get("label", node),
                "activation_time": activation_times.get(node, 0.0),
            }
            for node in G.nodes()
        }