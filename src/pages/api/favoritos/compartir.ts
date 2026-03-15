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

export const POST: APIRoute = async ({ request, locals }) => {
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

    const productIdsRaw: unknown[] = Array.isArray(body?.productIds) ? body.productIds : [];

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

    await db
      .prepare(
        `
        INSERT INTO favoritos_compartidos (id_compartido)
        VALUES (?)
      `
      )
      .bind(shareId)
      .run();

    const uniqueIds = [...new Set(productIds)];

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

    return new Response(
      JSON.stringify({ ok: false, error: "No se pudo generar la lista compartida" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};