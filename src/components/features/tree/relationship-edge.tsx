import { memo } from 'react';
import { BaseEdge, EdgeProps, getSmoothStepPath, getBezierPath } from '@xyflow/react';

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
  selected
}: EdgeProps) {
  const isSpouse = data?.type === 'SPOUSE';

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
        borderRadius: 24, // Apple-like rounded corners for lines
      });

  return (
    <>
      {/* Background invisible thicker edge for easier hovering */}
      <BaseEdge
        path={edgePath}
        style={{
          strokeWidth: 20,
          stroke: 'transparent',
          cursor: 'pointer'
        }}
      />
      {/* Glow layer when selected or hovered */}
      {selected && (
        <BaseEdge
          path={edgePath}
          style={{
            strokeWidth: isSpouse ? 6 : 5,
            stroke: isSpouse ? 'rgba(244, 63, 94, 0.4)' : 'rgba(168, 85, 247, 0.4)', // Rose glow for spouse, Purple glow for parent
            strokeLinecap: 'round',
            transition: 'stroke-width 0.2s, stroke 0.2s'
          }}
        />
      )}
      {/* Main edge layer */}
      <BaseEdge
        path={edgePath}
        markerEnd={markerEnd}
        className={selected ? 'react-flow__edge-path-selected' : ''}
        style={{
          ...style,
          strokeWidth: isSpouse ? (selected ? 4 : 3) : (selected ? 3 : 2),
          strokeDasharray: isSpouse ? '6, 6' : 'none',
          stroke: isSpouse ? (selected ? '#e11d48' : '#f43f5e') : (selected ? '#9333ea' : '#a855f7'),
          strokeLinecap: 'round',
          transition: 'all 0.3s ease',
          animation: isSpouse ? 'dashdraw 30s linear infinite' : 'none',
        }}
      />
      {/* We need global css for the dashdraw animation if we want it moving, but this is fine for now */}
    </>
  );
}

export const RelationshipEdgeMemo = memo(RelationshipEdge);
