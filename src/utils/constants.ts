// Application Constants

/** Application metadata */
export const APP_NAME = 'Family Legacy';
export const APP_DESCRIPTION =
  'Build, visualize, and share your family history';
export const APP_VERSION = '0.1.0';

/** Route paths */
export const ROUTES = {
  HOME: '/',
  DASHBOARD: '/dashboard',
  TREE: '/tree',
  MEMBERS: '/members',
  SETTINGS: '/settings',
  PROFILE: '/profile',
  LOGIN: '/login',
  REGISTER: '/register',
} as const;

/** API endpoint paths */
export const API_ROUTES = {
  HEALTH: '/api/health',
  MEMBERS: '/api/members',
  TREES: '/api/trees',
  INVITES: '/api/invites',
  INVITE_ACCEPT: '/api/invites/accept',
} as const;

/** Pagination defaults */
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
} as const;

/** Gender labels for display */
export const GENDER_LABELS: Record<string, string> = {
  MALE: 'Male',
  FEMALE: 'Female',
  OTHER: 'Other',
};

/** Relationship type labels for display */
export const RELATIONSHIP_LABELS: Record<string, string> = {
  PARENT: 'Parent',
  SPOUSE: 'Spouse',
  SIBLING: 'Sibling',
};

/** Default avatar placeholder base URL */
export const AVATAR_PLACEHOLDER = 'https://api.dicebear.com/9.x/initials/svg';

/** Maximum number of members per tree */
export const MAX_MEMBERS_PER_TREE = 500;

/** Maximum number of trees per user */
export const MAX_TREES_PER_USER = 20;
