import type { APIRoute } from 'astro';
import { adminContext, json, verifyAdmin } from '../../../lib/os/auth';
import { dashboard } from '../../../lib/os/catalogue';
export const prerender = false;
export const GET: APIRoute = async ({ request, locals }) => {
  const { env, db } = adminContext(locals);
  if (!await verifyAdmin(request, env ?? {})) return json({ error: 'No autorizado' }, 401);
  if (!db) return json({ error: 'D1 no disponible' }, 503);
  try { return json({ counts: await dashboard(db) }); }
  catch (error) { console.error('[os/admin/dashboard]', error); return json({ error: 'Métricas no disponibles' }, 503); }
};
