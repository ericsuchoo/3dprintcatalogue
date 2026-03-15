import type { APIRoute } from "astro";

function generateShareId(length = 12) {
  const chars =
    "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
  let result = "";

  for (let i = 0; i < length; i += 1) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return result;
}

function buildListSignature(productIds: number[]) {
  const normalized = [...new Set(productIds)].sort((a, b) => a - b);
  return normalized.join(",");
}

export const POST: APIRoute = async ({ request, locals }) => {
  let createdShareId: string | null = null;

  try {
    const db = locals.runtime.env.DB as any;

    if (!db) {
      return new Response(
        JSON.stringify({ ok: false, error: "DB no disponible" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const body = await request.json();

    const productIdsRaw: unknown[] = Array.isArray(body?.productIds)
      ? body.productIds
      : [];

    const productIds = productIdsRaw
      .map((value: unknown) => Number(value))
      .filter((value: number) => Number.isInteger(value) && value > 0);

    if (productIds.length === 0) {
      return new Response(
        JSON.stringify({ ok: false, error: "No hay productos para compartir" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const nombreLista =
      typeof body?.nombre_lista === "string" && body.nombre_lista.trim()
        ? body.nombre_lista.trim()
        : null;

    const notas =
      typeof body?.notas === "string" && body.notas.trim()
        ? body.notas.trim()
        : null;

    const uniqueIds = [...new Set(productIds)];
    const firmaLista = buildListSignature(uniqueIds);

    // Reutilizar SOLO si la lista existente tiene exactamente el mismo número de items
    const existingShare = await db
      .prepare(
        `
        SELECT
          fc.id_compartido,
          COUNT(fci.id_producto) as total_items
        FROM favoritos_compartidos fc
        LEFT JOIN favoritos_compartidos_items fci
          ON fci.id_compartido = fc.id_compartido
        WHERE fc.firma_lista = ?
          AND fc.activo = 1
        GROUP BY fc.id_compartido
        HAVING COUNT(fci.id_producto) = ?
        ORDER BY fc.creado_en DESC
        LIMIT 1
      `
      )
      .bind(firmaLista, uniqueIds.length)
      .first();

    if (existingShare?.id_compartido) {
      return new Response(
        JSON.stringify({
          ok: true,
          reused: true,
          id: existingShare.id_compartido,
          url: `/favoritos/${existingShare.id_compartido}`,
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Crear nuevo id único
    let shareId = "";
    let exists = true;

    while (exists) {
      shareId = generateShareId(12);

      const existing = await db
        .prepare(
          `
          SELECT id_compartido
          FROM favoritos_compartidos
          WHERE id_compartido = ?
          LIMIT 1
        `
        )
        .bind(shareId)
        .first();

      exists = Boolean(existing?.id_compartido);
    }

    createdShareId = shareId;

    // Insertar cabecera
    await db
      .prepare(
        `
        INSERT INTO favoritos_compartidos (
          id_compartido,
          creado_en,
          nombre_lista,
          notas,
          firma_lista,
          activo
        )
        VALUES (?, CURRENT_TIMESTAMP, ?, ?, ?, 1)
      `
      )
      .bind(shareId, nombreLista, notas, firmaLista)
      .run();

    // Insertar items
    for (const productId of uniqueIds) {
      await db
        .prepare(
          `
          INSERT INTO favoritos_compartidos_items (id_compartido, id_producto)
          VALUES (?, ?)
        `
        )
        .bind(shareId, productId)
        .run();
    }

    return new Response(
      JSON.stringify({
        ok: true,
        reused: false,
        id: shareId,
        url: `/favoritos/${shareId}`,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("[api/favoritos/compartir] error", error);

    // Si alcanzó a crear cabecera pero falló en items, limpiamos el huérfano
    if (createdShareId) {
      try {
        const db = locals.runtime.env.DB as any;

        await db
          .prepare(
            `
            DELETE FROM favoritos_compartidos_items
            WHERE id_compartido = ?
          `
          )
          .bind(createdShareId)
          .run();

        await db
          .prepare(
            `
            DELETE FROM favoritos_compartidos
            WHERE id_compartido = ?
          `
          )
          .bind(createdShareId)
          .run();
      } catch (cleanupError) {
        console.error("[api/favoritos/compartir] cleanup error", cleanupError);
      }
    }

    return new Response(
      JSON.stringify({
        ok: false,
        error: "No se pudo generar la lista compartida",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};