
import type { APIRoute } from "astro";

export const prerender = false;

type EtiquetaRow = {
  id_etiqueta: number;
  nombre_etiqueta: string;
};

export const GET: APIRoute = async ({ request, locals }) => {
  const db = (locals as any).runtime?.env?.DB;

  if (!db) {
    return new Response(
      JSON.stringify({ error: "DB no disponible" }),
      { status: 503 }
    );
  }

  // Cloudflare edge cache for public catalogue metadata. On unsupported runtimes,
  // requests continue directly to D1 without changing the endpoint contract.
  type CloudflareCacheStorage = CacheStorage & { default: Cache };
  const cache =
    typeof caches !== "undefined"
      ? (caches as CloudflareCacheStorage).default
      : undefined;
  const cacheKey = new Request(request.url, { method: "GET" });
  if (cache) {
    try {
      const hit = await cache.match(cacheKey);
      if (hit) return hit;
    } catch (error) {
      console.warn("[catalogue metadata cache read]", error);
    }
  }

  try {
    const result = await db.prepare(`
      SELECT
        id_etiqueta,
        nombre_etiqueta
      FROM etiquetas
      ORDER BY nombre_etiqueta ASC, id_etiqueta ASC
    `).all();

    const etiquetas = (
      (result.results || []) as EtiquetaRow[]
    ).map((row) => ({
      id: String(row.id_etiqueta),
      name: row.nombre_etiqueta,
    }));

    const response = new Response(
      JSON.stringify({ results: etiquetas }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          "Cache-Control": "public, max-age=60, s-maxage=120",
        },
      }
    );
    if (cache) {
      try { await cache.put(cacheKey, response.clone()); }
      catch (error) { console.warn("[catalogue metadata cache write]", error); }
    }
    return response;
  } catch (error) {
    console.error("[shop/etiquetas]", error);

    return new Response(
      JSON.stringify({ error: "Error al cargar etiquetas" }),
      { status: 500 }
    );
  }
};
