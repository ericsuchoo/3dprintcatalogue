
import type { APIRoute } from "astro";

export const prerender = false;

type CharacterRow = {
  id_personaje: number;
  nombre_personaje: string;
  nombre_universo: string | null;
  img_personaje: string | null;
};

export const GET: APIRoute = async ({ request, locals }) => {
  const headers = {
    "Cache-Control": "no-store",
  };

  const url = new URL(request.url);

  const query = (url.searchParams.get("q") || "")
    .trim()
    .slice(0, 80);

  if (query.length < 2) {
    return new Response(
      JSON.stringify({ results: [] }),
      {
        status: 200,
        headers: {
          ...headers,
          "Content-Type": "application/json",
        },
      }
    );
  }

  const db = (locals as any).runtime?.env?.DB;

  if (!db) {
    return new Response(
      JSON.stringify({ error: "DB no disponible" }),
      { status: 503, headers }
    );
  }

  try {
    // Escapamos los comodines de LIKE.
    const pattern =
      "%" +
      query
        .replace(/\\/g, "\\\\")
        .replace(/%/g, "\\%")
        .replace(/_/g, "\\_") +
      "%";

    const result = await db
      .prepare(`
        SELECT
          p.id_personaje,
          p.nombre_personaje,
          u.nombre_universo,

          (
            SELECT pi.url
            FROM personajes_imagenes pi
            WHERE pi.id_personaje = p.id_personaje
            ORDER BY
              pi.es_principal DESC,
              pi.orden ASC
            LIMIT 1
          ) AS img_personaje

        FROM personajes p

        LEFT JOIN universos u
          ON u.id_universo = p.id_universo

        WHERE
          p.nombre_personaje LIKE ? ESCAPE '\\'
          OR u.nombre_universo LIKE ? ESCAPE '\\'

        ORDER BY
          p.nombre_personaje ASC,
          p.id_personaje ASC

        LIMIT 12
      `)
      .bind(pattern, pattern)
      .all();

    const rows = (result.results || []) as CharacterRow[];

    const results = rows.map((row) => ({
      id: String(row.id_personaje),
      name: row.nombre_personaje,
      universe: row.nombre_universo || "",
      image: row.img_personaje || "",
      href: `/shop?personajeId=${encodeURIComponent(
        String(row.id_personaje)
      )}`,
    }));

    return new Response(
      JSON.stringify({ results }),
      {
        status: 200,
        headers: {
          ...headers,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("[buscar-personajes]", error);

    return new Response(
      JSON.stringify({ error: "Error de búsqueda" }),
      { status: 500, headers }
    );
  }
};
