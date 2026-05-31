'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useChronosStore } from '@/store';
import { api } from '@/utils/api';
import { Brain, CheckCircle, AlertCircle, Cpu } from 'lucide-react';
import toast from 'react-hot-toast';

const EXAMPLE_TEXTS = [
  `A scientist invents a time machine.
The time machine sends a blueprint back to the past.
The blueprint enables the scientist to build the time machine.`,
  `A car accident happens at a crossroads.
The accident leads Jonas to discover a cave.
The cave contains a time travel passage.
Jonas uses the passage and travels back 33 years.
His presence in the past eventually causes the accident.`,
  `An AI discovers a mathematical theorem.
The theorem is encrypted and sent back in time.
A researcher in the past receives the theorem.
The researcher uses it to build the AI.`,
];

export function ParserPanel() {
  const { activeUniverse, setActiveUniverse } = useChronosStore();
  const router = useRouter();
  const [text, setText] = useState('');
  const [universeName, setUniverseName] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [ollamaStatus, setOllamaStatus] = useState<any>(null);
  const [importing, setImporting] = useState(false);

  useEffect(() => {
    api.parser.status().then(setOllamaStatus).catch(() => {});
  }, []);

  const parse = async () => {
    if (!text.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const r = await api.parser.parse(text, universeName || undefined);
      setResult(r);
      toast.success(`Extracted ${r.event_count} events, ${r.relationship_count} relationships`);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  const importToUniverse = async () => {
    if (!result || !activeUniverse) return;
    setImporting(true);
    try {
      await api.universes.sync(activeUniverse.id, {
        events: result.events,
        relationships: result.relationships,
      });
      const updated = await api.universes.get(activeUniverse.id);
      setActiveUniverse(updated);
      toast.success('Universe populated with parsed events!');
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setImporting(false);
    }
  };

  const createAndImport = async () => {
    if (!result) return;
    setImporting(true);
    try {
      const u = await api.universes.create({
        name: result.universe_name || 'Parsed Universe',
        description: `Auto-generated from AI parser`,
      });
      await api.universes.sync(u.id, {
        events: result.events,
        relationships: result.relationships,
      });
      toast.success(`Universe "${u.name}" created!`);
      router.push(`/universe/${u.id}`);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-2">
        <Brain size={14} className="text-green-400" />
        <span className="text-xs font-mono text-white">AI Story-to-Universe Parser</span>
      </div>

      {/* Ollama status */}
      {ollamaStatus && (
        <div className={`flex items-center gap-2 text-[10px] font-mono px-3 py-2 rounded border ${
          ollamaStatus.ollama_online && ollamaStatus.model_available
            ? 'text-green-400 border-green-500/20 bg-green-500/5'
            : 'text-yellow-400 border-yellow-500/20 bg-yellow-500/5'
        }`}>
          {ollamaStatus.ollama_online ? <CheckCircle size={11} /> : <AlertCircle size={11} />}
          {ollamaStatus.ollama_online
            ? ollamaStatus.model_available
              ? `${ollamaStatus.target_model} ready`
              : `Ollama online — run: ollama pull ${ollamaStatus.target_model}`
            : 'Ollama offline — using fallback parser'}
        </div>
      )}

      {/* Input */}
      <div>
        <label className="text-[10px] font-mono text-chronos-muted block mb-1">UNIVERSE NAME (optional)</label>
        <input
          value={universeName}
          onChange={(e) => setUniverseName(e.target.value)}
          placeholder="e.g. Dark Season 1..."
          className="w-full bg-chronos-bg border border-chronos-border rounded px-3 py-1.5 text-[11px] text-white font-mono focus:outline-none focus:border-chronos-accent/50 placeholder:text-chronos-muted/40 mb-3"
        />
        <label className="text-[10px] font-mono text-chronos-muted block mb-1">CAUSAL STORY TEXT</label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Describe a causal chain, story, or sequence of events..."
          rows={8}
          className="w-full bg-chronos-bg border border-chronos-border rounded px-3 py-2 text-[11px] text-white font-mono focus:outline-none focus:border-chronos-accent/50 resize-none placeholder:text-chronos-muted/40"
        />
      </div>

      {/* Examples */}
      <div>
        <div className="text-[10px] font-mono text-chronos-muted mb-1">EXAMPLES</div>
        <div className="space-y-1">
          {EXAMPLE_TEXTS.map((ex, i) => (
            <button
              key={i}
              onClick={() => setText(ex)}
              className="w-full text-left text-[10px] font-mono text-chronos-muted/70 hover:text-chronos-accent px-2 py-1.5 border border-chronos-border/40 rounded hover:border-chronos-accent/30 transition-all truncate"
            >
              Example {i + 1}: {ex.split('\n')[0].slice(0, 50)}...
            </button>
          ))}
        </div>
      </div>

      {/* Parse button */}
      <button
        onClick={parse}
        disabled={loading || !text.trim()}
        className="w-full py-2.5 bg-chronos-accent/15 hover:bg-chronos-accent/25 border border-chronos-accent/30 rounded-lg text-chronos-accent text-[11px] font-mono transition-all disabled:opacity-40 flex items-center justify-center gap-2"
      >
        {loading ? (
          <><span className="animate-spin">⟳</span> Parsing with AI...</>
        ) : (
          <><Cpu size={12} /> Parse Story into Universe</>
        )}
      </button>

      {/* Result */}
      {result && (
        <div className="space-y-3">
          <div className="glass rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle size={12} className="text-green-400" />
              <span className="text-[11px] font-mono text-green-400">Parsed successfully</span>
              {result.source === 'fallback' && (
                <span className="text-[9px] font-mono text-yellow-400 border border-yellow-500/20 rounded px-1">FALLBACK</span>
              )}
            </div>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <div className="text-lg font-bold font-mono text-white">{result.event_count}</div>
                <div className="text-[9px] text-chronos-muted">Events</div>
              </div>
              <div>
                <div className="text-lg font-bold font-mono text-white">{result.relationship_count}</div>
                <div className="text-[9px] text-chronos-muted">Relations</div>
              </div>
              <div>
                <div className="text-[11px] font-mono text-chronos-accent">{result.model}</div>
                <div className="text-[9px] text-chronos-muted">Model</div>
              </div>
            </div>
            {result.note && <div className="text-[10px] font-mono text-yellow-400/70 mt-2">{result.note}</div>}
          </div>

          {/* Extracted events preview */}
          <div className="glass rounded-lg p-3 max-h-40 overflow-y-auto">
            <div className="text-[10px] font-mono text-chronos-muted mb-2 uppercase">Extracted Events</div>
            {result.events.map((e: any) => (
              <div key={e.id} className="flex items-center gap-2 py-0.5">
                <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: e.color || '#00d4ff' }} />
                <span className="text-[11px] font-mono text-white">{e.label}</span>
                <span className="text-[9px] text-chronos-muted">{e.event_type}</span>
              </div>
            ))}
          </div>

          {/* Import buttons */}
          <div className="flex gap-2">
            {activeUniverse && (
              <button
                onClick={importToUniverse}
                disabled={importing}
                className="flex-1 py-2 text-[11px] font-mono border border-chronos-accent/30 text-chronos-accent bg-chronos-accent/10 hover:bg-chronos-accent/20 rounded-lg transition-all disabled:opacity-40"
              >
                {importing ? 'Importing...' : '→ Import to Current Universe'}
              </button>
            )}
            <button
              onClick={createAndImport}
              disabled={importing}
              className="flex-1 py-2 text-[11px] font-mono border border-green-500/30 text-green-400 bg-green-500/10 hover:bg-green-500/20 rounded-lg transition-all disabled:opacity-40"
            >
              {importing ? 'Creating...' : '+ Create New Universe'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
