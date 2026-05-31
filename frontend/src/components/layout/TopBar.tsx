'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useChronosStore } from '@/store';
import { api } from '@/utils/api';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Cpu, ChevronLeft, Zap, Activity, BarChart3,
  GitBranch, Layers, BookOpen, Brain, Save, Check
} from 'lucide-react';
import toast from 'react-hot-toast';
import { PanelType } from '@/types';

interface NavButton { id: PanelType; label: string; icon: any; color: string; }

const NAV_BUTTONS: NavButton[] = [
  { id: 'dashboard',     label: 'Dashboard',      icon: BarChart3, color: '#00d4ff' },
  { id: 'paradox',       label: 'Paradoxes',       icon: Zap,       color: '#cc44ff' },
  { id: 'influence',     label: 'Influence',       icon: Activity,  color: '#00ff88' },
  { id: 'consequences',  label: 'Consequences',    icon: Layers,    color: '#ffaa00' },
  { id: 'counterfactual',label: 'Counterfactual',  icon: GitBranch, color: '#ff4466' },
  { id: 'timeline',      label: 'Timeline',        icon: Brain,     color: '#00d4ff' },
  { id: 'knowledge',     label: 'Knowledge',       icon: BookOpen,  color: '#7c3aed' },
  { id: 'parser',        label: 'AI Parser',       icon: Brain,     color: '#00ff88' },
];

export function TopBar() {
  const router = useRouter();
  const { activeUniverse, activePanel, setActivePanel, setDashboardData } = useChronosStore();
  const [compiling, setCompiling] = useState(false);
  const [compiled, setCompiled] = useState(false);

  const compile = async () => {
    if (!activeUniverse) return;
    setCompiling(true);
    try {
      const result = await api.universes.compile(activeUniverse.id);
      toast.success(`Compiled: Stability ${result.compiled?.stability_score?.toFixed(1)}% | ${result.compiled?.paradox_count || 0} paradox(es)`);
      setCompiled(true);
      setTimeout(() => setCompiled(false), 3000);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setCompiling(false);
    }
  };

  const togglePanel = (id: PanelType) => {
    setActivePanel(activePanel === id ? 'none' : id);
  };

  return (
    <header className="h-12 border-b border-chronos-border bg-chronos-surface/90 backdrop-blur-md flex items-center px-3 gap-3 z-20 shrink-0">
      {/* Logo / Back */}
      <button
        onClick={() => router.push('/')}
        className="flex items-center gap-2 text-chronos-muted hover:text-white transition-colors shrink-0"
      >
        <ChevronLeft size={14} />
        <Cpu size={14} className="text-chronos-accent" />
        <span className="text-xs font-mono text-chronos-accent hidden sm:block">CHRONOS</span>
      </button>

      <div className="w-px h-5 bg-chronos-border" />

      {/* Universe name */}
      <div className="shrink-0 max-w-[160px]">
        <div className="text-xs font-mono text-white truncate">{activeUniverse?.name || '...'}</div>
        <div className="text-[10px] text-chronos-muted font-mono leading-none">
          {activeUniverse?.events?.length || 0}E · {activeUniverse?.relationships?.length || 0}R
        </div>
      </div>

      <div className="w-px h-5 bg-chronos-border" />

      {/* Nav buttons - scrollable */}
      <div className="flex items-center gap-1 overflow-x-auto flex-1 scrollbar-hide">
        {NAV_BUTTONS.map(({ id, label, icon: Icon, color }) => {
          const isActive = activePanel === id;
          return (
            <button
              key={id}
              onClick={() => togglePanel(id)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-mono whitespace-nowrap transition-all shrink-0 ${
                isActive
                  ? 'text-white'
                  : 'text-chronos-muted hover:text-white'
              }`}
              style={isActive ? {
                background: `${color}20`,
                border: `1px solid ${color}44`,
                color,
              } : {
                background: 'transparent',
                border: '1px solid transparent',
              }}
            >
              <Icon size={11} />
              {label}
            </button>
          );
        })}
      </div>

      {/* Compile button */}
      <button
        onClick={compile}
        disabled={compiling || !activeUniverse}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-[11px] font-mono shrink-0 transition-all border ${
          compiled
            ? 'bg-green-500/15 border-green-500/30 text-green-400'
            : 'bg-chronos-accent/15 hover:bg-chronos-accent/25 border-chronos-accent/30 text-chronos-accent'
        } disabled:opacity-40`}
      >
        {compiling ? (
          <><span className="animate-spin">⟳</span> Compiling...</>
        ) : compiled ? (
          <><Check size={11} /> Compiled</>
        ) : (
          <><Save size={11} /> Compile</>
        )}
      </button>
    </header>
  );
}
