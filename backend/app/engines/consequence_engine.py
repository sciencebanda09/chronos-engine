"""
Consequence Engine — Algorithmically propagates causal consequences through a universe graph.

Generates immediate, secondary, tertiary, and long-term consequence trees.
All reasoning is graph-algorithmic using NetworkX and BFS/DFS propagation.
"""

import networkx as nx
from collections import deque
from typing import List, Dict, Any, Optional, Tuple
from dataclasses import dataclass, asdict


@dataclass
class ConsequenceNode:
    event_id: str
    label: str
    level: int
    cascade_strength: float
    path_from_trigger: List[str]
    reachable_from_here: int
    is_terminal: bool

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


class ConsequenceEngine:

    def build_graph(self, events: List[Dict], relationships: List[Dict]) -> nx.DiGraph:
        G = nx.DiGraph()
        for e in events:
            G.add_node(e["id"], label=e.get("label", ""), event_type=e.get("event_type", ""), description=e.get("description", ""), importance=e.get("importance", 5))
        for r in relationships:
            G.add_edge(
                r["source_id"],
                r["target_id"],
                strength=r.get("strength", 1.0),
                delay=r.get("delay", 0.0),
                label=r.get("label", "causes"),
            )
        return G

    def analyze(self, events: List[Dict], relationships: List[Dict], trigger_id: str) -> Dict[str, Any]:
        G = self.build_graph(events, relationships)

        if trigger_id not in G:
            return {"error": f"Event {trigger_id} not found in universe"}

        # BFS with level tracking
        levels: Dict[str, int] = {trigger_id: 0}
        paths: Dict[str, List[str]] = {trigger_id: [trigger_id]}
        cascade_strengths: Dict[str, float] = {trigger_id: 1.0}
        queue = deque([trigger_id])
        visited = {trigger_id}
        order = []

        while queue:
            node = queue.popleft()
            for neighbor in G.successors(node):
                if neighbor not in visited:
                    visited.add(neighbor)
                    levels[neighbor] = levels[node] + 1
                    paths[neighbor] = paths[node] + [neighbor]
                    edge_strength = G[node][neighbor].get("strength", 1.0)
                    cascade_strengths[neighbor] = cascade_strengths[node] * edge_strength
                    order.append(neighbor)
                    queue.append(neighbor)

        # Categorize by level
        immediate, secondary, tertiary, long_term = [], [], [], []

        for event_id in order:
            label = G.nodes[event_id].get("label", event_id)
            level = levels[event_id]
            reachable = len(nx.descendants(G, event_id))
            is_terminal = G.out_degree(event_id) == 0

            node = ConsequenceNode(
                event_id=event_id,
                label=label,
                level=level,
                cascade_strength=round(cascade_strengths[event_id], 4),
                path_from_trigger=[G.nodes[n].get("label", n) for n in paths[event_id]],
                reachable_from_here=reachable,
                is_terminal=is_terminal,
            )

            if level == 1:
                immediate.append(node.to_dict())
            elif level == 2:
                secondary.append(node.to_dict())
            elif level == 3:
                tertiary.append(node.to_dict())
            else:
                long_term.append(node.to_dict())

        # Build consequence tree
        tree = self._build_tree(G, trigger_id, cascade_strengths, levels)

        # Calculate cascade metrics
        total_affected = len(order)
        max_depth = max(levels.values()) if len(levels) > 1 else 0
        avg_strength = sum(cascade_strengths[n] for n in order) / max(1, len(order))
        critical_path = self._find_critical_path(G, trigger_id, cascade_strengths)

        trigger_label = G.nodes[trigger_id].get("label", trigger_id)

        return {
            "trigger_id": trigger_id,
            "trigger_label": trigger_label,
            "total_affected": total_affected,
            "max_cascade_depth": max_depth,
            "average_cascade_strength": round(avg_strength, 4),
            "immediate": immediate,
            "secondary": secondary,
            "tertiary": tertiary,
            "long_term": long_term,
            "tree": tree,
            "critical_path": critical_path,
            "summary": self._generate_summary(trigger_label, immediate, secondary, tertiary, long_term, max_depth),
        }

    def _build_tree(
        self,
        G: nx.DiGraph,
        root: str,
        strengths: Dict[str, float],
        levels: Dict[str, int],
        depth: int = 0,
        max_depth: int = 5,
    ) -> Dict[str, Any]:
        if depth > max_depth:
            return {}
        node_data = G.nodes.get(root, {})
        children = []
        for succ in G.successors(root):
            if levels.get(succ, 99) > levels.get(root, 0):
                child_tree = self._build_tree(G, succ, strengths, levels, depth + 1, max_depth)
                if child_tree:
                    children.append(child_tree)
        return {
            "id": root,
            "label": node_data.get("label", root),
            "level": levels.get(root, 0),
            "cascade_strength": round(strengths.get(root, 1.0), 4),
            "children": children,
        }

    def _find_critical_path(self, G: nx.DiGraph, trigger: str, strengths: Dict[str, float]) -> List[Dict[str, Any]]:
        """Find the path of maximum cumulative impact from trigger"""
        if not G.nodes:
            return []

        # Find all paths from trigger to terminal nodes
        terminal_nodes = [n for n in G.nodes() if G.out_degree(n) == 0 and n != trigger]
        if not terminal_nodes:
            terminal_nodes = list(nx.descendants(G, trigger))

        best_path: List[str] = []
        best_strength = 0.0

        for terminal in terminal_nodes[:10]:  # limit for performance
            try:
                paths = list(nx.all_simple_paths(G, trigger, terminal, cutoff=10))
                for path in paths:
                    strength = 1.0
                    for i in range(len(path) - 1):
                        strength *= G[path[i]][path[i + 1]].get("strength", 1.0)
                    if strength > best_strength:
                        best_strength = strength
                        best_path = path
            except (nx.NetworkXNoPath, nx.NodeNotFound):
                continue

        return [{"id": n, "label": G.nodes[n].get("label", n)} for n in best_path]

    def collapse_simulation(self, events: List[Dict], relationships: List[Dict], removed_id: str) -> Dict[str, Any]:
        """Simulate what happens when an event is removed from the universe"""
        G = self.build_graph(events, relationships)

        if removed_id not in G:
            return {"error": "Event not found"}

        removed_label = G.nodes[removed_id].get("label", removed_id)
        descendants = nx.descendants(G, removed_id)
        ancestors = nx.ancestors(G, removed_id)

        # Build collapsed graph
        G_collapsed = G.copy()
        G_collapsed.remove_node(removed_id)

        # Find orphaned nodes (nodes that now have no path from any origin)
        origins = [n for n in G_collapsed.nodes() if G_collapsed.in_degree(n) == 0]
        reachable_after = set()
        for origin in origins:
            reachable_after.update(nx.descendants(G_collapsed, origin))
            reachable_after.add(origin)

        all_nodes_after = set(G_collapsed.nodes())
        orphaned = all_nodes_after - reachable_after

        lost_events = [{"id": n, "label": G.nodes[n].get("label", n)} for n in descendants]
        orphaned_events = [{"id": n, "label": G_collapsed.nodes[n].get("label", n)} for n in orphaned]

        stability_before = self._quick_stability(G)
        stability_after = self._quick_stability(G_collapsed)

        return {
            "removed_event": {"id": removed_id, "label": removed_label},
            "directly_affected": len(descendants),
            "lost_events": lost_events,
            "orphaned_events": orphaned_events,
            "ancestors_affected": [{"id": n, "label": G.nodes[n].get("label", n)} for n in ancestors],
            "stability_before": stability_before,
            "stability_after": stability_after,
            "stability_delta": round(stability_after - stability_before, 2),
            "collapse_cascade": len(descendants) + len(orphaned),
            "timeline_restructured": len(orphaned) > 0,
        }

    def _quick_stability(self, G: nx.DiGraph) -> float:
        n = len(G.nodes())
        if n == 0:
            return 100.0
        cycles = 0
        try:
            cycles = sum(1 for _ in nx.simple_cycles(G))
        except Exception:
            pass
        score = max(0.0, 100.0 - cycles * 10 - nx.density(G) * 20)
        return round(score, 2)

    def _generate_summary(self, trigger_label: str, immediate, secondary, tertiary, long_term, max_depth: int) -> str:
        total = len(immediate) + len(secondary) + len(tertiary) + len(long_term)
        if total == 0:
            return f"'{trigger_label}' has no downstream consequences. It is a terminal event."
        parts = []
        if immediate:
            parts.append(f"{len(immediate)} immediate effect{'s' if len(immediate) > 1 else ''}")
        if secondary:
            parts.append(f"{len(secondary)} secondary effect{'s' if len(secondary) > 1 else ''}")
        if tertiary:
            parts.append(f"{len(tertiary)} tertiary effect{'s' if len(tertiary) > 1 else ''}")
        if long_term:
            parts.append(f"{len(long_term)} long-term consequence{'s' if len(long_term) > 1 else ''}")
        return f"'{trigger_label}' triggers {', '.join(parts)}, cascading {max_depth} levels deep across {total} total events."

