'use client';

import { useId } from 'react';
import { motion } from 'framer-motion';
import { EdgeProps, getSmoothStepPath } from 'reactflow';

export function AnimatedEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
}: EdgeProps) {
  const gradientId = useId();
  const [edgePath] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  return (
    <>
      <path
        id={id}
        d={edgePath}
        strokeWidth={2}
        stroke="gray"
        strokeOpacity={0.2}
        fill="none"
        strokeLinecap="round"
      />
      <path
        d={edgePath}
        strokeWidth={2}
        stroke={`url(#${gradientId})`}
        strokeOpacity={1}
        fill="none"
        strokeLinecap="round"
      />
      <defs>
        <motion.linearGradient
          id={gradientId}
          gradientUnits="objectBoundingBox"
          initial={{ x1: 0, x2: 0, y1: 0, y2: 0 }}
          animate={{ x1: [0.1, 1.1], x2: [0, 1], y1: [0, 0], y2: [0, 0] }}
          transition={{ duration: 2, ease: [0.16, 1, 0.3, 1], repeat: Infinity, repeatDelay: 0 }}
        >
          <stop stopColor="#ffaa40" stopOpacity="0" />
          <stop stopColor="#ffaa40" />
          <stop offset="32.5%" stopColor="#9c40ff" />
          <stop offset="100%" stopColor="#9c40ff" stopOpacity="0" />
        </motion.linearGradient>
      </defs>
    </>
  );
}
