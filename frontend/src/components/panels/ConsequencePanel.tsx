'use client';
import { useEffect, useState } from 'react';
import { useChronosStore } from '@/store';
import { api } from '@/utils/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Layers, ChevronRight, AlertCircle } from 'lucide-react';
import { ConsequenceNode, ConsequenceAnalysis } from '@/types';

const LEVEL_COLORS = ['#ffaa00', '#ff8833', '#ff6644', '#cc44ff'];
const LEVEL_LABELS = ['Immediate', 'Secondary', 'Tertiary', 'Long-term'];

function ConsequenceRow({ node, color }: { node: ConsequenceNode; color: string }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div
      className="border-l-2 pl-3 py-1 cursor-pointer hover:bg-white/[0.02] rounded"
      style={{ borderColor: `${color}55` }}
      onClick={() => setExpanded(!expanded)}
    >
      <div className="flex items-center gap-2">
        <span className="text-[12px] font-semibold text-white">{node.label}</span>
        <span className="text-[10px] font-mono text-chronos-muted ml-auto">
          ×{node.cascade_strength.toFixed(2)}
        </span>
        {node.is_terminal && (
          <span className="text-[9px] font-mono text-red-400 border border-red-500/20 rounded px-1">TERMINAL</span>
        )}
      </div>
      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="mt-1 space-y-0.5 text-[10px] font-mono text-chronos-muted">
              <div>Path: {node.path_from_trigger.join(' → ')}</div>
              <div>Downstream: {node.reachable_from_here} events</div>
              <div>Level: {node.level}</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function ConsequencePanel() {
  const { activeUniverse, selectedEventId, setHighlightedNodes, activeUniverse: u } = useChronosStore();
  const [data, setData] = useState<ConsequenceAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentEventId, setCurrentEventId] = useState<string>('');

  const events = activeUniverse?.events || [];

  const analyze = async (eid: string) => {
    if (!activeUniverse || !eid) return;
    setLoading(true);
    try {
      const d = await api.analysis.consequences(activeUniverse.id, eid);
      setData(d);
      const all = [
        ...(d.immediate || []),
        ...(d.secondary || []),
        ...(d.tertiary || []),
        ...(d.long_term || []),
      ].map((n: ConsequenceNode) => n.event_id);
      setHighlightedNodes(new Set(all));
    } finally {
      setLoading(false);
    }
  };

  // Auto-select first event or selected event
  useEffect(() => {
    if (selectedEventId && selectedEventId !== currentEventId) {
      setCurrentEventId(selectedEventId);
    } else if (events.length > 0 && !currentEventId) {
      setCurrentEventId(events[0].id);
    }
  }, [selectedEventId, events]);

  useEffect(() => {
    if (currentEventId) analyze(currentEventId);
    return () => setHighlightedNodes(new Set());
  }, [currentEventId, activeUniverse?.id]);

  const levelGroups = [
    { label: 'Immediate', nodes: data?.immediate || [], color: LEVEL_COLORS[0] },
    { label: 'Secondary', nodes: data?.secondary || [], color: LEVEL_COLORS[1] },
    { label: 'Tertiary', nodes: data?.tertiary || [], color: LEVEL_COLORS[2] },
    { label: 'Long-term', nodes: data?.long_term || [], color: LEVEL_COLORS[3] },
  ].filter(g => g.nodes.length > 0);

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Layers size={14} className="text-yellow-400" />
        <span className="text-xs font-mono text-white">Consequence Analysis</span>
      </div>

      {/* Event selector */}
      <div>
        <label className="text-[10px] font-mono text-chronos-muted block mb-1">TRIGGER EVENT</label>
        <select
          value={currentEventId}
          onChange={(e) => setCurrentEventId(e.target.value)}
          className="w-full text-[11px] font-mono bg-chronos-bg border border-chronos-border rounded px-2 py-1.5 text-white focus:outline-none focus:border-chronos-accent/50"
        >
          <option value="">Select event...</option>
          {events.map((e) => (
            <option key={e.id} value={e.id}>{e.label}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="space-y-2">{[...Array(4)].map((_, i) => <div key={i} className="shimmer h-10 rounded" />)}</div>
      ) : !data ? (
        <div className="text-chronos-muted text-[11px] font-mono text-center py-8">Select an event to analyze its consequences</div>
      ) : (
        <>
          {/* Summary */}
          <div className="glass rounded-lg p-3">
            <div className="text-[11px] text-white/70 leading-relaxed mb-3">{data.summary}</div>
            <div className="grid grid-cols-3 gap-2">
              <div className="text-center">
                <div className="text-xl font-bold font-mono text-white">{data.total_affected}</div>
                <div className="text-[9px] text-chronos-muted">Affected</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold font-mono text-chronos-accent">{data.max_cascade_depth}</div>
                <div className="text-[9px] text-chronos-muted">Depth</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold font-mono text-yellow-400">{(data.average_cascade_strength * 100).toFixed(0)}%</div>
                <div className="text-[9px] text-chronos-muted">Avg Strength</div>
              </div>
            </div>
          </div>

          {/* Critical path */}
          {data.critical_path?.length > 0 && (
            <div className="glass rounded-lg p-3">
              <div className="text-[10px] font-mono text-chronos-muted mb-2 uppercase">Critical Path</div>
              <div className="flex flex-wrap items-center gap-1">
                {data.critical_path.map((node, i) => (
                  <span key={node.id} className="flex items-center gap-1">
                    <span className="text-[11px] font-mono text-chronos-accent bg-chronos-accent/10 border border-chronos-accent/20 rounded px-1.5 py-0.5">
                      {node.label}
                    </span>
                    {i < data.critical_path.length - 1 && <ChevronRight size={10} className="text-chronos-muted" />}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Cascades by level */}
          {levelGroups.map(({ label, nodes, color }) => (
            <div key={label} className="glass rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full" style={{ background: color }} />
                <span className="text-[10px] font-mono uppercase tracking-wider" style={{ color }}>{label} ({nodes.length})</span>
              </div>
              <div className="space-y-1">
                {nodes.slice(0, 8).map((n: ConsequenceNode) => (
                  <ConsequenceRow key={n.event_id} node={n} color={color} />
                ))}
                {nodes.length > 8 && (
                  <div className="text-[10px] text-chronos-muted font-mono pl-3">+{nodes.length - 8} more...</div>
                )}
              </div>
            </div>
          ))}

          {data.total_affected === 0 && (
            <div className="text-center py-6 text-chronos-muted font-mono text-sm">
              <AlertCircle size={24} className="mx-auto mb-2 text-chronos-muted/50" />
              No downstream consequences. This is a terminal event.
            </div>
          )}
        </>
      )}
    </div>
  );
}
