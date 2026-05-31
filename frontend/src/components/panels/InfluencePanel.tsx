'use client';
import { useEffect, useState } from 'react';
import { useChronosStore } from '@/store';
import { api } from '@/utils/api';
import { motion } from 'framer-motion';
import { Activity, Award, AlertTriangle, Zap, Target } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from 'recharts';
import { EventInfluence } from '@/types';

const METRIC_COLORS = ['#00d4ff','#00ff88','#ffaa00','#ff4466','#cc44ff'];

function RankingCard({ title, event, color, icon: Icon, metric }: any) {
  if (!event) return null;
  return (
    <div className="stat-card" style={{ borderColor: `${color}33` }}>
      <div className="flex items-center gap-2 mb-1">
        <Icon size={11} style={{ color }} />
        <span className="text-[10px] font-mono uppercase tracking-wider" style={{ color }}>{title}</span>
      </div>
      <div className="text-[13px] font-semibold text-white truncate font-mono">{event.label}</div>
      <div className="text-[11px] font-mono mt-0.5" style={{ color }}>
        {metric}: {typeof event[metric] === 'number' ? event[metric].toFixed(2) : event[metric]}
      </div>
    </div>
  );
}

export function InfluencePanel() {
  const { activeUniverse, setHighlightedNodes } = useChronosStore();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState<keyof EventInfluence>('composite_score');

  useEffect(() => {
    if (!activeUniverse) return;
    (async () => {
      setLoading(true);
      try {
        const d = await api.analysis.influence(activeUniverse.id);
        setData(d);
        const top5 = (d.events || []).slice(0, 5).map((e: EventInfluence) => e.event_id);
        setHighlightedNodes(new Set(top5));
      } finally {
        setLoading(false);
      }
    })();
    return () => setHighlightedNodes(new Set());
  }, [activeUniverse?.id]);

  if (loading) return <div className="p-4 space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="shimmer h-12 rounded" />)}</div>;
  if (!data) return null;

  const sorted = [...(data.events || [])].sort((a: any, b: any) => (b[sortBy] ?? 0) - (a[sortBy] ?? 0));
  const top8 = sorted.slice(0, 8);
  const chartData = top8.map((e: EventInfluence) => ({
    name: e.label.slice(0, 14),
    value: typeof e[sortBy] === 'number' ? Number((e[sortBy] as number).toFixed(2)) : 0,
  }));
  const r = data.rankings || {};

  return (
    <div className="p-4 space-y-4">
      {/* Ranking cards */}
      <div className="grid grid-cols-1 gap-2">
        <RankingCard title="Most Influential" event={r.most_influential} color="#00d4ff" icon={Award} metric="composite_score" />
        <RankingCard title="Most Fragile" event={r.most_fragile} color="#ff4466" icon={AlertTriangle} metric="fragility_score" />
        <RankingCard title="Most Dangerous" event={r.most_dangerous} color="#cc44ff" icon={Zap} metric="danger_score" />
        <RankingCard title="Highest Dependency" event={r.highest_dependency} color="#ffaa00" icon={Target} metric="dependency_count" />
        <RankingCard title="Most Central" event={r.most_central} color="#00ff88" icon={Activity} metric="betweenness" />
      </div>

      {/* Sort selector */}
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-mono text-chronos-muted">Sort by:</span>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as keyof EventInfluence)}
          className="text-[10px] font-mono bg-chronos-bg border border-chronos-border rounded px-2 py-1 text-white focus:outline-none"
        >
          <option value="composite_score">Composite Score</option>
          <option value="pagerank">PageRank</option>
          <option value="betweenness">Betweenness</option>
          <option value="reachability">Reachability</option>
          <option value="fragility_score">Fragility</option>
          <option value="danger_score">Danger</option>
        </select>
      </div>

      {/* Bar chart */}
      <div className="glass rounded-lg p-3">
        <div className="text-[10px] font-mono text-chronos-muted mb-2 uppercase tracking-wider">
          Top Events — {String(sortBy).replace(/_/g, ' ')}
        </div>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={chartData} layout="vertical">
            <XAxis type="number" tick={{ fill: '#4a6080', fontSize: 9 }} />
            <YAxis type="category" dataKey="name" width={90} tick={{ fill: '#8899aa', fontSize: 10, fontFamily: 'monospace' }} />
            <Tooltip contentStyle={{ background: '#0a0f1e', border: '1px solid #1a2744', fontSize: 11, fontFamily: 'monospace' }} />
            <Bar dataKey="value" radius={[0, 3, 3, 0]}>
              {chartData.map((_: any, i: number) => (
                <Cell key={i} fill={METRIC_COLORS[i % METRIC_COLORS.length]} fillOpacity={0.85} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Full event table */}
      <div className="glass rounded-lg overflow-hidden">
        <div className="text-[10px] font-mono text-chronos-muted px-3 py-2 border-b border-chronos-border uppercase tracking-wider">
          All Events ({data.events?.length || 0})
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-[10px] font-mono">
            <thead>
              <tr className="border-b border-chronos-border/50">
                <th className="text-left px-3 py-1.5 text-chronos-muted">#</th>
                <th className="text-left px-3 py-1.5 text-chronos-muted">Event</th>
                <th className="text-right px-3 py-1.5 text-chronos-muted">Score</th>
                <th className="text-right px-3 py-1.5 text-chronos-muted">PR</th>
                <th className="text-right px-3 py-1.5 text-chronos-muted">Reach</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((e: EventInfluence, i: number) => (
                <motion.tr
                  key={e.event_id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.02 }}
                  className="border-b border-chronos-border/20 hover:bg-white/[0.02] cursor-pointer"
                  onClick={() => setHighlightedNodes(new Set([e.event_id]))}
                >
                  <td className="px-3 py-1.5 text-chronos-muted">{i + 1}</td>
                  <td className="px-3 py-1.5 text-white truncate max-w-[120px]">{e.label}</td>
                  <td className="px-3 py-1.5 text-right text-chronos-accent">{e.composite_score.toFixed(2)}</td>
                  <td className="px-3 py-1.5 text-right text-chronos-muted">{e.pagerank.toFixed(2)}</td>
                  <td className="px-3 py-1.5 text-right text-chronos-muted">{e.reachability}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
