'use client';
import { memo } from 'react';
import { EdgeProps, getBezierPath, EdgeLabelRenderer, BaseEdge } from '@xyflow/react';

export const ChronosEdge = memo(({
  id, sourceX, sourceY, targetX, targetY,
  sourcePosition, targetPosition,
  data, selected,
}: EdgeProps) => {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX, sourceY, sourcePosition,
    targetX, targetY, targetPosition,
  });

  const strength = (data?.strength as number) ?? 1.0;
  const label = data?.label as string;
  const isAnimated = data?.animated as boolean;

  const opacity = 0.3 + strength * 0.6;
  const strokeWidth = 1 + strength * 1.5;
  const color = selected ? '#ffaa00' : data?.color as string || '#00d4ff';

  return (
    <>
      {/* Glow shadow edge */}
      <BaseEdge
        id={`${id}-glow`}
        path={edgePath}
        style={{
          stroke: color,
          strokeWidth: strokeWidth + 4,
          strokeOpacity: opacity * 0.15,
          filter: `blur(3px)`,
          pointerEvents: 'none',
        }}
      />
      {/* Main edge */}
      <BaseEdge
        id={id}
        path={edgePath}
        style={{
          stroke: color,
          strokeWidth,
          strokeOpacity: opacity,
          strokeDasharray: isAnimated ? '8 4' : undefined,
          animation: isAnimated ? 'dash 0.8s linear infinite' : undefined,
        }}
        markerEnd={`url(#arrow-${id})`}
      />
      {/* Arrow marker */}
      <defs>
        <marker
          id={`arrow-${id}`}
          markerWidth="6"
          markerHeight="6"
          refX="5"
          refY="3"
          orient="auto"
        >
          <path
            d="M 0 0 L 6 3 L 0 6 Z"
            fill={color}
            opacity={opacity}
          />
        </marker>
      </defs>

      {/* Label */}
      {label && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
              pointerEvents: 'all',
            }}
          >
            <div
              className="text-[10px] font-mono px-2 py-0.5 rounded"
              style={{
                background: 'rgba(5,8,16,0.9)',
                border: `1px solid ${color}44`,
                color: `${color}cc`,
                whiteSpace: 'nowrap',
              }}
            >
              {label}
            </div>
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
});

ChronosEdge.displayName = 'ChronosEdge';
