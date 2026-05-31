'use client';
import { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { NodeData } from '@/types';
import { useChronosStore } from '@/store';

const EVENT_TYPE_ICONS: Record<string, string> = {
  origin: '◈',
  terminal: '◉',
  decision: '◆',
  paradox: '⚠',
  standard: '●',
};

export const ChronosNode = memo(({ data, selected, id }: NodeProps) => {
  const nodeData = data as NodeData;
  const { highlightedNodes, collapsingNodes } = useChronosStore();
  const isHighlighted = highlightedNodes.has(id);
  const isCollapsing = collapsingNodes.has(id);

  const baseColor = nodeData.color || '#00d4ff';
  const isParadox = nodeData.is_paradox_node;

  const borderColor = isParadox
    ? '#cc44ff'
    : isHighlighted
    ? '#ffaa00'
    : selected
    ? '#00d4ff'
    : `${baseColor}55`;

  const glowColor = isParadox
    ? 'rgba(204,68,255,0.4)'
    : isHighlighted
    ? 'rgba(255,170,0,0.4)'
    : selected
    ? 'rgba(0,212,255,0.4)'
    : `${baseColor}33`;

  return (
    <div
      className={`chronos-node relative ${isCollapsing ? 'collapsing' : ''}`}
      style={{
        minWidth: 160,
        maxWidth: 220,
        background: `linear-gradient(135deg, rgba(10,15,30,0.95) 0%, rgba(10,15,30,0.85) 100%)`,
        border: `1.5px solid ${borderColor}`,
        borderRadius: 10,
        boxShadow: `0 0 12px ${glowColor}, inset 0 0 30px ${glowColor}20`,
        padding: '10px 14px',
        transition: 'all 0.2s ease',
      }}
    >
      {/* Active pulse ring */}
      {nodeData.is_active && (
        <div
          className="absolute inset-0 rounded-[10px] ping-ring pointer-events-none"
          style={{ border: `2px solid ${baseColor}`, opacity: 0.6 }}
        />
      )}

      {/* Top accent line */}
      <div
        className="absolute top-0 left-4 right-4 h-[2px] rounded-full"
        style={{ background: `linear-gradient(90deg, transparent, ${baseColor}, transparent)` }}
      />

      {/* Header */}
      <div className="flex items-center gap-2 mb-1">
        <span
          className="text-[10px] font-bold"
          style={{ color: baseColor }}
        >
          {EVENT_TYPE_ICONS[nodeData.event_type] || '●'}
        </span>
        <span
          className="text-[10px] uppercase tracking-widest font-mono"
          style={{ color: `${baseColor}88` }}
        >
          {nodeData.event_type}
        </span>
        {isParadox && (
          <span className="ml-auto text-[9px] font-mono text-purple-400 bg-purple-500/10 border border-purple-500/20 px-1.5 rounded">
            PARADOX
          </span>
        )}
      </div>

      {/* Label */}
      <div
        className="font-semibold text-[13px] leading-tight mb-1"
        style={{
          color: isHighlighted ? '#ffaa00' : 'rgba(255,255,255,0.95)',
          textShadow: `0 0 8px ${baseColor}55`,
        }}
      >
        {nodeData.label}
      </div>

      {/* Description */}
      {nodeData.description && (
        <div className="text-[11px] text-[#4a6080] leading-tight truncate">
          {nodeData.description}
        </div>
      )}

      {/* Badges */}
      <div className="flex items-center gap-1.5 mt-2">
        {nodeData.is_origin && (
          <span className="text-[9px] font-mono text-green-400 bg-green-500/10 border border-green-500/20 px-1.5 py-0.5 rounded">
            ORIGIN
          </span>
        )}
        {nodeData.is_terminal && (
          <span className="text-[9px] font-mono text-red-400 bg-red-500/10 border border-red-500/20 px-1.5 py-0.5 rounded">
            TERMINAL
          </span>
        )}
        {nodeData.influence_score !== undefined && (
          <span className="ml-auto text-[9px] font-mono text-[#4a6080]">
            ⬡ {nodeData.influence_score.toFixed(1)}
          </span>
        )}
      </div>

      {/* Handles */}
      <Handle
        type="target"
        position={Position.Left}
        className="!w-2.5 !h-2.5 !rounded-full !border-2"
        style={{
          background: '#050810',
          borderColor: baseColor,
          left: -6,
        }}
      />
      <Handle
        type="source"
        position={Position.Right}
        className="!w-2.5 !h-2.5 !rounded-full !border-2"
        style={{
          background: '#050810',
          borderColor: baseColor,
          right: -6,
        }}
      />
    </div>
  );
});

ChronosNode.displayName = 'ChronosNode';
