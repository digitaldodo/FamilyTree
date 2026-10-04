'use client';

import { useEffect, useRef } from 'react';
import { useReactFlow } from '@xyflow/react';

interface GlowStep {
  type: 'NODE' | 'EDGE';
  id: string; // member id or edge id
  color: string;
  reverse?: boolean; // if true, animate backwards along edge
}

export function GlobalGlowController() {
  const { getNodes, getEdges } = useReactFlow();
  const requestRef = useRef<number>(0);
  const stateRef = useRef({
    isActive: false,
    sequence: [] as GlowStep[],
    currentStepIndex: 0,
    progress: 0,
    pauseTime: 0,
    currentColor: '#d4af37',
  });

  const buildSequence = () => {
    const nodes = getNodes();
    const edges = getEdges();
    
    if (nodes.length === 0) return [];
    
    // Build adjacency list for BFS pathfinding
    const adj = new Map<string, { target: string, edgeId: string, reverse: boolean }[]>();
    const nodeMap = new Map<string, any>();
    
    nodes.forEach(n => {
      nodeMap.set(n.id, n);
      if (n.type === 'coupleContainer') {
        const members = n.data.members as any[];
        members.forEach(m => {
          nodeMap.set(m.id, n);
        });
      }
    });

    edges.forEach(e => {
      const u = e.source;
      const v = e.target;
      if (!adj.has(u)) adj.set(u, []);
      if (!adj.has(v)) adj.set(v, []);
      adj.get(u)!.push({ target: v, edgeId: e.id, reverse: false });
      adj.get(v)!.push({ target: u, edgeId: e.id, reverse: true });
    });

    const findShortestPath = (start: string, end: string): { nodes: string[], edges: { id: string, reverse: boolean }[] } | null => {
      if (start === end) return { nodes: [start], edges: [] };
      const queue = [[start]];
      const visited = new Set([start]);
      const edgePath = new Map<string, { id: string, reverse: boolean }[]>();
      edgePath.set(start, []);

      while (queue.length > 0) {
        const path = queue.shift()!;
        const node = path[path.length - 1];

        if (node === end) {
          return { nodes: path, edges: edgePath.get(node)! };
        }

        const neighbors = adj.get(node) || [];
        for (const neighbor of neighbors) {
          if (!visited.has(neighbor.target)) {
            visited.add(neighbor.target);
            const newPath = [...path, neighbor.target];
            queue.push(newPath);
            edgePath.set(neighbor.target, [...edgePath.get(node)!, { id: neighbor.edgeId, reverse: neighbor.reverse }]);
          }
        }
      }
      return null;
    };

    const membersByGen: Record<number, any[]> = {};
    const allMembers: any[] = [];
    
    nodes.forEach(n => {
      if (n.type === 'member') {
        allMembers.push(n.data.member);
      } else if (n.type === 'coupleContainer') {
        const members = n.data.members as any[];
        allMembers.push(...members);
      }
    });

    allMembers.forEach(m => {
      if (!m) return;
      const genNode = nodeMap.get(m.id);
      if (!genNode) return;
      const genIndex = Math.round(genNode.position.y / 450);
      if (!membersByGen[genIndex]) membersByGen[genIndex] = [];
      membersByGen[genIndex].push(m);
    });

    const genKeys = Object.keys(membersByGen).map(Number).sort((a, b) => a - b);
    const sequence: GlowStep[] = [];
    const visitedMembers = new Set<string>();

    const shuffleArray = (array: any[]) => {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
    };

    let currentLocation: string | null = null;
    let currentColor = '#d4af37';

    for (const gen of genKeys) {
      const genMembers = membersByGen[gen];
      shuffleArray(genMembers);

      for (const member of genMembers) {
        if (!member) continue;
        if (visitedMembers.has(member.id)) continue;
        
        const targetColor = '#d4af37';
        
        if (!currentLocation) {
          sequence.push({ type: 'NODE', id: member.id, color: targetColor });
          visitedMembers.add(member.id);
          currentLocation = member.id;
          currentColor = targetColor;
        } else {
          const pathInfo = findShortestPath(currentLocation, member.id);
          
          if (pathInfo) {
            for (let i = 0; i < pathInfo.edges.length; i++) {
              const edge = pathInfo.edges[i];
              const nextNodeId = pathInfo.nodes[i + 1];
              
              const isJunction = nextNodeId.startsWith('junction-');
              
              sequence.push({ type: 'EDGE', id: edge.id, color: targetColor, reverse: edge.reverse });
              
              if (!isJunction && nextNodeId !== member.id) {
                const mNode = nodeMap.get(nextNodeId);
                let passedColor = targetColor;
                if (mNode) {
                   const mData = mNode.type === 'member' ? mNode.data.member : (mNode.data.members as any[]).find((x: any) => x.id === nextNodeId);
                   
                }
                sequence.push({ type: 'NODE', id: nextNodeId, color: passedColor });
                visitedMembers.add(nextNodeId);
              }
            }
            
            sequence.push({ type: 'NODE', id: member.id, color: targetColor });
            visitedMembers.add(member.id);
            currentLocation = member.id;
            currentColor = targetColor;
          } else {
            sequence.push({ type: 'NODE', id: 'JUMP', color: 'transparent' });
            sequence.push({ type: 'NODE', id: member.id, color: targetColor });
            visitedMembers.add(member.id);
            currentLocation = member.id;
            currentColor = targetColor;
          }
        }
      }
    }
    
    return sequence;
  };

  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 212, g: 175, b: 55 };
  };
  
  const interpolateColor = (color1: string, color2: string, factor: number) => {
    const rgb1 = hexToRgb(color1);
    const rgb2 = hexToRgb(color2);
    const r = Math.round(rgb1.r + factor * (rgb2.r - rgb1.r));
    const g = Math.round(rgb1.g + factor * (rgb2.g - rgb1.g));
    const b = Math.round(rgb1.b + factor * (rgb2.b - rgb1.b));
    return `rgb(${r}, ${g}, ${b})`;
  };

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    let lastTime = performance.now();

    const animate = (time: number) => {
      const state = stateRef.current;
      const dt = time - lastTime;
      lastTime = time;

      if (!state.isActive) {
        const seq = buildSequence();
        if (seq.length > 0) {
          state.sequence = seq;
          state.currentStepIndex = 0;
          state.progress = 0;
          state.pauseTime = 0;
          state.isActive = true;
          state.currentColor = seq[0].color;
          
          document.querySelectorAll('.gold-flow-card-perimeter, .gold-flow-edge-path').forEach(el => {
            (el as SVGPathElement).style.opacity = '0';
          });
        }
      }

      if (state.isActive) {
        if (state.pauseTime > 0) {
          state.pauseTime -= dt;
          if (state.pauseTime <= 0) {
            state.isActive = false;
          }
        } else {
          const step = state.sequence[state.currentStepIndex];
          if (step) {
            if (step.id === 'JUMP') {
              document.querySelectorAll('.gold-flow-card-perimeter, .gold-flow-edge-path').forEach(el => {
                (el as SVGPathElement).style.opacity = '0';
                (el as SVGPathElement).style.transition = 'opacity 0.5s ease-out';
              });
              state.pauseTime = 1000;
              state.currentStepIndex++;
              state.progress = 0;
              requestRef.current = requestAnimationFrame(animate);
              return;
            }

            const duration = step.type === 'NODE' ? 3000 : 2000;
            state.progress += dt / duration;

            let el: SVGPathElement | null = null;
            if (step.type === 'NODE') {
              el = document.getElementById(`glow-rect-${step.id}`) as unknown as SVGPathElement;
            } else {
              el = document.getElementById(`glow-path-${step.id}`) as unknown as SVGPathElement;
            }

            if (el) {
              const currentAnimatedColor = interpolateColor(state.currentColor, step.color, Math.min(1, state.progress * 2));
              
              el.style.opacity = '1';
              el.style.stroke = currentAnimatedColor;
              
              let length = 864;
              if (step.type === 'EDGE') {
                try {
                  length = el.getTotalLength();
                } catch(e) {
                  length = 2000;
                }
              }
              
              const streakLength = step.type === 'NODE' ? 150 : 200;
              el.style.strokeDasharray = `${streakLength} ${length}`;
              
              let offset;
              if (step.reverse) {
                const start = -length;
                const end = streakLength;
                offset = start + state.progress * (end - start);
              } else {
                const start = streakLength;
                const end = -length;
                offset = start + state.progress * (end - start);
              }
              
              el.style.strokeDashoffset = `${offset}`;
              el.style.filter = `drop-shadow(0 0 8px ${currentAnimatedColor})`;
            }

            if (state.progress >= 1) {
              if (el) {
                el.style.opacity = '0';
                el.style.transition = 'opacity 0.8s ease-out';
              }
              
              state.currentColor = step.color;
              state.currentStepIndex++;
              state.progress = 0;
              
              if (state.currentStepIndex >= state.sequence.length) {
                state.pauseTime = 3000;
              }
            }
          } else {
            state.pauseTime = 3000;
          }
        }
      }

      requestRef.current = requestAnimationFrame(animate);
    };

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
