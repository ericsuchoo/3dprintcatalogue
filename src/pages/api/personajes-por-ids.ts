import type { APIRoute } from "astro";

export const prerender = false;

export const GET: APIRoute = async ({ request, locals }) => {
  const raw = new URL(request.url).searchParams.get("ids") || "";
  const ids = [...new Set(raw.split(",").filter((id) => /^[0-9]{1,12}$/.test(id)))].slice(0, 200);
  const headers = { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "private, no-store" };
  if (!ids.length) return new Response(JSON.stringify({ results: [] }), { headers });
  const db = (locals as any).runtime?.env?.DB;
  if (!db) return new Response(JSON.stringify({ error: "DB no disponible" }), { status: 503, headers });
  try {
    const placeholders = ids.map(() => "?").join(",");
    const query = `SELECT p.id_personaje, p.nombre_personaje, u.nombre_universo,
      (SELECT pi.url FROM personajes_imagenes pi WHERE pi.id_personaje = p.id_personaje
       ORDER BY pi.es_principal DESC, pi.orden ASC LIMIT 1) AS img_personaje
      FROM personajes p LEFT JOIN universos u ON u.id_universo = p.id_universo
      WHERE p.id_personaje IN (${placeholders})`;
    const rows = await db.prepare(query).bind(...ids).all();
    const results = (rows.results || []).map((row: any) => ({
      id: String(row.id_personaje), name: row.nombre_personaje,
      universe: row.nombre_universo || "", image: row.img_personaje || "",
      href: `/shop?personajeId=${encodeURIComponent(String(row.id_personaje))}`,
    }));
    return new Response(JSON.stringify({ results }), { headers });
  } catch (error) {
    console.error("[personajes-por-ids]", error);
    return new Response(JSON.stringify({ error: "Error consultando favoritos" }), { status: 500, headers });
  }
};
