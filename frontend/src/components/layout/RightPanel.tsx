'use client';
import { motion } from 'framer-motion';
import { useChronosStore } from '@/store';
import { X } from 'lucide-react';
import { DashboardPanel } from '../panels/DashboardPanel';
import { ParadoxPanel } from '../panels/ParadoxPanel';
import { InfluencePanel } from '../panels/InfluencePanel';
import { ConsequencePanel } from '../panels/ConsequencePanel';
import { CounterfactualPanel } from '../panels/CounterfactualPanel';
import { TimelinePanel } from '../panels/TimelinePanel';
import { KnowledgePanel } from '../panels/KnowledgePanel';
import { ParserPanel } from '../panels/ParserPanel';

const PANEL_TITLES: Record<string, string> = {
  dashboard: 'Universe Dashboard',
  paradox: 'Paradox Engine',
  influence: 'Causal Influence',
  consequences: 'Consequence Analysis',
  counterfactual: 'Counterfactual Engine',
  timeline: 'Timeline Simulator',
  knowledge: 'Knowledge Origin Tracker',
  parser: 'AI Story Parser',
};

export function RightPanel() {
  const { activePanel, setActivePanel } = useChronosStore();

  const PanelComponent = {
    dashboard: DashboardPanel,
    paradox: ParadoxPanel,
    influence: InfluencePanel,
    consequences: ConsequencePanel,
    counterfactual: CounterfactualPanel,
    timeline: TimelinePanel,
    knowledge: KnowledgePanel,
    parser: ParserPanel,
  }[activePanel];

  return (
    <motion.div
      initial={{ x: 400, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 400, opacity: 0 }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="w-[420px] border-l border-chronos-border bg-chronos-surface/80 backdrop-blur-md flex flex-col overflow-hidden z-10"
    >
      {/* Panel header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-chronos-border shrink-0">
        <span className="text-xs font-mono text-chronos-accent uppercase tracking-widest">
          {PANEL_TITLES[activePanel] || activePanel}
        </span>
        <button
          onClick={() => setActivePanel('none')}
          className="text-chronos-muted hover:text-white transition-colors"
        >
          <X size={14} />
        </button>
      </div>

      {/* Panel content */}
      <div className="flex-1 overflow-y-auto">
        {PanelComponent ? <PanelComponent /> : (
          <div className="flex items-center justify-center h-full text-chronos-muted font-mono text-sm">
            No panel selected
          </div>
        )}
      </div>
    </motion.div>
  );
}
