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
    const { results } = await db.prepare(`
      SELECT id_universo, nombre_universo, img_universo
      FROM universos
      ORDER BY id_universo DESC
      LIMIT 200
    `).all();
    const pretty = new URL(request.url).searchParams.get("pretty") === "1";
    const response = new Response(JSON.stringify(results ?? [], null, pretty ? 2 : 0), {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "public, max-age=60, s-maxage=120",
      },
    });
    if (cache) {
      try { await cache.put(cacheKey, response.clone()); }
      catch (error) { console.warn("[catalogue metadata cache write]", error); }
    }
    return response;
  } catch (error) {
    console.error("[api/universos]", error);
    return new Response(JSON.stringify({ error: "Error al consultar universos" }), {
      status: 500,
      headers: { "Content-Type": "application/json; charset=utf-8" },
    });
  }
};
