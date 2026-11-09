import type { APIRoute } from "astro";

export const prerender = false;

export const GET: APIRoute = async ({ request, locals }) => {
  const db = (locals as any).runtime?.env?.DB;
  if (!db) {
    return new Response(JSON.stringify({ error: "DB no disponible" }), {
      status: 503,
      headers: { "Content-Type": "application/json; charset=utf-8" },
    });
  }

  try {
    const { results } = await db.prepare(`
      SELECT id_universo, nombre_universo, img_universo
      FROM universos
      ORDER BY id_universo DESC
      LIMIT 200
    `).all();
    const pretty = new URL(request.url).searchParams.get("pretty") === "1";
    return new Response(JSON.stringify(results ?? [], null, pretty ? 2 : 0), {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "public, max-age=300",
      },
    });
  } catch (error) {
    console.error("[api/universos]", error);
    return new Response(JSON.stringify({ error: "Error al consultar universos" }), {
      status: 500,
      headers: { "Content-Type": "application/json; charset=utf-8" },
    });
  }
};
