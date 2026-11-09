import type { APIRoute } from 'astro';
import { adminContext, json, safePage, verifyAdmin } from '../../../lib/os/auth';
import { isEntity, listEntity } from '../../../lib/os/catalogue';
export const prerender = false;
export const GET: APIRoute = async ({ request, locals, params }) => {
  const { env, db } = adminContext(locals);
  if (!await verifyAdmin(request, env ?? {})) return json({ error: 'No autorizado' }, 401);
  const entity = params.entity ?? '';
  if (!isEntity(entity)) return json({ error: 'Recurso no encontrado' }, 404);
  if (!db) return json({ error: 'D1 no disponible' }, 503);
  try { return json({ results: await listEntity(db, entity, safePage(new URL(request.url).searchParams.get('page'))) }); }
  catch (error) { console.error('[os/admin/entity]', error); return json({ error: 'Consulta no disponible' }, 503); }
};
export const POST: APIRoute = async () => json({ error: 'Escritura deshabilitada hasta verificar esquema y permisos por operación' }, 405);
export const PUT = POST;
export const DELETE = POST;
