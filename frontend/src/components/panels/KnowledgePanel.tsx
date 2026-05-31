'use client';
import { useEffect, useState } from 'react';
import { useChronosStore } from '@/store';
import { api } from '@/utils/api';
import { BookOpen, AlertCircle, CheckCircle } from 'lucide-react';

export function KnowledgePanel() {
  const { activeUniverse, setHighlightedNodes } = useChronosStore();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!activeUniverse) return;
    (async () => {
      setLoading(true);
      try {
        const d = await api.analysis.knowledge(activeUniverse.id);
        setData(d);
        const knowledgeIds = (d.knowledge_nodes || []).map((n: any) => n.id);
        setHighlightedNodes(new Set(knowledgeIds));
      } finally {
        setLoading(false);
      }
    })();
    return () => setHighlightedNodes(new Set());
  }, [activeUniverse?.id]);

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-2">
        <BookOpen size={14} className="text-purple-400" />
        <span className="text-xs font-mono text-white">Knowledge Origin Tracker</span>
      </div>

      {loading ? (
        <div className="space-y-2">{[...Array(4)].map((_, i) => <div key={i} className="shimmer h-12 rounded" />)}</div>
      ) : !data ? null : (
        <>
          <div className="glass rounded-lg p-3">
            <div className="text-[11px] text-white/70">{data.summary}</div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2">
            <div className="stat-card text-center">
              <div className="text-xl font-bold font-mono text-purple-400">{data.knowledge_nodes_count}</div>
              <div className="text-[9px] text-chronos-muted">Knowledge Nodes</div>
            </div>
            <div className="stat-card text-center">
              <div className="text-xl font-bold font-mono" style={{ color: data.bootstrap_knowledge?.length > 0 ? '#ff4466' : '#00ff88' }}>
                {data.bootstrap_knowledge?.length || 0}
              </div>
              <div className="text-[9px] text-chronos-muted">Bootstrap Loops</div>
            </div>
            <div className="stat-card text-center">
              <div className="text-xl font-bold font-mono" style={{ color: data.orphan_knowledge?.length > 0 ? '#ffaa00' : '#00ff88' }}>
                {data.orphan_knowledge?.length || 0}
              </div>
              <div className="text-[9px] text-chronos-muted">Orphaned</div>
            </div>
          </div>

          {/* Bootstrap loops */}
          {data.bootstrap_knowledge?.length > 0 && (
            <div className="glass rounded-lg p-3">
              <div className="text-[10px] font-mono text-red-400 mb-2 uppercase flex items-center gap-1">
                <AlertCircle size={11} /> Bootstrap Knowledge ({data.bootstrap_knowledge.length})
              </div>
              {data.bootstrap_knowledge.map((b: any, i: number) => (
                <div key={i} className="mb-3 last:mb-0">
                  <div className="text-[11px] text-white/80 mb-1">{b.description}</div>
                  <div className="text-[10px] font-mono text-red-300/70">
                    Knowledge nodes: {b.labels?.join(', ')}
                  </div>
                  <div className="text-[10px] font-mono text-chronos-muted mt-1">
                    Cycle: {b.cycle?.slice(0, 4).join(' → ')}{b.cycle?.length > 4 ? '...' : ''}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Orphaned */}
          {data.orphan_knowledge?.length > 0 && (
            <div className="glass rounded-lg p-3">
              <div className="text-[10px] font-mono text-yellow-400 mb-2 uppercase">Orphaned Knowledge</div>
              {data.orphan_knowledge.map((k: any) => (
                <div key={k.id} className="mb-2">
                  <div className="text-[11px] font-mono text-white">{k.label}</div>
                  <div className="text-[10px] text-chronos-muted">{k.description}</div>
                </div>
              ))}
            </div>
          )}

          {/* Information chains */}
          {data.information_chains?.length > 0 && (
            <div className="glass rounded-lg p-3">
              <div className="text-[10px] font-mono text-chronos-muted mb-2 uppercase">Information Flow Chains</div>
              {data.information_chains.slice(0, 5).map((chain: any, i: number) => (
                <div key={i} className="mb-2 last:mb-0">
                  <div className="text-[11px] font-mono text-purple-400">{chain.origin_label}</div>
                  <div className="text-[10px] font-mono text-chronos-muted">
                    → {chain.flows_to?.slice(0, 4).map((n: any) => n.label).join(' → ')}
                    {chain.flows_to?.length > 4 ? '...' : ''}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Knowledge nodes list */}
          {data.knowledge_nodes?.length > 0 && (
            <div className="glass rounded-lg p-3">
              <div className="text-[10px] font-mono text-chronos-muted mb-2 uppercase">Knowledge Nodes</div>
              <div className="flex flex-wrap gap-1">
                {data.knowledge_nodes.map((n: any) => (
                  <span
                    key={n.id}
                    className="text-[10px] font-mono px-1.5 py-0.5 rounded border border-purple-500/20 text-purple-300/80 bg-purple-500/5"
                  >
                    {n.label}
                  </span>
                ))}
              </div>
            </div>
          )}

          {data.knowledge_nodes_count === 0 && (
            <div className="text-center py-8">
              <CheckCircle size={24} className="mx-auto mb-2 text-green-400/50" />
              <div className="text-[11px] font-mono text-chronos-muted">
                No knowledge nodes detected.<br />
                Label events with words like "research", "knowledge", "theorem" to track information flow.
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
