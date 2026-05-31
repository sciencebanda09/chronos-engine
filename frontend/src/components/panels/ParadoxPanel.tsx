'use client';
import { useEffect, useState } from 'react';
import { useChronosStore } from '@/store';
import { api } from '@/utils/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, ChevronDown, ChevronRight, AlertTriangle } from 'lucide-react';
import { Paradox } from '@/types';

const SEVERITY_CONFIG: Record<string, { color: string; cls: string }> = {
  critical: { color: '#ff4466', cls: 'badge-critical' },
  high: { color: '#ff6400', cls: 'badge-high' },
  medium: { color: '#ffaa00', cls: 'badge-medium' },
  low: { color: '#00d4ff', cls: 'badge-low' },
};

const PARADOX_ICONS: Record<string, string> = {
  grandfather: '👴', bootstrap: '🥾', self_causation: '🔄',
  infinite_loop: '♾️', ontological: '🌀', information_void: '🕳️',
  timeline_contradiction: '⚡', recursive_reality: '🌊',
};

function ParadoxCard({ paradox, onExpand }: { paradox: Paradox; onExpand: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const { color, cls } = SEVERITY_CONFIG[paradox.severity] || SEVERITY_CONFIG.low;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="border rounded-lg overflow-hidden mb-2"
      style={{ borderColor: `${color}33` }}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left px-3 py-2.5 flex items-start gap-2 hover:bg-white/[0.02] transition-colors"
      >
        <span className="text-base leading-none mt-0.5">{PARADOX_ICONS[paradox.paradox_type] || '⚠'}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${cls}`}>
              {paradox.severity.toUpperCase()}
            </span>
            <span className="text-[10px] font-mono text-chronos-muted capitalize">
              {paradox.paradox_type.replace(/_/g, ' ')}
            </span>
          </div>
          <div className="text-[11px] text-white/80 leading-snug line-clamp-2">
            {paradox.explanation}
          </div>
        </div>
        <div className="shrink-0 mt-0.5">
          {expanded ? <ChevronDown size={12} className="text-chronos-muted" /> : <ChevronRight size={12} className="text-chronos-muted" />}
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3 space-y-2 border-t border-white/[0.05] pt-2">
              <div>
                <div className="text-[9px] font-mono text-chronos-muted mb-1 uppercase">Explanation</div>
                <div className="text-[11px] text-white/70 leading-relaxed">{paradox.explanation}</div>
              </div>
              <div>
                <div className="text-[9px] font-mono text-chronos-muted mb-1 uppercase">Causal Cycle</div>
                <div className="flex flex-wrap gap-1">
                  {paradox.cycle.map((id, i) => (
                    <span key={id} className="text-[10px] font-mono px-1.5 py-0.5 rounded border border-chronos-border text-chronos-accent/80">
                      {id.slice(0, 8)}…{i < paradox.cycle.length - 1 ? ' →' : ''}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <div className="text-[9px] font-mono text-chronos-muted mb-1 uppercase">Recommended Fix</div>
                <div className="text-[11px] text-green-400/80 leading-relaxed bg-green-500/5 border border-green-500/20 rounded p-2">
                  {paradox.recommended_fix}
                </div>
              </div>
              <div className="flex gap-3 text-[10px] font-mono text-chronos-muted">
                <span>Confidence: <span className="text-white">{(paradox.confidence * 100).toFixed(0)}%</span></span>
                <span>Cycle length: <span className="text-white">{paradox.cycle_length}</span></span>
                <span>Impact: <span className="text-white">{paradox.external_impact}</span></span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function ParadoxPanel() {
  const { activeUniverse, setHighlightedNodes } = useChronosStore();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const analyze = async () => {
    if (!activeUniverse) return;
    setLoading(true);
    try {
      const d = await api.analysis.paradoxes(activeUniverse.id);
      setData(d);
      const allNodes = new Set(d.paradoxes.flatMap((p: Paradox) => p.impacted_nodes));
      setHighlightedNodes(allNodes);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    analyze();
    return () => setHighlightedNodes(new Set());
  }, [activeUniverse?.id]);

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Zap size={14} className="text-purple-400" />
          <span className="text-xs font-mono text-white">Paradox Detection</span>
        </div>
        <button
          onClick={analyze}
          disabled={loading}
          className="text-[10px] font-mono px-2 py-1 bg-chronos-accent/10 border border-chronos-accent/20 rounded text-chronos-accent hover:bg-chronos-accent/20 transition-colors"
        >
          {loading ? 'Analyzing...' : 'Re-Analyze'}
        </button>
      </div>

      {loading ? (
        <div className="space-y-2">{[...Array(3)].map((_, i) => <div key={i} className="shimmer h-16 rounded-lg" />)}</div>
      ) : !data ? null : (
        <>
          {/* Summary */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            <div className="stat-card text-center">
              <div className="text-2xl font-bold font-mono" style={{ color: data.paradox_count > 0 ? '#ff4466' : '#00ff88' }}>
                {data.paradox_count}
              </div>
              <div className="text-[10px] text-chronos-muted">Paradoxes</div>
            </div>
            <div className="stat-card text-center">
              <div className="text-2xl font-bold font-mono" style={{ color: data.stability_score >= 80 ? '#00ff88' : data.stability_score >= 50 ? '#ffaa00' : '#ff4466' }}>
                {data.stability_score.toFixed(1)}
              </div>
              <div className="text-[10px] text-chronos-muted">Stability</div>
            </div>
          </div>

          {/* Severity breakdown */}
          {data.paradox_count > 0 && (
            <div className="flex gap-2 mb-4">
              {Object.entries(data.severity_breakdown).map(([sev, count]) => {
                if (!(count as number)) return null;
                const { cls } = SEVERITY_CONFIG[sev] || {};
                return (
                  <span key={sev} className={`text-[10px] font-mono px-2 py-0.5 rounded ${cls}`}>
                    {sev}: {count as number}
                  </span>
                );
              })}
            </div>
          )}

          {data.paradox_count === 0 ? (
            <div className="text-center py-8">
              <div className="text-3xl mb-2">✓</div>
              <div className="text-sm text-green-400 font-mono">No paradoxes detected</div>
              <div className="text-xs text-chronos-muted mt-1">This universe is causally consistent.</div>
            </div>
          ) : (
            <div>
              <div className="text-[10px] font-mono text-chronos-muted mb-2 uppercase tracking-wider">
                Detected Paradoxes ({data.paradox_count})
              </div>
              {data.paradoxes.map((p: Paradox) => (
                <ParadoxCard key={p.id} paradox={p} onExpand={() => {}} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
