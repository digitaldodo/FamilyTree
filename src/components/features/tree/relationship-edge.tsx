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
  data
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
      <BaseEdge
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          ...style,
          strokeWidth: isSpouse ? 3 : 2,
          strokeDasharray: isSpouse ? '5, 5' : 'none',
        }}
      />
    </>
  );
}

export const RelationshipEdgeMemo = memo(RelationshipEdge);
