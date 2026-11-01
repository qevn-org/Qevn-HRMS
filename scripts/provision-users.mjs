// Usage: node --env-file=.env.local scripts/provision-users.mjs
// Assigns HRMS roles (app_metadata.hrms_role, server-controlled) and rotates every
// user's password to a fresh random value written to a 0600, git-ignored file.
import { createClient } from '@supabase/supabase-js';
import { randomBytes } from 'node:crypto';
import { writeFileSync, chmodSync } from 'node:fs';

const ADMINS = new Set(['dhruv@qevn.in', 'naman@qevn.in', 'arbaaz@qevn.in']);
const OUT = 'hrms.credentials.local.txt';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) throw new Error('Missing Supabase env');
const sb = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });

const { data, error } = await sb.auth.admin.listUsers({ perPage: 200 });
if (error) throw error;

const lines = [`# QEVN HRMS credentials — generated ${new Date().toISOString()}`, '# Store in a password manager, then DELETE this file.', ''];
for (const u of data.users) {
  const email = (u.email || '').toLowerCase();
  const role = ADMINS.has(email) ? 'super_admin' : 'employee';
  const password = randomBytes(18).toString('base64url');
  const user_metadata = { ...u.user_metadata };
  if (!ADMINS.has(email) && user_metadata.role === 'admin') user_metadata.role = 'employee';
  const { error: e } = await sb.auth.admin.updateUserById(u.id, {
    password,
    app_metadata: { ...u.app_metadata, hrms_role: role },
    user_metadata,
  });
  if (e) { console.error('FAILED', email, e.message); continue; }
  if (!ADMINS.has(email)) {
    await sb.from('profiles').update({ role: 'employee' }).eq('id', u.id).eq('role', 'admin');
  }
  lines.push(`${email}\t${role}\t${password}`);
  console.log('updated', email, role);
}
writeFileSync(OUT, lines.join('\n') + '\n', { mode: 0o600 });
chmodSync(OUT, 0o600);
console.log(`\nCredentials written to ${OUT}`);
