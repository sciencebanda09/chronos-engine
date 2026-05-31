'use client';
import { useEffect, useState } from 'react';
import { useChronosStore } from '@/store';
import { api } from '@/utils/api';
import { motion } from 'framer-motion';
import { GitBranch, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { CounterfactualAnalysis } from '@/types';

function DeltaBadge({ value, unit = '', inverse = false }: { value: number; unit?: string; inverse?: boolean }) {
  const positive = inverse ? value < 0 : value > 0;
  const neutral = value === 0;
  return (
    <span className={`text-[11px] font-mono flex items-center gap-0.5 ${
      neutral ? 'text-chronos-muted' :
      positive ? 'text-green-400' : 'text-red-400'
    }`}>
      {neutral ? <Minus size={10} /> : positive ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
      {value > 0 ? '+' : ''}{value.toFixed(1)}{unit}
    </span>
  );
}

export function CounterfactualPanel() {
  const { activeUniverse, selectedEventId, setHighlightedNodes, setCollapsingNodes } = useChronosStore();
  const [data, setData] = useState<CounterfactualAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentEventId, setCurrentEventId] = useState('');
  const [animating, setAnimating] = useState(false);

  const events = activeUniverse?.events || [];

  useEffect(() => {
    if (selectedEventId && selectedEventId !== currentEventId) {
      setCurrentEventId(selectedEventId);
    } else if (events.length > 0 && !currentEventId) {
      setCurrentEventId(events[0].id);
    }
  }, [selectedEventId, events]);

  const analyze = async (eid: string) => {
    if (!activeUniverse || !eid) return;
    setLoading(true);
    try {
      const d = await api.analysis.counterfactual(activeUniverse.id, eid);
      setData(d);
      const lostIds = (d.lost_events || []).map((e: any) => e.id);
      const orphanIds = (d.orphaned_events || []).map((e: any) => e.id);
      setHighlightedNodes(new Set([...lostIds, ...orphanIds]));
    } finally {
      setLoading(false);
    }
  };

  const runCollapse = async () => {
    if (!activeUniverse || !currentEventId) return;
    setAnimating(true);
    try {
      const d = await api.analysis.collapse(activeUniverse.id, currentEventId);
      const collapseIds = [
        currentEventId,
        ...(d.lost_events || []).map((e: any) => e.id),
        ...(d.orphaned_events || []).map((e: any) => e.id),
      ];
      setCollapsingNodes(new Set(collapseIds));
      setTimeout(() => setCollapsingNodes(new Set()), 1500);
    } finally {
      setAnimating(false);
    }
  };

  useEffect(() => {
    if (currentEventId) analyze(currentEventId);
    return () => { setHighlightedNodes(new Set()); setCollapsingNodes(new Set()); };
  }, [currentEventId, activeUniverse?.id]);

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-2">
        <GitBranch size={14} className="text-red-400" />
        <span className="text-xs font-mono text-white">Counterfactual Engine</span>
      </div>

      {/* Event selector */}
      <div>
        <label className="text-[10px] font-mono text-chronos-muted block mb-1">REMOVE EVENT</label>
        <select
          value={currentEventId}
          onChange={(e) => setCurrentEventId(e.target.value)}
          className="w-full text-[11px] font-mono bg-chronos-bg border border-chronos-border rounded px-2 py-1.5 text-white focus:outline-none focus:border-chronos-accent/50"
        >
          <option value="">Select event to remove...</option>
          {events.map((e) => (
            <option key={e.id} value={e.id}>{e.label}</option>
          ))}
        </select>
      </div>

      {/* Collapse animation button */}
      <button
        onClick={runCollapse}
        disabled={animating || !currentEventId}
        className="w-full py-2 text-[11px] font-mono border border-red-500/30 text-red-400 bg-red-500/10 hover:bg-red-500/20 rounded-lg transition-all disabled:opacity-40"
      >
        {animating ? '⟳ Collapsing Timeline...' : '💥 Animate Timeline Collapse'}
      </button>

      {loading ? (
        <div className="space-y-2">{[...Array(4)].map((_, i) => <div key={i} className="shimmer h-12 rounded" />)}</div>
      ) : !data ? (
        <div className="text-chronos-muted text-[11px] font-mono text-center py-8">
          Select an event to run counterfactual analysis
        </div>
      ) : (
        <>
          {/* Scenario header */}
          <div className="glass rounded-lg p-3 border border-red-500/20">
            <div className="text-[11px] font-mono text-red-400 mb-1">WHAT IF?</div>
            <div className="text-sm font-semibold text-white">{data.scenario}</div>
          </div>

          {/* Verdict */}
          <div className="glass rounded-lg p-3">
            <div className="text-[10px] font-mono text-chronos-muted mb-1 uppercase">Verdict</div>
            <div className="text-[11px] text-white/80 leading-relaxed">{data.verdict}</div>
          </div>

          {/* Delta grid */}
          <div className="glass rounded-lg p-3">
            <div className="text-[10px] font-mono text-chronos-muted mb-3 uppercase">Impact Delta</div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-chronos-muted font-mono">Stability</span>
                <DeltaBadge value={data.delta.stability_change} unit="%" />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-chronos-muted font-mono">Entropy</span>
                <DeltaBadge value={data.delta.entropy_change} inverse />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-chronos-muted font-mono">Paradoxes</span>
                <DeltaBadge value={data.delta.paradox_change} inverse />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-chronos-muted font-mono">Events Lost</span>
                <span className="text-[11px] font-mono text-red-400">{data.delta.events_lost}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-chronos-muted font-mono">Orphaned</span>
                <span className="text-[11px] font-mono text-yellow-400">{data.delta.events_orphaned}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-chronos-muted font-mono">Preserved</span>
                <span className="text-[11px] font-mono text-green-400">{data.delta.events_preserved}</span>
              </div>
            </div>
          </div>

          {/* Universe comparison */}
          <div className="glass rounded-lg p-3">
            <div className="text-[10px] font-mono text-chronos-muted mb-3 uppercase">Universe Comparison</div>
            <div className="space-y-2">
              {[
                { label: 'Stability', orig: data.original_universe.stability, cf: data.counterfactual_universe.stability, unit: '%' },
                { label: 'Entropy', orig: data.original_universe.entropy, cf: data.counterfactual_universe.entropy, unit: '' },
                { label: 'Paradoxes', orig: data.original_universe.paradox_count, cf: data.counterfactual_universe.paradox_count, unit: '' },
              ].map(({ label, orig, cf, unit }) => (
                <div key={label} className="flex items-center gap-2 text-[11px] font-mono">
                  <span className="text-chronos-muted w-20">{label}</span>
                  <span className="text-chronos-accent">{typeof orig === 'number' ? orig.toFixed(1) : orig}{unit}</span>
                  <span className="text-chronos-muted">→</span>
                  <span className={cf > orig ? 'text-green-400' : cf < orig ? 'text-red-400' : 'text-chronos-muted'}>
                    {typeof cf === 'number' ? cf.toFixed(1) : cf}{unit}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Lost events */}
          {data.lost_events?.length > 0 && (
            <div className="glass rounded-lg p-3">
              <div className="text-[10px] font-mono text-red-400 mb-2 uppercase">Lost Events ({data.lost_events.length})</div>
              <div className="flex flex-wrap gap-1">
                {data.lost_events.slice(0, 12).map((e: any) => (
                  <span key={e.id} className="text-[10px] font-mono px-1.5 py-0.5 rounded border border-red-500/20 text-red-300/80 bg-red-500/5">
                    {e.label}
                  </span>
                ))}
                {data.lost_events.length > 12 && <span className="text-[10px] text-chronos-muted font-mono">+{data.lost_events.length - 12} more</span>}
              </div>
            </div>
          )}

          {/* Resolved paradoxes */}
          {data.resolved_paradoxes?.length > 0 && (
            <div className="glass rounded-lg p-3">
              <div className="text-[10px] font-mono text-green-400 mb-2 uppercase">Resolved Paradoxes ✓</div>
              <div className="space-y-1">
                {data.resolved_paradoxes.map((p: any, i: number) => (
                  <div key={i} className="text-[11px] text-green-400/70 font-mono capitalize">
                    • {p.paradox_type.replace(/_/g, ' ')}
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
