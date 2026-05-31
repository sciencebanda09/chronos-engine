'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Zap, Globe, Clock, Activity, Trash2, ChevronRight, Cpu } from 'lucide-react';
import { api } from '@/utils/api';
import { Universe } from '@/types';
import toast from 'react-hot-toast';

export default function HomePage() {
  const router = useRouter();
  const [universes, setUniverses] = useState<Universe[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [backendStatus, setBackendStatus] = useState<'checking' | 'online' | 'offline'>('checking');

  useEffect(() => {
    loadUniverses();
    checkBackend();
  }, []);

  const checkBackend = async () => {
    try {
      await api.health();
      setBackendStatus('online');
    } catch {
      setBackendStatus('offline');
    }
  };

  const loadUniverses = async () => {
    try {
      const data = await api.universes.list();
      setUniverses(data);
    } catch (e) {
      toast.error('Could not reach Chronos backend');
    } finally {
      setLoading(false);
    }
  };

  const createUniverse = async () => {
    if (!newName.trim()) return;
    setCreating(true);
    try {
      const u = await api.universes.create({ name: newName, description: newDesc });
      setUniverses((prev) => [u, ...prev]);
      setShowCreate(false);
      setNewName('');
      setNewDesc('');
      toast.success(`Universe "${u.name}" created`);
      router.push(`/universe/${u.id}`);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setCreating(false);
    }
  };

  const deleteUniverse = async (id: string, name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm(`Delete universe "${name}"? This cannot be undone.`)) return;
    try {
      await api.universes.delete(id);
      setUniverses((prev) => prev.filter((u) => u.id !== id));
      toast.success('Universe deleted');
    } catch (ex: any) {
      toast.error(ex.message);
    }
  };

  const stabilityColor = (score: number) => {
    if (score >= 80) return '#00ff88';
    if (score >= 50) return '#ffaa00';
    return '#ff4466';
  };

  return (
    <div className="min-h-screen bg-chronos-bg bg-grid flex flex-col overflow-auto">
      {/* Header */}
      <div className="relative z-10 border-b border-chronos-border bg-chronos-surface/80 backdrop-blur-md px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-chronos-accent/20 border border-chronos-accent/40 flex items-center justify-center">
            <Cpu size={16} className="text-chronos-accent" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-wide font-mono">CHRONOS ENGINE</h1>
            <p className="text-xs text-chronos-muted font-mono">Causal Intelligence Platform</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-2 text-xs font-mono px-3 py-1.5 rounded-full border ${
            backendStatus === 'online'
              ? 'border-green-500/30 text-green-400 bg-green-500/10'
              : backendStatus === 'offline'
              ? 'border-red-500/30 text-red-400 bg-red-500/10'
              : 'border-yellow-500/30 text-yellow-400 bg-yellow-500/10'
          }`}>
            <div className={`w-1.5 h-1.5 rounded-full ${
              backendStatus === 'online' ? 'bg-green-400 animate-pulse' :
              backendStatus === 'offline' ? 'bg-red-400' : 'bg-yellow-400 animate-pulse'
            }`} />
            {backendStatus === 'online' ? 'BACKEND ONLINE' : backendStatus === 'offline' ? 'BACKEND OFFLINE' : 'CONNECTING...'}
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2 bg-chronos-accent/20 hover:bg-chronos-accent/30 border border-chronos-accent/40 rounded-lg text-chronos-accent text-sm font-mono transition-all"
          >
            <Plus size={14} />
            New Universe
          </button>
        </div>
      </div>

      {/* Hero */}
      <div className="relative px-8 py-16 text-center">
        <div className="absolute inset-0 bg-radial-glow pointer-events-none" />
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <h2 className="text-5xl font-bold font-mono text-glow mb-4 text-chronos-accent">
            CHRONOS ENGINE
          </h2>
          <p className="text-xl text-chronos-muted max-w-2xl mx-auto mb-3">
            Computational Laboratory for Causality
          </p>
          <p className="text-sm text-chronos-muted/60 max-w-xl mx-auto font-mono">
            Model universes • Detect paradoxes • Simulate timelines • Analyze consequences
          </p>
        </motion.div>

        {/* Stats row */}
        <div className="flex justify-center gap-8 mt-10">
          {[
            { icon: Globe, label: 'Universes', value: universes.length },
            { icon: Zap, label: 'Total Events', value: universes.reduce((s, u) => s + (u.events?.length || 0), 0) },
            { icon: Activity, label: 'Paradoxes', value: universes.reduce((s, u) => s + (u.paradox_count || 0), 0) },
            { icon: Clock, label: 'Timelines', value: universes.length },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="stat-card text-center min-w-[100px]">
              <Icon size={18} className="text-chronos-accent mx-auto mb-1" />
              <div className="text-2xl font-bold font-mono text-white">{value}</div>
              <div className="text-xs text-chronos-muted">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Universe Grid */}
      <div className="flex-1 px-8 pb-12">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl mx-auto">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="shimmer h-40 rounded-xl" />
            ))}
          </div>
        ) : universes.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <Globe size={48} className="text-chronos-muted/40 mx-auto mb-4" />
            <p className="text-chronos-muted font-mono mb-2">No universes exist yet.</p>
            <p className="text-chronos-muted/60 text-sm mb-6">Create your first universe to begin modeling causality.</p>
            <button
              onClick={() => setShowCreate(true)}
              className="px-6 py-3 bg-chronos-accent/20 hover:bg-chronos-accent/30 border border-chronos-accent/40 rounded-lg text-chronos-accent font-mono transition-all inline-flex items-center gap-2"
            >
              <Plus size={16} /> Create First Universe
            </button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl mx-auto">
            <AnimatePresence>
              {universes.map((universe, i) => (
                <motion.div
                  key={universe.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => router.push(`/universe/${universe.id}`)}
                  className="glass rounded-xl p-5 cursor-pointer hover:border-chronos-accent/40 transition-all group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-chronos-accent animate-pulse" />
                      <h3 className="font-semibold text-white group-hover:text-chronos-accent transition-colors font-mono text-sm">
                        {universe.name}
                      </h3>
                    </div>
                    <button
                      onClick={(e) => deleteUniverse(universe.id, universe.name, e)}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-400 text-chronos-muted transition-all"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  {universe.description && (
                    <p className="text-xs text-chronos-muted mb-3 line-clamp-2">{universe.description}</p>
                  )}

                  <div className="grid grid-cols-3 gap-2 mb-3">
                    <div className="text-center">
                      <div className="text-lg font-bold font-mono text-white">{universe.events?.length || 0}</div>
                      <div className="text-xs text-chronos-muted">Events</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold font-mono text-white">{universe.relationships?.length || 0}</div>
                      <div className="text-xs text-chronos-muted">Links</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold font-mono" style={{ color: universe.paradox_count > 0 ? '#ff4466' : '#00ff88' }}>
                        {universe.paradox_count}
                      </div>
                      <div className="text-xs text-chronos-muted">Paradoxes</div>
                    </div>
                  </div>

                  {/* Stability bar */}
                  <div className="mb-3">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-chronos-muted">Stability</span>
                      <span className="font-mono" style={{ color: stabilityColor(universe.stability_score) }}>
                        {universe.stability_score.toFixed(1)}%
                      </span>
                    </div>
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{
                          width: `${universe.stability_score}%`,
                          background: stabilityColor(universe.stability_score),
                        }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-chronos-muted font-mono">
                      {new Date(universe.updated_at).toLocaleDateString()}
                    </span>
                    <ChevronRight size={14} className="text-chronos-accent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Create Modal */}
      <AnimatePresence>
        {showCreate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50"
            onClick={(e) => e.target === e.currentTarget && setShowCreate(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-strong rounded-2xl p-8 w-full max-w-md mx-4"
            >
              <h3 className="text-lg font-bold font-mono text-chronos-accent mb-6">CREATE UNIVERSE</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs text-chronos-muted font-mono mb-2">UNIVERSE NAME *</label>
                  <input
                    autoFocus
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && createUniverse()}
                    placeholder="e.g. Dark Season 1, Interstellar, Custom Timeline..."
                    className="w-full bg-chronos-bg border border-chronos-border rounded-lg px-4 py-3 text-white text-sm font-mono focus:outline-none focus:border-chronos-accent/60 transition-colors placeholder:text-chronos-muted/40"
                  />
                </div>
                <div>
                  <label className="block text-xs text-chronos-muted font-mono mb-2">DESCRIPTION</label>
                  <textarea
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    placeholder="Describe this universe..."
                    rows={3}
                    className="w-full bg-chronos-bg border border-chronos-border rounded-lg px-4 py-3 text-white text-sm font-mono focus:outline-none focus:border-chronos-accent/60 transition-colors placeholder:text-chronos-muted/40 resize-none"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowCreate(false)}
                  className="flex-1 py-2.5 border border-chronos-border rounded-lg text-chronos-muted text-sm font-mono hover:border-chronos-border/80 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={createUniverse}
                  disabled={!newName.trim() || creating}
                  className="flex-1 py-2.5 bg-chronos-accent/20 hover:bg-chronos-accent/30 border border-chronos-accent/40 rounded-lg text-chronos-accent text-sm font-mono transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {creating ? 'Creating...' : 'Create Universe'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
