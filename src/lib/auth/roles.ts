import type { User } from '@supabase/supabase-js';
import type { RoleName } from '@/types/database';

const VALID_ROLES: readonly RoleName[] = [
  'super_admin',
  'hr_admin',
  'manager',
  'employee',
  'management_readonly',
];

/**
 * Role is read ONLY from `app_metadata`, which can be written solely with the
 * service-role key. `user_metadata` is editable by the signed-in user and must
 * never be trusted for authorisation. Unknown or missing roles get the least
 * privileged role.
 */
export function getRoleFromUser(user: Pick<User, 'app_metadata'> | null | undefined): RoleName {
  const role = user?.app_metadata?.hrms_role;
  return VALID_ROLES.includes(role as RoleName) ? (role as RoleName) : 'employee';
}

/** Routes that require specific roles; enforced server-side in proxy.ts. */
export const ROLE_PROTECTED_ROUTES: { prefix: string; roles: RoleName[] }[] = [
  { prefix: '/settings', roles: ['super_admin'] },
  { prefix: '/audit', roles: ['super_admin', 'hr_admin'] },
  { prefix: '/import', roles: ['super_admin', 'hr_admin'] },
];
