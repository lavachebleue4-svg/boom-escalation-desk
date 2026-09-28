import type { RoleName } from '../types';

export const ALL_ROLES: RoleName[] = ['Joy', 'Maya', 'Leo', 'Nina', 'External Partner', 'COO'];
export const SUPPORT_ROLES: RoleName[] = ['Joy', 'Maya'];
export const ENGINEERING_ROLES: RoleName[] = ['Leo', 'Nina'];

export const ROLE_TITLES: Record<RoleName, string> = {
  Joy: 'Support / Case Owner',
  Maya: 'Support Lead',
  Leo: 'Engineer',
  Nina: 'Integrations',
  'External Partner': 'Partner Queue',
  COO: 'Executive',
};
