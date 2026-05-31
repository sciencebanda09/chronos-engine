'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Save } from 'lucide-react';

const EVENT_TYPES = [
  { value: 'standard', label: 'Standard', color: '#00d4ff' },
  { value: 'origin', label: 'Origin', color: '#00ff88' },
  { value: 'terminal', label: 'Terminal', color: '#ff4466' },
  { value: 'decision', label: 'Decision', color: '#ffaa00' },
  { value: 'paradox', label: 'Paradox', color: '#cc44ff' },
];

export function EventEditModal({ event, onSave, onClose }: {
  event: any;
  onSave: (data: any) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState({
    id: event.id,
    label: event.label || '',
    description: event.description || '',
    event_type: event.event_type || 'standard',
    timestamp_value: event.timestamp_value || 0,
    is_origin: event.is_origin || false,
    is_terminal: event.is_terminal || false,
    color: event.color || '#00d4ff',
  });

  const selectedType = EVENT_TYPES.find(t => t.value === form.event_type);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="glass-strong rounded-2xl p-6 w-full max-w-md mx-4"
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-sm font-bold font-mono text-chronos-accent">EDIT EVENT</h3>
          <button onClick={onClose} className="text-chronos-muted hover:text-white transition-colors">
            <X size={16} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-[10px] font-mono text-chronos-muted block mb-1.5">LABEL *</label>
            <input
              autoFocus
              value={form.label}
              onChange={(e) => setForm(f => ({ ...f, label: e.target.value }))}
              className="w-full bg-chronos-bg border border-chronos-border rounded-lg px-3 py-2.5 text-white text-sm font-mono focus:outline-none focus:border-chronos-accent/60"
              placeholder="Event label..."
            />
          </div>

          <div>
            <label className="text-[10px] font-mono text-chronos-muted block mb-1.5">DESCRIPTION</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
              rows={3}
              className="w-full bg-chronos-bg border border-chronos-border rounded-lg px-3 py-2.5 text-white text-sm font-mono focus:outline-none focus:border-chronos-accent/60 resize-none"
              placeholder="Describe what happens..."
            />
          </div>

          <div>
            <label className="text-[10px] font-mono text-chronos-muted block mb-1.5">EVENT TYPE</label>
            <div className="grid grid-cols-5 gap-1.5">
              {EVENT_TYPES.map(type => (
                <button
                  key={type.value}
                  onClick={() => setForm(f => ({ ...f, event_type: type.value, color: type.color }))}
                  className={`py-1.5 rounded text-[10px] font-mono border transition-all ${
                    form.event_type === type.value
                      ? 'text-white'
                      : 'text-chronos-muted border-chronos-border hover:border-chronos-border/80'
                  }`}
                  style={form.event_type === type.value ? {
                    background: `${type.color}20`,
                    borderColor: `${type.color}60`,
                    color: type.color,
                  } : {}}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[10px] font-mono text-chronos-muted block mb-1.5">TIMESTAMP</label>
            <input
              type="number"
              value={form.timestamp_value}
              onChange={(e) => setForm(f => ({ ...f, timestamp_value: parseFloat(e.target.value) || 0 }))}
              className="w-full bg-chronos-bg border border-chronos-border rounded-lg px-3 py-2 text-white text-sm font-mono focus:outline-none focus:border-chronos-accent/60"
              placeholder="0"
            />
          </div>

          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.is_origin}
                onChange={(e) => setForm(f => ({ ...f, is_origin: e.target.checked }))}
                className="accent-green-400"
              />
              <span className="text-[11px] font-mono text-chronos-muted">Origin Event</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.is_terminal}
                onChange={(e) => setForm(f => ({ ...f, is_terminal: e.target.checked }))}
                className="accent-red-400"
              />
              <span className="text-[11px] font-mono text-chronos-muted">Terminal Event</span>
            </label>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 border border-chronos-border rounded-lg text-chronos-muted text-sm font-mono hover:border-chronos-border/80 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(form)}
            disabled={!form.label.trim()}
            className="flex-1 py-2.5 bg-chronos-accent/20 hover:bg-chronos-accent/30 border border-chronos-accent/40 rounded-lg text-chronos-accent text-sm font-mono transition-all disabled:opacity-40 flex items-center justify-center gap-2"
          >
            <Save size={13} /> Save
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
