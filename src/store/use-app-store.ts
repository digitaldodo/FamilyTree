import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ChangeEvent } from '@/domain/collaboration/change-events';

interface AppState {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  selectedMemberId: string | null;
  setSelectedMemberId: (id: string | null) => void;
  isMemberModalOpen: boolean;
  setIsMemberModalOpen: (open: boolean) => void;
  isEditingMember: boolean;
  setIsEditingMember: (isEditing: boolean) => void;
  defaultGenerationForNewMember: string | null;
  setDefaultGenerationForNewMember: (genId: string | null) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedGenerationIds: string[];
  setSelectedGenerationIds: (ids: string[]) => void;
  
  // Read-only mode for public viewing
  isReadOnly: boolean;
  setIsReadOnly: (readOnly: boolean) => void;
  
  // Multi-tree support
  activeTreeId: string | null;
  setActiveTreeId: (id: string | null) => void;
  isInitializingTrees: boolean;
  setIsInitializingTrees: (isInit: boolean) => void;
  selectedTreeVersionId: string | null;
  setSelectedTreeVersionId: (id: string | null) => void;

  // Collaboration
  pendingChanges: ChangeEvent[];
  addChangeEvent: (event: ChangeEvent) => void;
  clearPendingChanges: () => void;
  hasConflict: boolean;
  setHasConflict: (conflict: boolean) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      sidebarOpen: true,
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  
  selectedMemberId: null,
  setSelectedMemberId: (id) => set({ selectedMemberId: id }),
  
  isMemberModalOpen: false,
  setIsMemberModalOpen: (open) => set({ isMemberModalOpen: open }),
  
  isEditingMember: false,
  setIsEditingMember: (isEditing) => set({ isEditingMember: isEditing }),
  
  defaultGenerationForNewMember: null,
  setDefaultGenerationForNewMember: (genId) => set({ defaultGenerationForNewMember: genId }),
  
  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query }),
  selectedGenerationIds: [],
  setSelectedGenerationIds: (ids) => set({ selectedGenerationIds: Array.isArray(ids) ? ids : [] }),

  isReadOnly: false,
  setIsReadOnly: (readOnly) => set({ isReadOnly: readOnly }),

  // Multi-tree support
  activeTreeId: null,
  setActiveTreeId: (id) => set((state) => state.activeTreeId === id ? state : { activeTreeId: id }),
  isInitializingTrees: true,
  setIsInitializingTrees: (isInit) => set((state) => state.isInitializingTrees === isInit ? state : { isInitializingTrees: isInit }),
  selectedTreeVersionId: null,
  setSelectedTreeVersionId: (id) => set({ selectedTreeVersionId: id }),

  // Collaboration
  pendingChanges: [],
  addChangeEvent: (event) => set((state) => ({ pendingChanges: [...state.pendingChanges, event] })),
  clearPendingChanges: () => set({ pendingChanges: [] }),
  hasConflict: false,
  setHasConflict: (conflict) => set({ hasConflict: conflict }),
    }),
    {
      name: 'family-tree-storage',
      partialize: (state) => ({ activeTreeId: state.activeTreeId, sidebarOpen: state.sidebarOpen }),
    }
  )
);
