// ─── Core Graph Types ──────────────────────────────────────────────────────

export type EventType = 'standard' | 'origin' | 'terminal' | 'decision' | 'paradox';

export interface ChronosEvent {
  id: string;
  universe_id: string;
  label: string;
  description: string;
  event_type: EventType;
  timestamp_value: number;
  pos_x: number;
  pos_y: number;
  color: string;
  is_origin: boolean;
  is_terminal: boolean;
  meta: Record<string, any>;
}

export interface ChronosRelationship {
  id: string;
  universe_id: string;
  source_id: string;
  target_id: string;
  label: string;
  strength: number;
  delay: number;
  rel_type: string;
  meta: Record<string, any>;
}

export interface Universe {
  id: string;
  name: string;
  description: string;
  stability_score: number;
  paradox_count: number;
  created_at: string;
  updated_at: string;
  meta: Record<string, any>;
  events: ChronosEvent[];
  relationships: ChronosRelationship[];
}

// ─── Analysis Types ────────────────────────────────────────────────────────

export type ParadoxType =
  | 'grandfather'
  | 'bootstrap'
  | 'self_causation'
  | 'infinite_loop'
  | 'ontological'
  | 'information_void'
  | 'timeline_contradiction'
  | 'recursive_reality';

export type ParadoxSeverity = 'critical' | 'high' | 'medium' | 'low';

export interface Paradox {
  id: string;
  paradox_type: ParadoxType;
  severity: ParadoxSeverity;
  explanation: string;
  impacted_nodes: string[];
  cycle: string[];
  recommended_fix: string;
  confidence: number;
  cycle_length: number;
  external_impact: number;
}

export interface ParadoxAnalysis {
  universe_id: string;
  paradox_count: number;
  paradoxes: Paradox[];
  stability_score: number;
  timeline_entropy: number;
  severity_breakdown: Record<ParadoxSeverity, number>;
}

export interface EventInfluence {
  event_id: string;
  label: string;
  composite_score: number;
  pagerank: number;
  betweenness: number;
  in_degree_centrality: number;
  out_degree_centrality: number;
  closeness: number;
  reachability: number;
  dependency_count: number;
  fragility_score: number;
  danger_score: number;
  rank: number;
}

export interface InfluenceAnalysis {
  events: EventInfluence[];
  rankings: {
    most_influential: EventInfluence;
    highest_dependency: EventInfluence;
    most_fragile: EventInfluence;
    most_dangerous: EventInfluence;
    most_central: EventInfluence;
    top_5_influential: EventInfluence[];
  };
  graph_metrics: {
    node_count: number;
    edge_count: number;
    density: number;
    is_dag: boolean;
    cycle_count: number;
    avg_in_degree: number;
    avg_out_degree: number;
  };
  summary: string;
}

export interface ConsequenceNode {
  event_id: string;
  label: string;
  level: number;
  cascade_strength: number;
  path_from_trigger: string[];
  reachable_from_here: number;
  is_terminal: boolean;
}

export interface ConsequenceAnalysis {
  trigger_id: string;
  trigger_label: string;
  total_affected: number;
  max_cascade_depth: number;
  average_cascade_strength: number;
  immediate: ConsequenceNode[];
  secondary: ConsequenceNode[];
  tertiary: ConsequenceNode[];
  long_term: ConsequenceNode[];
  tree: any;
  critical_path: Array<{ id: string; label: string }>;
  summary: string;
}

export interface CounterfactualAnalysis {
  scenario: string;
  removed_event: { id: string; label: string };
  original_universe: {
    event_count: number;
    relationship_count: number;
    stability: number;
    entropy: number;
    paradox_count: number;
  };
  counterfactual_universe: {
    event_count: number;
    relationship_count: number;
    stability: number;
    entropy: number;
    paradox_count: number;
  };
  delta: {
    stability_change: number;
    entropy_change: number;
    paradox_change: number;
    events_lost: number;
    events_orphaned: number;
    events_preserved: number;
  };
  lost_events: Array<{ id: string; label: string }>;
  orphaned_events: Array<{ id: string; label: string }>;
  verdict: string;
}

export interface DashboardData {
  universe_id: string;
  stability_score: number;
  timeline_entropy: number;
  paradox_count: number;
  collapse_risk: number;
  universe_health_index: number;
  dependency_density: number;
  event_count: number;
  relationship_count: number;
  is_dag: boolean;
  cycle_count: number;
  top_influential_events: EventInfluence[];
  severity_breakdown: Record<ParadoxSeverity, number>;
  graph_metrics: Record<string, any>;
  rankings: InfluenceAnalysis['rankings'];
}

// ─── Timeline Types ─────────────────────────────────────────────────────────

export interface TimelineStep {
  step: number;
  wave: number;
  events_activated: Array<{
    id: string;
    label: string;
    triggered_by: Array<{ from_id: string; from_label: string; label: string; strength: number }>;
    activates: Array<{ id: string; label: string }>;
  }>;
  count: number;
  cumulative_activated: number;
  description: string;
}

export interface CompiledTimeline {
  steps: TimelineStep[];
  total_steps: number;
  total_events: number;
  is_deterministic: boolean;
  root_events: Array<{ id: string; label: string }>;
  terminal_events: Array<{ id: string; label: string }>;
  errors: string[];
  execution_order: Array<{ id: string; label: string; position: number }>;
}

// ─── Parser Types ──────────────────────────────────────────────────────────

export interface ParsedUniverse {
  success: boolean;
  source: string;
  model: string;
  events: ChronosEvent[];
  relationships: ChronosRelationship[];
  universe_name: string;
  event_count: number;
  relationship_count: number;
  note?: string;
}

// ─── UI State Types ────────────────────────────────────────────────────────

export type PanelType =
  | 'none'
  | 'paradox'
  | 'influence'
  | 'consequences'
  | 'counterfactual'
  | 'dashboard'
  | 'timeline'
  | 'knowledge'
  | 'parser';

export type SimulatorState = 'stopped' | 'playing' | 'paused';

export interface NodeData {
  label: string;
  description?: string;
  event_type: EventType;
  color: string;
  is_origin: boolean;
  is_terminal: boolean;
  timestamp_value: number;
  influence_score?: number;
  is_paradox_node?: boolean;
  is_active?: boolean;
  is_collapsing?: boolean;
}
