'use client';
import { useEffect, useRef } from 'react';
import { useChronosStore } from '@/store';
import { api } from '@/utils/api';
import {
  Play, Pause, Square, SkipBack, SkipForward,
  ChevronsLeft, ChevronsRight
} from 'lucide-react';
import toast from 'react-hot-toast';

export function BottomBar() {
  const {
    activeUniverse,
    simulatorState, setSimulatorState,
    currentStep, setCurrentStep,
    compiledTimeline, setCompiledTimeline,
    totalSteps,
  } = useChronosStore();

  const intervalRef = useRef<NodeJS.Timeout>();

  const compileTimeline = async () => {
    if (!activeUniverse) return;
    try {
      const tl = await api.timeline.compile(activeUniverse.id);
      setCompiledTimeline(tl);
      setCurrentStep(0);
      return tl;
    } catch {
      toast.error('Failed to compile timeline');
      return null;
    }
  };

  const play = async () => {
    let tl = compiledTimeline;
    if (!tl) tl = await compileTimeline();
    if (!tl) return;
    setSimulatorState('playing');
    setCurrentStep((prev) => (prev >= tl.total_steps ? 1 : prev + 1));
  };

  const pause = () => {
    setSimulatorState('paused');
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const stop = () => {
    setSimulatorState('stopped');
    setCurrentStep(0);
    setCompiledTimeline(null);
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  // Auto-advance when playing
  useEffect(() => {
    if (simulatorState === 'playing') {
      intervalRef.current = setInterval(() => {
        setCurrentStep((prev) => {
          if (prev >= totalSteps) {
            setSimulatorState('paused');
            clearInterval(intervalRef.current);
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [simulatorState, totalSteps]);

  const stepForward = () => {
    if (!compiledTimeline) return;
    setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
    if (simulatorState === 'stopped') setSimulatorState('paused');
  };

  const stepBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
    if (simulatorState === 'stopped') setSimulatorState('paused');
  };

  const isPlaying = simulatorState === 'playing';
  const hasTl = compiledTimeline !== null;
  const progress = totalSteps > 0 ? (currentStep / totalSteps) * 100 : 0;

  const currentStepData = compiledTimeline?.steps?.[currentStep - 1];

  return (
    <div className="h-11 border-t border-chronos-border bg-chronos-surface/90 backdrop-blur-md flex items-center gap-3 px-4 shrink-0 z-20">
      {/* Controls */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => setCurrentStep(1)}
          disabled={!hasTl || currentStep <= 1}
          className="p-1.5 text-chronos-muted hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          title="Go to start"
        >
          <ChevronsLeft size={13} />
        </button>
        <button
          onClick={stepBack}
          disabled={!hasTl || currentStep <= 0}
          className="p-1.5 text-chronos-muted hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <SkipBack size={13} />
        </button>

        {isPlaying ? (
          <button
            onClick={pause}
            className="p-1.5 text-chronos-accent hover:text-white transition-colors"
          >
            <Pause size={15} />
          </button>
        ) : (
          <button
            onClick={play}
            disabled={!activeUniverse}
            className="p-1.5 text-chronos-accent hover:text-white disabled:opacity-40 transition-colors"
          >
            <Play size={15} />
          </button>
        )}

        <button
          onClick={stop}
          disabled={!hasTl}
          className="p-1.5 text-chronos-muted hover:text-chronos-red disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <Square size={13} />
        </button>
        <button
          onClick={stepForward}
          disabled={hasTl && currentStep >= totalSteps}
          className="p-1.5 text-chronos-muted hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <SkipForward size={13} />
        </button>
        <button
          onClick={() => { if (compiledTimeline) setCurrentStep(totalSteps); }}
          disabled={!hasTl || currentStep >= totalSteps}
          className="p-1.5 text-chronos-muted hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          title="Go to end"
        >
          <ChevronsRight size={13} />
        </button>
      </div>

      <div className="w-px h-5 bg-chronos-border" />

      {/* Progress */}
      <div className="flex items-center gap-2 flex-1">
        <div className="flex-1 progress-bar cursor-pointer" onClick={(e) => {
          if (!hasTl) return;
          const rect = e.currentTarget.getBoundingClientRect();
          const pct = (e.clientX - rect.left) / rect.width;
          setCurrentStep(Math.round(pct * totalSteps));
        }}>
          <div
            className="progress-fill transition-all duration-300"
            style={{ width: `${progress}%`, background: isPlaying ? '#00ff88' : '#00d4ff' }}
          />
        </div>
        <span className="text-[10px] font-mono text-chronos-muted whitespace-nowrap">
          {hasTl ? `${currentStep} / ${totalSteps}` : '—'}
        </span>
      </div>

      <div className="w-px h-5 bg-chronos-border" />

      {/* Step description */}
      <div className="text-[11px] font-mono text-chronos-muted truncate max-w-[300px]">
        {currentStepData ? currentStepData.description : (
          isPlaying ? 'Simulating...' : 'Press Play to simulate universe timeline'
        )}
      </div>

      <div className="w-px h-5 bg-chronos-border" />

      {/* State badge */}
      <div className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
        isPlaying
          ? 'text-green-400 bg-green-500/10 border-green-500/20'
          : hasTl
          ? 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20'
          : 'text-chronos-muted bg-chronos-border/30 border-chronos-border'
      }`}>
        {isPlaying ? '▶ PLAYING' : hasTl ? '⏸ PAUSED' : '■ STOPPED'}
      </div>
    </div>
  );
}
