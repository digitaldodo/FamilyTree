'use client';

import { useEffect, useRef } from 'react';
import { useReactFlow, Node, Edge } from '@xyflow/react';

interface GlowStep {
  type: 'NODE' | 'EDGE';
  id: string; // member id or edge id
  color: string;
}

export function GlobalGlowController() {
  const { getNodes, getEdges } = useReactFlow();
  const requestRef = useRef<number>(0);
  const stateRef = useRef({
    isActive: false,
    sequence: [] as GlowStep[],
    currentStepIndex: 0,
    progress: 0, // 0 to 1
    pauseTime: 0,
  });

  // Build the cycle sequence based on current nodes
  const buildSequence = () => {
    const nodes = getNodes();
    const edges = getEdges();
    
    if (nodes.length === 0) return [];
    
    // Group members by generation
    const membersByGen: Record<number, any[]> = {};
    const memberNodes = nodes.filter(n => n.type === 'member' || n.type === 'coupleContainer');
    
    memberNodes.forEach(n => {
      // Find generation by looking at the node's Y position or generations array
      // React Flow nodes in this app are roughly sorted by Y (older = smaller Y)
      const genIndex = Math.round(n.position.y / 450); // LEVEL_HEIGHT is 450
      if (!membersByGen[genIndex]) membersByGen[genIndex] = [];
      membersByGen[genIndex].push(n);
    });

    const genKeys = Object.keys(membersByGen).map(Number).sort((a, b) => a - b);
    const sequence: GlowStep[] = [];
    const visited = new Set<string>();

    const shuffleArray = (array: any[]) => {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
    };

    // Construct the sequence
    for (const gen of genKeys) {
      const nodesInGen = membersByGen[gen];
      shuffleArray(nodesInGen);

      for (const node of nodesInGen) {
        // A node can be member or coupleContainer.
        const members = node.type === 'coupleContainer' ? node.data.members as any[] : [node.data.member];
        
        for (const member of members) {
          if (!member) continue;
          if (visited.has(member.id)) continue;
          visited.add(member.id);

          const color = member.frameColor || '#d4af37';

          // Animate member frame
          sequence.push({
            type: 'NODE',
            id: member.id,
            color
          });

          // Find outgoing edges (downwards). In React Flow, edges go from this node to a junction or child.
          // Wait, edges are from parent member id to junction, then junction to child.
          // Let's find edges from this member ID
          const outgoingToJunction = edges.filter(e => e.source === member.id && e.data?.type === 'PARENT');
          
          if (outgoingToJunction.length > 0) {
            // Pick a random edge to animate, or just one
            shuffleArray(outgoingToJunction);
            const edge = outgoingToJunction[0];
            sequence.push({
              type: 'EDGE',
              id: edge.id,
              color
            });
            
            // Now find edge from junction to a child
            const junctionId = edge.target;
            const junctionToChildren = edges.filter(e => e.source === junctionId && e.data?.type === 'PARENT');
            if (junctionToChildren.length > 0) {
              shuffleArray(junctionToChildren);
              const childEdge = junctionToChildren[0];
              sequence.push({
                type: 'EDGE',
                id: childEdge.id,
                color
              });
            }
          }
        }
      }
    }
    
    return sequence;
  };

  useEffect(() => {
    // Check prefers reduced motion
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    let lastTime = performance.now();

    const animate = (time: number) => {
      const state = stateRef.current;
      const dt = time - lastTime;
      lastTime = time;

      if (!state.isActive) {
        // Start new cycle
        const seq = buildSequence();
        if (seq.length > 0) {
          state.sequence = seq;
          state.currentStepIndex = 0;
          state.progress = 0;
          state.pauseTime = 0;
          state.isActive = true;
          
          // Clear all existing
          document.querySelectorAll('.gold-flow-card-perimeter, .gold-flow-edge-path').forEach(el => {
            (el as SVGPathElement).style.opacity = '0';
          });
        }
      }

      if (state.isActive) {
        if (state.pauseTime > 0) {
          state.pauseTime -= dt;
          if (state.pauseTime <= 0) {
            // Restart cycle
            state.isActive = false;
          }
        } else {
          const step = state.sequence[state.currentStepIndex];
          if (step) {
            // Speed: complete a node in 2s, an edge in 1s
            const duration = step.type === 'NODE' ? 2000 : 1000;
            state.progress += dt / duration;

            let el: SVGPathElement | null = null;
            if (step.type === 'NODE') {
              el = document.getElementById(`glow-rect-${step.id}`) as unknown as SVGPathElement;
            } else {
              el = document.getElementById(`glow-path-${step.id}`) as unknown as SVGPathElement;
            }

            if (el) {
              el.style.opacity = '1';
              el.style.stroke = step.color;
              
              // We need the total length to animate stroke-dashoffset
              let length = 864; // default for rect
              if (step.type === 'EDGE') {
                try {
                  length = el.getTotalLength();
                } catch(e) {
                  length = 2000;
                }
              }
              
              // We want a glowing streak. 
              // Dash array: streakLength, totalLength
              const streakLength = step.type === 'NODE' ? 100 : 100;
              el.style.strokeDasharray = `${streakLength} ${length}`;
              
              // Progress goes from 0 to 1
              // Offset goes from (length) to (-streakLength)
              const offset = length - (state.progress * (length + streakLength));
              el.style.strokeDashoffset = `${offset}`;
              el.style.filter = `drop-shadow(0 0 5px ${step.color})`;
            }

            if (state.progress >= 1) {
              // Fade out current element slowly
              if (el) {
                el.style.opacity = '0';
                el.style.transition = 'opacity 0.5s ease-out';
              }
              
              // Move to next step
              state.currentStepIndex++;
              state.progress = 0;
              
              if (state.currentStepIndex >= state.sequence.length) {
                // Cycle complete
                state.pauseTime = 2000; // 2 second pause before restart
              }
            }
          } else {
            // Invalid step, finish cycle
            state.pauseTime = 2000;
          }
        }
      }

      requestRef.current = requestAnimationFrame(animate);
    };

    // Delay start slightly to let the graph render
    setTimeout(() => {
      lastTime = performance.now();
      requestRef.current = requestAnimationFrame(animate);
    }, 1000);

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [getNodes, getEdges]);

  return null;
}
