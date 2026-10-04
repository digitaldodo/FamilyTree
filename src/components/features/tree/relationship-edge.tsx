'use client';

import { memo, useState } from 'react';
import {
  BaseEdge,
  EdgeProps,
  getSmoothStepPath,
  getBezierPath,
} from '@xyflow/react';

export function RelationshipEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  data,
  selected,
}: EdgeProps) {
  const [isHovered, setIsHovered] = useState(false);
  const isSpouse = data?.type === 'SPOUSE';
  const isActive = selected || isHovered;

  // Use Bezier for spouses (horizontal connection), SmoothStep for parents (vertical)
  const [edgePath] = isSpouse
    ? getBezierPath({
        sourceX,
        sourceY,
        sourcePosition,
        targetX,
        targetY,
        targetPosition,
      })
    : getSmoothStepPath({
        sourceX,
        sourceY,
        sourcePosition,
        targetX,
        targetY,
        targetPosition,
        borderRadius: 20,
      });

  const baseStroke = isSpouse
    ? 'var(--color-tree-spouse)'
    : 'var(--color-tree-connector)';
  const activeStroke = isSpouse
    ? 'var(--color-tree-spouse-active)'
    : 'var(--color-tree-connector-active)';
  const strokeColor = isActive ? activeStroke : (style.stroke || baseStroke);
  
  // Increase stroke width for better visibility at a glance
  const strokeWidth = isSpouse ? (isActive ? 4 : 3) : (isActive ? 3.5 : 2.5);

  return (
    <g
      className="react-flow__edge-relationship group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Invisible thicker interaction zone for easy hovering and clicking */}
      <path
        d={edgePath}
        fill="none"
        stroke="transparent"
        strokeWidth={24}
        className="cursor-pointer pointer-events-stroke"
      />

      {/* Subtle outer glow layer when active/selected */}
      {isActive && (
        <BaseEdge
          path={edgePath}
          style={{
            strokeWidth: isSpouse ? 7 : 6,
            stroke: 'var(--color-tree-glow)',
            strokeLinecap: 'round',
            transition: 'stroke-width 0.15s ease, stroke 0.15s ease',
          }}
        />
      )}

      {/* Main connector line */}
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          ...style,
          stroke: strokeColor,
          strokeWidth,
          strokeDasharray: isSpouse ? '6, 6' : 'none',
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
          transition: 'stroke 0.15s ease, stroke-width 0.15s ease',
        }}
      />

      {/* Gold Flow Animation Highlight (only for parent-child) */}
      {!isSpouse && (
        <path
          id={`glow-path-${id}`}
          d={edgePath}
          fill="none"
          stroke="var(--color-tree-gold, #d4af37)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="gold-flow-edge-path opacity-0 transition-opacity"
          style={{ strokeDasharray: '2000', strokeDashoffset: '2000' }}
        />
      )}
    </g>
  );
}

export const RelationshipEdgeMemo = memo(RelationshipEdge);
