'use client';
import { useCallback, useEffect, useState, useRef } from 'react';
import {
  ReactFlow, Background, Controls, MiniMap,
  addEdge, useNodesState, useEdgesState,
  Connection, Node, Edge, BackgroundVariant,
  Panel, useReactFlow, ReactFlowProvider,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useChronosStore } from '@/store';
import { api } from '@/utils/api';
import { ChronosNode } from './ChronosNode';
import { ChronosEdge } from './ChronosEdge';
import { NodeData } from '@/types';
import { EventEditModal } from '../panels/EventEditModal';
import toast from 'react-hot-toast';
import { uuidv4 } from '@/utils/uuid';
import { Plus } from 'lucide-react';

const nodeTypes = { chronosNode: ChronosNode };
const edgeTypes = { chronosEdge: ChronosEdge };

const EVENT_COLORS: Record<string, string> = {
  standard: '#00d4ff',
  origin: '#00ff88',
  terminal: '#ff4466',
  decision: '#ffaa00',
  paradox: '#cc44ff',
};

function CanvasInner() {
  const {
    activeUniverse, highlightedNodes, collapsingNodes,
    simulatorState, currentStep, compiledTimeline,
    setSelectedEventId, selectedEventId,
  } = useChronosStore();

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [editingEvent, setEditingEvent] = useState<any | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const { fitView, screenToFlowPosition } = useReactFlow();
  const syncTimeoutRef = useRef<NodeJS.Timeout>();

  // Build nodes from universe events
  useEffect(() => {
    if (!activeUniverse) return;
    const newNodes: Node[] = activeUniverse.events.map((e) => ({
      id: e.id,
      type: 'chronosNode',
      position: { x: e.pos_x, y: e.pos_y },
      data: {
        label: e.label,
        description: e.description,
        event_type: e.event_type,
        color: e.color || EVENT_COLORS[e.event_type] || '#00d4ff',
        is_origin: e.is_origin,
        is_terminal: e.is_terminal,
        timestamp_value: e.timestamp_value,
        is_active: false,
        is_paradox_node: false,
      } as NodeData,
    }));

    const newEdges: Edge[] = activeUniverse.relationships.map((r) => ({
      id: r.id,
      source: r.source_id,
      target: r.target_id,
      type: 'chronosEdge',
      data: {
        label: r.label !== 'causes' ? r.label : '',
        strength: r.strength,
        animated: false,
      },
    }));

    setNodes(newNodes);
    setEdges(newEdges);
    setTimeout(() => fitView({ padding: 0.12 }), 100);
  }, [activeUniverse?.id]);

  // Apply highlights from analysis
  useEffect(() => {
    if (highlightedNodes.size === 0) return;
    setNodes((nds) =>
      nds.map((n) => ({
        ...n,
        data: { ...n.data, is_highlighted: highlightedNodes.has(n.id) },
      }))
    );
  }, [highlightedNodes]);

  // Apply collapse animation
  useEffect(() => {
    if (collapsingNodes.size === 0) return;
    setNodes((nds) =>
      nds.map((n) => ({
        ...n,
        data: { ...n.data, is_collapsing: collapsingNodes.has(n.id) },
      }))
    );
  }, [collapsingNodes]);

  // Simulator step visualization
  useEffect(() => {
    if (simulatorState === 'stopped' || !compiledTimeline) {
      setNodes((nds) => nds.map((n) => ({ ...n, data: { ...n.data, is_active: false } })));
      setEdges((eds) => eds.map((e) => ({ ...e, data: { ...e.data, animated: false } })));
      return;
    }
    if (currentStep < 1 || currentStep > compiledTimeline.total_steps) return;

    const step = compiledTimeline.steps[currentStep - 1];
    if (!step) return;

    const activeIds = new Set(step.events_activated.map((e: any) => e.id));
    const prevActiveIds = new Set(
      compiledTimeline.steps
        .slice(0, currentStep - 1)
        .flatMap((s: any) => s.events_activated.map((e: any) => e.id))
    );

    setNodes((nds) =>
      nds.map((n) => ({
        ...n,
        data: {
          ...n.data,
          is_active: activeIds.has(n.id),
          color: activeIds.has(n.id)
            ? '#ffaa00'
            : prevActiveIds.has(n.id)
            ? '#00ff88'
            : (n.data as NodeData).color,
        },
      }))
    );

    // Animate active edges
    const activeEdgeIds = new Set(
      step.events_activated.flatMap((e: any) =>
        e.triggered_by.map((t: any) => `${t.from_id}-${e.id}`)
      )
    );
    setEdges((eds) =>
      eds.map((edge) => ({
        ...edge,
        data: {
          ...edge.data,
          animated: activeEdgeIds.has(`${edge.source}-${edge.target}`),
        },
      }))
    );
  }, [currentStep, simulatorState, compiledTimeline]);

  // Sync to backend (debounced)
  const syncToBackend = useCallback(
    (currentNodes: Node[], currentEdges: Edge[]) => {
      if (!activeUniverse) return;
      if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
      syncTimeoutRef.current = setTimeout(async () => {
        try {
          const events = currentNodes.map((n) => ({
            id: n.id,
            label: (n.data as NodeData).label,
            description: (n.data as NodeData).description || '',
            event_type: (n.data as NodeData).event_type || 'standard',
            pos_x: n.position.x,
            pos_y: n.position.y,
            color: (n.data as NodeData).color || '#00d4ff',
            is_origin: (n.data as NodeData).is_origin || false,
            is_terminal: (n.data as NodeData).is_terminal || false,
            timestamp_value: (n.data as NodeData).timestamp_value || 0,
          }));
          const relationships = currentEdges.map((e) => ({
            id: e.id,
            source_id: e.source,
            target_id: e.target,
            label: (e.data?.label as string) || 'causes',
            strength: (e.data?.strength as number) || 1.0,
            delay: 0,
            rel_type: 'causal',
          }));
          await api.universes.sync(activeUniverse.id, { events, relationships });
        } catch (err) {
          // silent sync failure
        }
      }, 1500);
    },
    [activeUniverse?.id]
  );

  const onNodesChangeWithSync = useCallback(
    (changes: any) => {
      onNodesChange(changes);
      // Sync position changes
      const hasMoves = changes.some((c: any) => c.type === 'position' && c.dragging === false);
      if (hasMoves) {
        setNodes((nds) => {
          syncToBackend(nds, edges);
          return nds;
        });
      }
    },
    [onNodesChange, edges, syncToBackend]
  );

  // Connect two nodes
  const onConnect = useCallback(
    async (connection: Connection) => {
      if (!activeUniverse || !connection.source || !connection.target) return;
      const newEdge: Edge = {
        id: uuidv4(),
        source: connection.source,
        target: connection.target,
        type: 'chronosEdge',
        data: { label: '', strength: 1.0, animated: false },
      };
      setEdges((eds) => addEdge(newEdge, eds));
      try {
        await api.relationships.create(activeUniverse.id, {
          id: newEdge.id,
          source_id: connection.source,
          target_id: connection.target,
          label: 'causes',
          strength: 1.0,
          delay: 0,
          rel_type: 'causal',
        });
      } catch (e: any) {
        toast.error('Failed to create relationship');
      }
    },
    [activeUniverse?.id]
  );

  // Double-click on canvas → create new event
  const onCanvasDoubleClick = useCallback(
    async (event: React.MouseEvent) => {
      if (!activeUniverse) return;
      const target = event.target as HTMLElement;
      if (!target.classList.contains('react-flow__pane')) return;

      const position = screenToFlowPosition({ x: event.clientX, y: event.clientY });
      const newId = uuidv4();
      const newNode: Node = {
        id: newId,
        type: 'chronosNode',
        position,
        data: {
          label: 'New Event',
          description: '',
          event_type: 'standard',
          color: '#00d4ff',
          is_origin: false,
          is_terminal: false,
          timestamp_value: 0,
        } as NodeData,
      };
      setNodes((nds) => [...nds, newNode]);
      try {
        await api.events.create(activeUniverse.id, {
          id: newId,
          label: 'New Event',
          description: '',
          event_type: 'standard',
          pos_x: position.x,
          pos_y: position.y,
          color: '#00d4ff',
          is_origin: false,
          is_terminal: false,
          timestamp_value: 0,
        });
        toast.success('Event created — double-click to edit', { duration: 2000 });
      } catch (e: any) {
        toast.error('Failed to create event');
      }
    },
    [activeUniverse?.id, screenToFlowPosition]
  );

  // Click on node
  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      setSelectedEventId(node.id);
    },
    [setSelectedEventId]
  );

  // Double-click node → open edit
  const onNodeDoubleClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      setEditingEvent({ id: node.id, ...node.data });
      setShowEditModal(true);
    },
    []
  );

  // Delete selected
  const onKeyDown = useCallback(
    async (e: KeyboardEvent) => {
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedEventId && activeUniverse) {
        if ((e.target as HTMLElement).tagName === 'INPUT') return;
        try {
          await api.events.delete(activeUniverse.id, selectedEventId);
          setNodes((nds) => nds.filter((n) => n.id !== selectedEventId));
          setEdges((eds) => eds.filter((e) => e.source !== selectedEventId && e.target !== selectedEventId));
          setSelectedEventId(null);
          toast.success('Event deleted');
        } catch (ex: any) {
          toast.error(ex.message);
        }
      }
    },
    [selectedEventId, activeUniverse?.id]
  );

  useEffect(() => {
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onKeyDown]);

  const handleEventSaved = useCallback(
    async (eventData: any) => {
      if (!activeUniverse) return;
      try {
        await api.events.update(activeUniverse.id, eventData.id, {
          label: eventData.label,
          description: eventData.description,
          event_type: eventData.event_type,
          color: EVENT_COLORS[eventData.event_type] || eventData.color,
          is_origin: eventData.is_origin,
          is_terminal: eventData.is_terminal,
          timestamp_value: eventData.timestamp_value,
        });
        setNodes((nds) =>
          nds.map((n) =>
            n.id === eventData.id
              ? {
                  ...n,
                  data: {
                    ...n.data,
                    label: eventData.label,
                    description: eventData.description,
                    event_type: eventData.event_type,
                    color: EVENT_COLORS[eventData.event_type] || eventData.color,
                    is_origin: eventData.is_origin,
                    is_terminal: eventData.is_terminal,
                    timestamp_value: eventData.timestamp_value,
                  },
                }
              : n
          )
        );
        toast.success('Event updated');
        setShowEditModal(false);
      } catch (ex: any) {
        toast.error(ex.message);
      }
    },
    [activeUniverse?.id]
  );

  const addEvent = useCallback(async () => {
    if (!activeUniverse) return;
    const id = uuidv4();
    const position = { x: 200 + Math.random() * 400, y: 200 + Math.random() * 300 };
    const node: Node = {
      id, type: 'chronosNode', position,
      data: { label: 'New Event', description: '', event_type: 'standard', color: '#00d4ff', is_origin: false, is_terminal: false, timestamp_value: 0 } as NodeData,
    };
    setNodes((nds) => [...nds, node]);
    try {
      await api.events.create(activeUniverse.id, { id, label: 'New Event', description: '', event_type: 'standard', pos_x: position.x, pos_y: position.y, color: '#00d4ff' });
    } catch (e) { toast.error('Failed to create event'); }
  }, [activeUniverse?.id]);

  if (!activeUniverse) return (
    <div className="flex-1 flex items-center justify-center bg-chronos-bg">
      <div className="text-chronos-muted font-mono">Loading universe...</div>
    </div>
  );

  return (
    <>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChangeWithSync}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onNodeDoubleClick={onNodeDoubleClick}
        onDoubleClick={onCanvasDoubleClick}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        deleteKeyCode={null}
        className="bg-chronos-bg"
        defaultEdgeOptions={{ type: 'chronosEdge' }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={32}
          size={1}
          color="rgba(0,212,255,0.08)"
        />
        <Controls
          className="!bottom-16 !left-4"
          showZoom
          showFitView
          showInteractive
        />
        <MiniMap
          nodeColor={(n) => (n.data as NodeData).color || '#00d4ff'}
          maskColor="rgba(5,8,16,0.7)"
          className="!bottom-16 !right-4 !bg-chronos-surface !border-chronos-border"
        />
        <Panel position="bottom-center" className="mb-16">
          <div className="text-[11px] text-chronos-muted/50 font-mono">
            Double-click canvas to add event · Drag to connect · Delete key to remove
          </div>
        </Panel>
        <Panel position="top-right" className="mr-2 mt-2">
          <button
            onClick={addEvent}
            className="flex items-center gap-2 px-3 py-2 bg-chronos-accent/15 hover:bg-chronos-accent/25 border border-chronos-accent/30 rounded-lg text-chronos-accent text-xs font-mono transition-all"
          >
            <Plus size={12} /> Add Event
          </button>
        </Panel>
      </ReactFlow>

      {showEditModal && editingEvent && (
        <EventEditModal
          event={editingEvent}
          onSave={handleEventSaved}
          onClose={() => setShowEditModal(false)}
        />
      )}
    </>
  );
}

export function UniverseCanvas() {
  return (
    <ReactFlowProvider>
      <CanvasInner />
    </ReactFlowProvider>
  );
}
