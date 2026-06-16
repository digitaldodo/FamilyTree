import { create } from 'zustand';
import { MemberWithRelations } from '@/types/member';

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
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  
  // Shared global member state for optimistic UI across list and tree
  members: MemberWithRelations[];
  setMembers: (members: MemberWithRelations[]) => void;
  addMember: (member: MemberWithRelations) => void;
  updateMember: (id: string, member: MemberWithRelations) => void;
  deleteMember: (id: string) => void;
}

export const useAppStore = create<AppState>((set) => ({
  sidebarOpen: true,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  
  selectedMemberId: null,
  setSelectedMemberId: (id) => set({ selectedMemberId: id }),
  
  isMemberModalOpen: false,
  setIsMemberModalOpen: (open) => set({ isMemberModalOpen: open }),
  
  isEditingMember: false,
  setIsEditingMember: (isEditing) => set({ isEditingMember: isEditing }),
  
  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query }),

  members: [],
  setMembers: (members) => set({ members }),
  addMember: (member) => set((state) => ({ members: [...state.members, member] })),
  updateMember: (id, updatedMember) => set((state) => ({
    members: state.members.map((m) => (m.id === id ? updatedMember : m))
  })),
  deleteMember: (id) => set((state) => ({
    members: state.members.filter((m) => m.id !== id)
  })),
}));
