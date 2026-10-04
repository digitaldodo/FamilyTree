import { create } from 'zustand';

export type GlowStepType = 'NODE' | 'EDGE';

export interface GlowStep {
  type: GlowStepType;
  id: string; // Node ID or Edge ID
  color: string;
}

interface GlowFlowState {
  isActive: boolean;
  cycleSteps: GlowStep[];
  currentStepIndex: number;
  progress: number;
  currentColor: string;
  startCycle: (steps: GlowStep[]) => void;
  stopCycle: () => void;
  updateProgress: (progress: number, color: string) => void;
  nextStep: () => void;
}

export const useGlowFlowStore = create<GlowFlowState>((set) => ({
  isActive: false,
  cycleSteps: [],
  currentStepIndex: 0,
  progress: 0,
  currentColor: '#d4af37',
  startCycle: (steps) => set({ isActive: true, cycleSteps: steps, currentStepIndex: 0, progress: 0 }),
  stopCycle: () => set({ isActive: false, cycleSteps: [], currentStepIndex: 0, progress: 0 }),
  updateProgress: (progress, color) => set({ progress, currentColor: color }),
  nextStep: () => set((state) => ({
    currentStepIndex: state.currentStepIndex + 1,
    progress: 0
  })),
}));
