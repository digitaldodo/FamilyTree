import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { MemberWithRelations } from '@/types/member';
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
  defaultGenerationForNewMember: number | null;
  setDefaultGenerationForNewMember: (gen: number | null) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  
  // Read-only mode for public viewing
  isReadOnly: boolean;
  setIsReadOnly: (readOnly: boolean) => void;
  
  // Multi-tree support
  activeTreeId: string | null;
  setActiveTreeId: (id: string | null) => void;
  userTrees: TreeSummary[];
  setUserTrees: (trees: TreeSummary[]) => void;
  userRole: TreePermission;
  setUserRole: (role: TreePermission) => void;
  
  // Shared global member state for optimistic UI across list and tree
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
  setDefaultGenerationForNewMember: (gen) => set({ defaultGenerationForNewMember: gen }),
  
  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query }),

  isReadOnly: false,
  setIsReadOnly: (readOnly) => set({ isReadOnly: readOnly }),

  // Multi-tree support
  activeTreeId: null,
  setActiveTreeId: (id) => set({ activeTreeId: id, members: [] }),
  userTrees: [],
  setUserTrees: (trees) => set({ userTrees: trees }),
  userRole: null,
  setUserRole: (role) => set({ userRole: role }),

  members: [],
  setMembers: (members) => set({ members }),
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
      partialize: (state) => ({ activeTreeId: state.activeTreeId }), // only persist activeTreeId
    }
  )
);
