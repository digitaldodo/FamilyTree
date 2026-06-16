// Global App Store
// TODO: Implement with Zustand when added as dependency
// TODO: Manage sidebar collapse state, user preferences, etc.

// Placeholder store interface
export interface AppState {
  sidebarCollapsed: boolean;
  // TODO: Add more global state
}

// TODO: Replace with Zustand store
// export const useAppStore = create<AppState>((set) => ({ ... }));

// Temporary placeholder
export const useAppStore = () => ({
  sidebarCollapsed: false,
  toggleSidebar: () => {},
});
