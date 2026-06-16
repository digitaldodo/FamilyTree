// Application Constants

export const APP_NAME = 'FamilyTree';
export const APP_DESCRIPTION = 'Build, visualize, and share your family history';

// TODO: Define route constants
export const ROUTES = {
  HOME: '/',
  DASHBOARD: '/dashboard',
  TREE: '/tree',
  MEMBERS: '/members',
  ADMIN: '/admin',
  LOGIN: '/login',
  REGISTER: '/register',
} as const;

// TODO: Define API endpoint constants
export const API_ROUTES = {
  MEMBERS: '/api/members',
  TREES: '/api/trees',
  HEALTH: '/api/health',
} as const;

// TODO: Define pagination defaults
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
} as const;
