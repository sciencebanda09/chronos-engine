'use client';
import { useChronosStore } from '@/store';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Search, Circle } from 'lucide-react';
import { useState } from 'react';

const EVENT_TYPE_COLORS: Record<string, string> = {
  origin: '#00ff88', terminal: '#ff4466', decision: '#ffaa00',
  paradox: '#cc44ff', standard: '#00d4ff',
};

export function LeftSidebar() {
  const { activeUniverse, sidebarCollapsed, setSidebarCollapsed, setSelectedEventId, selectedEventId } = useChronosStore();
  const [search, setSearch] = useState('');

  const events = activeUniverse?.events || [];
  const filtered = events.filter((e) =>
    e.label.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AnimatePresence initial={false}>
      {!sidebarCollapsed ? (
        <motion.aside
          key="sidebar"
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 220, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="border-r border-chronos-border bg-chronos-surface/70 backdrop-blur-sm flex flex-col overflow-hidden z-10"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-3 py-2 border-b border-chronos-border">
            <span className="text-[10px] font-mono text-chronos-muted uppercase tracking-widest">
              Events ({events.length})
            </span>
            <button
              onClick={() => setSidebarCollapsed(true)}
              className="text-chronos-muted hover:text-white transition-colors"
            >
              <ChevronLeft size={12} />
            </button>
          </div>

          {/* Search */}
          <div className="px-2 py-2 border-b border-chronos-border">
            <div className="flex items-center gap-2 bg-chronos-bg/60 border border-chronos-border rounded px-2 py-1.5">
              <Search size={11} className="text-chronos-muted shrink-0" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search events..."
                className="bg-transparent text-[11px] text-white font-mono w-full outline-none placeholder:text-chronos-muted/40"
              />
            </div>
          </div>

          {/* Events list */}
          <div className="flex-1 overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <div className="text-center py-8 text-chronos-muted/50 text-[11px] font-mono">
                {search ? 'No matches' : 'No events yet'}
              </div>
            ) : (
              filtered.map((event) => (
                <button
                  key={event.id}
                  onClick={() => setSelectedEventId(event.id)}
                  className={`w-full text-left px-3 py-2 flex items-start gap-2 hover:bg-chronos-border/30 transition-colors border-l-2 ${
                    selectedEventId === event.id
                      ? 'bg-chronos-accent/10 border-l-chronos-accent'
                      : 'border-l-transparent'
                  }`}
                >
                  <Circle
                    size={6}
                    className="mt-1.5 shrink-0 fill-current"
                    style={{ color: EVENT_TYPE_COLORS[event.event_type] || '#00d4ff' }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-[11px] text-white truncate font-mono">{event.label}</div>
                    <div className="text-[10px] text-chronos-muted/60 font-mono">{event.event_type}</div>
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Footer stats */}
          <div className="border-t border-chronos-border px-3 py-2">
            <div className="flex justify-between text-[10px] font-mono text-chronos-muted">
              <span>Stability</span>
              <span style={{ color: activeUniverse?.stability_score >= 80 ? '#00ff88' : activeUniverse?.stability_score >= 50 ? '#ffaa00' : '#ff4466' }}>
                {activeUniverse?.stability_score?.toFixed(1) || '100.0'}%
              </span>
            </div>
            <div className="progress-bar mt-1">
              <div
                className="progress-fill"
                style={{
                  width: `${activeUniverse?.stability_score || 100}%`,
                  background: activeUniverse?.stability_score >= 80 ? '#00ff88' : activeUniverse?.stability_score >= 50 ? '#ffaa00' : '#ff4466',
                }}
              />
            </div>
          </div>
        </motion.aside>
      ) : (
        <motion.div
          key="collapsed"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="w-8 border-r border-chronos-border bg-chronos-surface/70 flex flex-col items-center py-3 z-10"
        >
          <button
            onClick={() => setSidebarCollapsed(false)}
            className="text-chronos-muted hover:text-white transition-colors"
          >
            <ChevronRight size={12} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
