
import type { APIRoute } from "astro";

export const prerender = false;

type CharacterRow = {
  id_personaje: number;
  nombre_personaje: string;
  nombre_universo: string | null;
  img_personaje: string | null;
};

const MAX_RESULTS = 12;

const responseHeaders = {
  "Content-Type": "application/json; charset=utf-8",
  "Cache-Control": "no-store",
};

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: responseHeaders,
  });
}

/*
 * Genera el límite superior exclusivo de un prefijo.
 *
 * Ejemplo:
 * "Wolv" -> "Wolw"
 *
 * Evita utilizar LIKE 'texto%' para la primera
 * fase, aprovechando el índice de nombre existente.
 */
function nextPrefix(value: string): string | null {
  const chars = Array.from(value);

  for (let i = chars.length - 1; i >= 0; i--) {
    const code = chars[i].codePointAt(0)!;

    if (code < 0x10ffff) {
      chars[i] = String.fromCodePoint(code + 1);
      return chars.slice(0, i + 1).join("");
    }
  }

  return null;
}

/*
 * Escapa los comodines de LIKE.
 * ESCAPE '\' utiliza una sola barra invertida
 * como carácter de escape en SQLite.
 */
function escapeLike(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/%/g, "\\%")
    .replace(/_/g, "\\_");
}

export const GET: APIRoute = async ({
  request,
  locals,
}) => {
  const url = new URL(request.url);

  const query = (url.searchParams.get("q") || "")
    .trim()
    .slice(0, 80);

  if (query.length < 2) {
    return jsonResponse({ results: [] });
  }

  const db = (locals as any).runtime?.env?.DB;

  if (!db) {
    return jsonResponse(
      { error: "DB no disponible" },
      503
    );
  }

  try {
    /*
     * FASE 1
     *
     * Búsqueda indexada por prefijo.
     *
     * Utilizamos el índice existente sobre
     * nombre_personaje con comparación BINARY.
     *
     * Como el índice probado utiliza orden
     * binario, esta fase distingue mayúsculas.
     *
     * Probamos primero el nombre tal como fue
     * escrito y después con inicial mayúscula.
     */

    const normalized =
      query.charAt(0).toUpperCase() +
      query.slice(1);

    const prefixVariants = Array.from(
      new Set([normalized, query])
    );

    const selected = new Map<number, CharacterRow>();

    const characterFields = `
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
    `;

    for (const prefix of prefixVariants) {
      if (selected.size >= MAX_RESULTS) break;

      const upper = nextPrefix(prefix);

      if (!upper) continue;

      const prefixSql = `
        SELECT
          ${characterFields}

        FROM personajes p

        LEFT JOIN universos u
          ON u.id_universo = p.id_universo

        WHERE
          p.nombre_personaje >= ?
          AND p.nombre_personaje < ?

        ORDER BY
          p.nombre_personaje ASC,
          p.id_personaje ASC

        LIMIT ?
      `;

      const prefixRes = await db
        .prepare(prefixSql)
        .bind(
          prefix,
          upper,
          MAX_RESULTS - selected.size
        )
        .all();

      const rows =
        (prefixRes.results || []) as CharacterRow[];

      for (const row of rows) {
        selected.set(
          Number(row.id_personaje),
          row
        );
      }
    }

    /*
     * FASE 2
     *
     * Si todavía faltan coincidencias,
     * buscamos dentro del nombre o universo.
     *
     * Esta fase conserva la funcionalidad
     * anterior del buscador.
     *
     * Puede requerir un recorrido mayor,
     * por lo que mediremos su costo en D1.
     */

    if (selected.size < MAX_RESULTS) {
      const pattern = `%${escapeLike(query)}%`;

      const partialSql = `
        SELECT
          ${characterFields}

        FROM personajes p

        LEFT JOIN universos u
          ON u.id_universo = p.id_universo

        WHERE
          p.nombre_personaje LIKE ? ESCAPE '\\'
          OR u.nombre_universo LIKE ? ESCAPE '\\'

        ORDER BY
          p.nombre_personaje ASC,
          p.id_personaje ASC

        LIMIT ?
      `;

      const partialRes = await db
        .prepare(partialSql)
        .bind(pattern, pattern, MAX_RESULTS)
        .all();

      const rows =
        (partialRes.results || []) as CharacterRow[];

      for (const row of rows) {
        if (selected.size >= MAX_RESULTS) break;

        const id = Number(row.id_personaje);

        if (!selected.has(id)) {
          selected.set(id, row);
        }
      }
    }

    /*
     * RESULTADOS
     *
     * Primero aparecen los resultados por
     * prefijo; después los complementarios.
     */

    const results = Array.from(selected.values())
      .slice(0, MAX_RESULTS)
      .map((row) => ({
        id: String(row.id_personaje),
        name: row.nombre_personaje,
        universe: row.nombre_universo || "",
        image: row.img_personaje || "",
        href:
          `/shop?personajeId=${encodeURIComponent(
            String(row.id_personaje)
          )}`,
      }));

    return jsonResponse({ results });
  } catch (error) {
    console.error("[buscar-personajes]", error);

    return jsonResponse(
      { error: "Error de búsqueda" },
      500
    );
  }
};
