'use client';
import { useEffect, useState } from 'react';
import { useChronosStore } from '@/store';
import { api } from '@/utils/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, CheckCircle, Circle, AlertTriangle } from 'lucide-react';
import { CompiledTimeline, TimelineStep } from '@/types';

function StepCard({ step, isActive, isPast }: { step: TimelineStep; isActive: boolean; isPast: boolean }) {
  const [expanded, setExpanded] = useState(false);
  const opacity = isActive ? 1 : isPast ? 0.6 : 0.35;

  return (
    <motion.div
      animate={{ opacity, scale: isActive ? 1.01 : 1 }}
      className={`border rounded-lg mb-2 overflow-hidden cursor-pointer transition-all ${
        isActive ? 'border-yellow-500/50 bg-yellow-500/5' :
        isPast ? 'border-green-500/20 bg-green-500/3' :
        'border-chronos-border/30'
      }`}
      onClick={() => setExpanded(!expanded)}
    >
      <div className="flex items-center gap-2 px-3 py-2">
        {isPast ? (
          <CheckCircle size={12} className="text-green-400 shrink-0" />
        ) : isActive ? (
          <div className="w-3 h-3 rounded-full bg-yellow-400 animate-pulse shrink-0" />
        ) : (
          <Circle size={12} className="text-chronos-muted/40 shrink-0" />
        )}
        <span className={`text-[10px] font-mono w-6 ${isActive ? 'text-yellow-400' : isPast ? 'text-green-400' : 'text-chronos-muted'}`}>
          {step.step}
        </span>
        <span className="text-[11px] text-white/80 flex-1 truncate">{step.description}</span>
        <span className="text-[10px] font-mono text-chronos-muted shrink-0">+{step.count}</span>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
            <div className="px-3 pb-3 border-t border-chronos-border/30 pt-2 space-y-1">
              {(step.events_activated || []).map((e: any) => (
                <div key={e.id} className="text-[11px] font-mono">
                  <span className="text-white">{e.label}</span>
                  {e.triggered_by?.length > 0 && (
                    <span className="text-chronos-muted"> ← {(e.triggered_by || []).map((t: any) => t.from_label).join(', ')}</span>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function TimelinePanel() {
  const { activeUniverse, currentStep, simulatorState, compiledTimeline, setCompiledTimeline, setCurrentStep } = useChronosStore();
  const [loading, setLoading] = useState(false);

  const compile = async () => {
    if (!activeUniverse) return;
    setLoading(true);
    try {
      const tl = await api.timeline.compile(activeUniverse.id);
      setCompiledTimeline(tl);
      setCurrentStep(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { compile(); }, [activeUniverse?.id]);

  const tl: CompiledTimeline | null = compiledTimeline;

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain size={14} className="text-chronos-accent" />
          <span className="text-xs font-mono text-white">Timeline Simulator</span>
        </div>
        <button
          onClick={compile}
          disabled={loading}
          className="text-[10px] font-mono px-2 py-1 bg-chronos-accent/10 border border-chronos-accent/20 rounded text-chronos-accent hover:bg-chronos-accent/20"
        >
          {loading ? 'Compiling...' : 'Recompile'}
        </button>
      </div>

      {loading ? (
        <div className="space-y-2">{[...Array(5)].map((_, i) => <div key={i} className="shimmer h-10 rounded" />)}</div>
      ) : !tl ? (
        <div className="text-chronos-muted font-mono text-sm text-center py-8">Compile the timeline to see steps</div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-3 gap-2">
            <div className="stat-card text-center">
              <div className="text-xl font-bold font-mono text-white">{tl.total_steps}</div>
              <div className="text-[9px] text-chronos-muted">Steps</div>
            </div>
            <div className="stat-card text-center">
              <div className="text-xl font-bold font-mono text-white">{tl.total_events}</div>
              <div className="text-[9px] text-chronos-muted">Events</div>
            </div>
            <div className="stat-card text-center">
              <div className={`text-xl font-bold font-mono ${tl.is_deterministic ? 'text-green-400' : 'text-yellow-400'}`}>
                {tl.is_deterministic ? 'DAG' : 'CYC'}
              </div>
              <div className="text-[9px] text-chronos-muted">{tl.is_deterministic ? 'Deterministic' : 'Cyclic'}</div>
            </div>
          </div>

          {/* Errors */}
          {tl.errors?.length > 0 && (
            <div className="flex items-start gap-2 p-2 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <AlertTriangle size={12} className="text-yellow-400 mt-0.5 shrink-0" />
              <div className="text-[10px] font-mono text-yellow-300/80 space-y-0.5">
                {(tl.errors || []).map((e, i) => <div key={i}>{e}</div>)}
              </div>
            </div>
          )}

          {/* Tip */}
          <div className="text-[10px] font-mono text-chronos-muted bg-chronos-bg/60 rounded px-3 py-2">
            ▶ Use the Play/Step controls in the bottom bar to simulate timeline progression.
          </div>

          {/* Roots and Terminals */}
          <div className="grid grid-cols-2 gap-2">
            <div className="glass rounded p-2">
              <div className="text-[9px] font-mono text-green-400 mb-1 uppercase">Root Events</div>
              {(tl.root_events || []).map((e: any) => (
                <div key={e.id} className="text-[10px] font-mono text-white truncate">• {e.label}</div>
              ))}
            </div>
            <div className="glass rounded p-2">
              <div className="text-[9px] font-mono text-red-400 mb-1 uppercase">Terminal Events</div>
              {(tl.terminal_events || []).map((e: any) => (
                <div key={e.id} className="text-[10px] font-mono text-white truncate">• {e.label}</div>
              ))}
            </div>
          </div>

          {/* Steps */}
          <div>
            <div className="text-[10px] font-mono text-chronos-muted mb-2 uppercase">Propagation Steps</div>
            <div className="max-h-[400px] overflow-y-auto pr-1">
              {(tl.steps || []).map((step: TimelineStep) => (
                <StepCard
                  key={step.step}
                  step={step}
                  isActive={currentStep === step.step && simulatorState !== 'stopped'}
                  isPast={currentStep > step.step && simulatorState !== 'stopped'}
                />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
