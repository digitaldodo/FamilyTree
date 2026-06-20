import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { MemberWithRelations, Generation } from '@/types/member';
import { TreeSummary, TreePermission } from '@/types/tree';

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
  userTrees: TreeSummary[];
  setUserTrees: (trees: TreeSummary[]) => void;
  userRole: TreePermission;
  setUserRole: (role: TreePermission) => void;
  
  // Shared global member state for optimistic UI across list and tree
  generations: Generation[];
  setGenerations: (generations: Generation[]) => void;
  addGeneration: (generation: Generation) => void;
  updateGeneration: (id: string, generation: Generation) => void;
  deleteGeneration: (id: string) => void;
  
  members: MemberWithRelations[];
  setMembers: (members: MemberWithRelations[]) => void;
  addMember: (member: MemberWithRelations) => void;
  updateMember: (id: string, member: MemberWithRelations) => void;
  deleteMember: (id: string) => void;
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
  setActiveTreeId: (id) => set({ activeTreeId: id, members: [], generations: [] }),
  isInitializingTrees: true,
  setIsInitializingTrees: (isInit) => set({ isInitializingTrees: isInit }),
  userTrees: [],
  setUserTrees: (trees) => set({ userTrees: trees }),
  userRole: null,
  setUserRole: (role) => set({ userRole: role }),

  generations: [],
  setGenerations: (generations) => set((state) => {
    const safeGenerations = Array.isArray(generations) ? generations : [];
    // If all were selected previously (or it's empty initialization), select all new ones
    const isAllSelected = state.generations.length === 0 || state.selectedGenerationIds.length === state.generations.length;
    return {
      generations: safeGenerations,
      selectedGenerationIds: isAllSelected ? safeGenerations.map(g => g.id) : state.selectedGenerationIds.filter(id => safeGenerations.some(g => g.id === id))
    };
  }),
  addGeneration: (generation) => set((state) => {
    const isAllSelected = state.selectedGenerationIds.length === state.generations.length;
    return { 
      generations: [...state.generations, generation],
      selectedGenerationIds: isAllSelected ? [...state.selectedGenerationIds, generation.id] : state.selectedGenerationIds
    };
  }),
  updateGeneration: (id, updatedGeneration) => set((state) => ({
    generations: state.generations.map((g) => (g.id === id ? updatedGeneration : g))
  })),
  deleteGeneration: (id) => set((state) => ({
    generations: state.generations.filter((g) => g.id !== id),
    selectedGenerationIds: state.selectedGenerationIds.filter((genId) => genId !== id)
  })),

  members: [],
  setMembers: (members) => set({ members: Array.isArray(members) ? members : [] }),
  addMember: (member) => set((state) => ({ members: [...state.members, member] })),
  updateMember: (id, updatedMember) => set((state) => ({
    members: state.members.map((m) => (m.id === id ? updatedMember : m))
  })),
  deleteMember: (id) => set((state) => ({
    members: state.members.filter((m) => m.id !== id)
  })),
    }),
    {
      name: 'family-tree-storage',
      partialize: (state) => ({ activeTreeId: state.activeTreeId, sidebarOpen: state.sidebarOpen }),
    }
  )
);
