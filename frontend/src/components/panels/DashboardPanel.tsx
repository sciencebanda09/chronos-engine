'use client';
import { useEffect, useState } from 'react';
import { useChronosStore } from '@/store';
import { api } from '@/utils/api';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { Activity, Zap, Shield, AlertTriangle, TrendingDown } from 'lucide-react';

function StatCard({ label, value, color, icon: Icon, unit = '' }: any) {
  return (
    <div className="stat-card">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] text-chronos-muted font-mono uppercase tracking-wider">{label}</span>
        <Icon size={12} style={{ color }} />
      </div>
      <div className="text-xl font-bold font-mono" style={{ color }}>
        {typeof value === 'number' ? value.toFixed(1) : value}{unit}
      </div>
    </div>
  );
}

export function DashboardPanel() {
  const { activeUniverse } = useChronosStore();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!activeUniverse) return;
    (async () => {
      setLoading(true);
      try {
        const d = await api.analysis.dashboard(activeUniverse.id);
        setData(d);
      } finally {
        setLoading(false);
      }
    })();
  }, [activeUniverse?.id]);

  if (loading) return <div className="p-4 space-y-3">{[...Array(6)].map((_, i) => <div key={i} className="shimmer h-12 rounded" />)}</div>;
  if (!data) return <div className="p-4 text-chronos-muted font-mono text-sm">No data</div>;

  const stabilityColor = data.stability_score >= 80 ? '#00ff88' : data.stability_score >= 50 ? '#ffaa00' : '#ff4466';
  const healthColor = data.universe_health_index >= 70 ? '#00ff88' : data.universe_health_index >= 40 ? '#ffaa00' : '#ff4466';

  const radarData = [
    { metric: 'Stability', value: data.stability_score },
    { metric: 'Health', value: data.universe_health_index },
    { metric: 'Safety', value: Math.max(0, 100 - data.collapse_risk) },
    { metric: 'Order', value: Math.max(0, 100 - data.timeline_entropy) },
    { metric: 'Density', value: data.dependency_density },
  ];

  const topEvents = data.top_influential_events?.slice(0, 5) || [];

  return (
    <div className="p-4 space-y-4">
      {/* Key metrics grid */}
      <div className="grid grid-cols-2 gap-2">
        <StatCard label="Stability" value={data.stability_score} color={stabilityColor} icon={Shield} unit="%" />
        <StatCard label="Health Index" value={data.universe_health_index} color={healthColor} icon={Activity} unit="%" />
        <StatCard label="Paradoxes" value={data.paradox_count} color={data.paradox_count > 0 ? '#ff4466' : '#00ff88'} icon={Zap} />
        <StatCard label="Collapse Risk" value={data.collapse_risk} color={data.collapse_risk > 50 ? '#ff4466' : '#ffaa00'} icon={AlertTriangle} unit="%" />
        <StatCard label="Entropy" value={data.timeline_entropy} color="#cc44ff" icon={TrendingDown} />
        <StatCard label="Density" value={data.dependency_density} color="#00d4ff" icon={Activity} unit="%" />
      </div>

      {/* Universe shape radar */}
      <div className="glass rounded-lg p-3">
        <div className="text-[10px] font-mono text-chronos-muted mb-2 uppercase tracking-wider">Universe Shape</div>
        <ResponsiveContainer width="100%" height={160}>
          <RadarChart data={radarData}>
            <PolarGrid stroke="rgba(0,212,255,0.1)" />
            <PolarAngleAxis dataKey="metric" tick={{ fill: '#4a6080', fontSize: 10, fontFamily: 'monospace' }} />
            <Radar name="Universe" dataKey="value" stroke="#00d4ff" fill="#00d4ff" fillOpacity={0.15} strokeWidth={1.5} />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Severity breakdown */}
      {data.severity_breakdown && (
        <div className="glass rounded-lg p-3">
          <div className="text-[10px] font-mono text-chronos-muted mb-3 uppercase tracking-wider">Paradox Severity</div>
          <div className="space-y-2">
            {Object.entries(data.severity_breakdown).map(([sev, count]) => {
              const colors: Record<string, string> = { critical: '#ff4466', high: '#ff6400', medium: '#ffaa00', low: '#00d4ff' };
              const color = colors[sev] || '#00d4ff';
              return (
                <div key={sev} className="flex items-center gap-2">
                  <span className="text-[10px] font-mono w-16 capitalize" style={{ color }}>{sev}</span>
                  <div className="flex-1 progress-bar">
                    <div className="progress-fill" style={{ width: `${Math.min(100, (count as number) * 20)}%`, background: color }} />
                  </div>
                  <span className="text-[10px] font-mono text-chronos-muted w-4">{count as number}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Top events */}
      {topEvents.length > 0 && (
        <div className="glass rounded-lg p-3">
          <div className="text-[10px] font-mono text-chronos-muted mb-2 uppercase tracking-wider">Top Influential Events</div>
          <ResponsiveContainer width="100%" height={120}>
            <BarChart data={topEvents.map((e: any) => ({ name: e.label.slice(0, 12), score: e.composite_score }))} layout="vertical">
              <XAxis type="number" tick={{ fill: '#4a6080', fontSize: 9 }} />
              <YAxis type="category" dataKey="name" tick={{ fill: '#8899aa', fontSize: 10, fontFamily: 'monospace' }} width={80} />
              <Tooltip contentStyle={{ background: '#0a0f1e', border: '1px solid #1a2744', fontSize: 11, fontFamily: 'monospace' }} />
              <Bar dataKey="score" fill="#00d4ff" fillOpacity={0.8} radius={[0, 3, 3, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Graph metrics */}
      <div className="glass rounded-lg p-3">
        <div className="text-[10px] font-mono text-chronos-muted mb-2 uppercase tracking-wider">Graph Metrics</div>
        <div className="space-y-1">
          {[
            ['Events', data.event_count],
            ['Relationships', data.relationship_count],
            ['Cycles', data.cycle_count],
            ['Components', data.graph_metrics?.weakly_connected_components],
            ['Avg In-Degree', data.graph_metrics?.avg_in_degree?.toFixed(2)],
            ['Avg Out-Degree', data.graph_metrics?.avg_out_degree?.toFixed(2)],
          ].map(([label, value]) => (
            <div key={label} className="flex justify-between text-[11px] font-mono">
              <span className="text-chronos-muted">{label}</span>
              <span className="text-white">{value ?? '—'}</span>
            </div>
          ))}
        </div>
        <div className="mt-2 text-[10px] font-mono">
          <span className={`px-2 py-0.5 rounded border ${data.is_dag ? 'text-green-400 border-green-500/20 bg-green-500/10' : 'text-red-400 border-red-500/20 bg-red-500/10'}`}>
            {data.is_dag ? '✓ DAG (Acyclic)' : '⚠ Contains Cycles'}
          </span>
        </div>
      </div>
    </div>
  );
}
