
import type { APIRoute } from "astro";

export const prerender = false;

type CharacterRow = {
  id_personaje: number | string;
  nombre_personaje: string;
  id_universo: number | string | null;
  nombre_universo: string | null;
};

type TagRow = {
  id_personaje: number | string;
  nombre_etiqueta: string;
};

const PAGE_SIZE = 24;
const SEARCH_LIMIT = 12;
const MAX_QUERY_LENGTH = 80;

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

function escapeLike(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/%/g, "\\%")
    .replace(/_/g, "\\_");
}

function parsePage(value: string | null): number {
  const number = Number(value ?? "1");

  return Number.isSafeInteger(number) && number > 0
    ? Math.min(number, 10000)
    : 1;
}

export const GET: APIRoute = async ({ request, locals }) => {
  const db = (locals as any).runtime?.env?.DB;

  if (!db) {
    return json({ error: "DB no disponible" }, 503);
  }

  const url = new URL(request.url);

  const mode = url.searchParams.get("mode") || "search";

  const query = (url.searchParams.get("q") || "")
    .trim()
    .slice(0, MAX_QUERY_LENGTH);

  const page = parsePage(url.searchParams.get("page"));

  try {
    /*
     * MODO LIST
     *
     * Navegación paginada del filtro lateral.
     * No recupera todos los personajes.
     */
    if (mode === "list") {
      const offset = (page - 1) * PAGE_SIZE;

      const result = await db
        .prepare(`
          SELECT
            p.id_personaje,
            p.nombre_personaje,
            p.id_universo,
            u.nombre_universo

          FROM personajes p

          LEFT JOIN universos u
            ON u.id_universo = p.id_universo

          ORDER BY
            p.nombre_personaje ASC,
            p.id_personaje ASC

          LIMIT ? OFFSET ?
        `)
        .bind(PAGE_SIZE + 1, offset)
        .all();

      const rows = (result.results || []) as CharacterRow[];

      const hasMore = rows.length > PAGE_SIZE;

      return json({
        results: rows.slice(0, PAGE_SIZE).map((row) => ({
          id: String(row.id_personaje),
          title: row.nombre_personaje,
          universe: row.nombre_universo || "",
          href: `/shop?personajeId=${encodeURIComponent(
            String(row.id_personaje)
          )}`,
          tags: [],
          matchType: "general",
        })),
        page,
        hasMore,
      });
    }

    /*
     * MODO SEARCH
     *
     * Buscar por nombre, universo o etiqueta.
     * Se ejecuta solamente cuando el usuario
     * escribe al menos dos caracteres.
     */
    if (mode !== "search") {
      return json({ error: "Modo no válido" }, 400);
    }

    if (query.length < 2) {
      return json({
        results: [],
        page: 1,
        hasMore: false,
      });
    }

    const pattern = `%${escapeLike(query)}%`;

    /*
     * EXISTS evita multiplicar personajes
     * cuando tienen varias etiquetas.
     *
     * La búsqueda parcial puede requerir
     * recorrer registros. Se medirá en D1.
     */
    const result = await db
      .prepare(`
        SELECT
          p.id_personaje,
          p.nombre_personaje,
          p.id_universo,
          u.nombre_universo

        FROM personajes p

        LEFT JOIN universos u
          ON u.id_universo = p.id_universo

        WHERE
          p.nombre_personaje LIKE ? ESCAPE '\\'

          OR u.nombre_universo LIKE ? ESCAPE '\\'

          OR EXISTS (
            SELECT 1
            FROM personajes_etiquetas pe
            INNER JOIN etiquetas e
              ON e.id_etiqueta = pe.id_etiqueta
            WHERE pe.id_personaje = p.id_personaje
              AND e.nombre_etiqueta LIKE ? ESCAPE '\\'
          )

        ORDER BY
          CASE
            WHEN p.nombre_personaje LIKE ? ESCAPE '\\'
              THEN 0
            WHEN u.nombre_universo LIKE ? ESCAPE '\\'
              THEN 1
            ELSE 2
          END ASC,
          p.nombre_personaje ASC,
          p.id_personaje ASC

        LIMIT ?
      `)
      .bind(
        pattern,
        pattern,
        pattern,
        pattern,
        pattern,
        SEARCH_LIMIT
      )
      .all();

    const rows = (result.results || []) as CharacterRow[];

    /*
     * Recuperamos etiquetas solo de los
     * personajes encontrados, no de todos.
     */
    const ids = rows.map((row) => Number(row.id_personaje));

    const tagsByCharacter = new Map<string, string[]>();

    if (ids.length > 0) {
      const placeholders = ids.map(() => "?").join(",");

      const tagsResult = await db
        .prepare(`
          SELECT
            pe.id_personaje,
            e.nombre_etiqueta

          FROM personajes_etiquetas pe

          INNER JOIN etiquetas e
            ON e.id_etiqueta = pe.id_etiqueta

          WHERE pe.id_personaje IN (${placeholders})

          ORDER BY
            pe.id_personaje ASC,
            e.nombre_etiqueta ASC
        `)
        .bind(...ids)
        .all();

      const tagRows = (tagsResult.results || []) as TagRow[];

      for (const row of tagRows) {
        const id = String(row.id_personaje);
        const tags = tagsByCharacter.get(id) || [];

        tags.push(row.nombre_etiqueta);
        tagsByCharacter.set(id, tags);
      }
    }

    const normalizedQuery = query
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();

    const normalize = (value: string) =>
      value
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();

    const results = rows.map((row) => {
      const id = String(row.id_personaje);

      const tags = tagsByCharacter.get(id) || [];

      const nameMatch = normalize(
        row.nombre_personaje
      ).includes(normalizedQuery);

      const universeMatch = normalize(
        row.nombre_universo || ""
      ).includes(normalizedQuery);

      const tagMatch = tags.some((tag) =>
        normalize(tag).includes(normalizedQuery)
      );

      const matchType = nameMatch
        ? "personaje"
        : universeMatch
          ? "universo"
          : tagMatch
            ? "etiqueta"
            : "general";

      return {
        id,
        title: row.nombre_personaje,
        universe: row.nombre_universo || "",
        href: `/shop?personajeId=${encodeURIComponent(id)}`,
        tags,
        matchType,
      };
    });

    const priority: Record<string, number> = {
      personaje: 0,
      universo: 1,
      etiqueta: 2,
      general: 3,
    };

    results.sort(
      (a, b) =>
        priority[a.matchType] - priority[b.matchType] ||
        a.title.localeCompare(b.title)
    );

    return json({
      results,
      page: 1,
      hasMore: false,
    });
  } catch (error) {
    console.error("[shop/personajes]", error);

    return json(
      { error: "Error al consultar personajes" },
      500
    );
  }
};
