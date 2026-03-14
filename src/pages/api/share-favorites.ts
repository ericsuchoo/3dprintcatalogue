import type { APIRoute } from "astro";

function generateShareId(length = 12): string {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";

  for (let i = 0; i < length; i += 1) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return result;
}

async function shareIdExists(db: any, shareId: string): Promise<boolean> {
  const row = await db
    .prepare(`
      SELECT id_compartido
      FROM favoritos_compartidos
      WHERE id_compartido = ?
      LIMIT 1
    `)
    .bind(shareId)
    .first();

  return Boolean(row?.id_compartido);
}

async function generateUniqueShareId(db: any): Promise<string> {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const candidate = generateShareId(12);
    const exists = await shareIdExists(db, candidate);

    if (!exists) return candidate;
  }

  return `${generateShareId(8)}${Date.now().toString(36)}`;
}

export const POST: APIRoute = async ({ request, locals, site, url }) => {
  try {
    const db = locals.runtime.env.DB;

    if (!db) {
      return new Response(
        JSON.stringify({ error: "DB no disponible" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const body = await request.json().catch(() => null);
    const rawIds = Array.isArray(body?.productIds) ? body.productIds : [];

    const productIds = rawIds
      .map((id: unknown) => Number(id))
      .filter((id: number) => Number.isInteger(id) && id > 0);

    const uniqueProductIds = [...new Set(productIds)];

    if (!uniqueProductIds.length) {
      return new Response(
        JSON.stringify({ error: "No hay productos para compartir" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const shareId = await generateUniqueShareId(db);

    await db
      .prepare(`
        INSERT INTO favoritos_compartidos (
          id_compartido,
          nombre_lista
        )
        VALUES (?, ?)
      `)
      .bind(shareId, "Lista de favoritos")
      .run();

    const insertItemStmt = db.prepare(`
      INSERT INTO favoritos_compartidos_items (
        id_compartido,
        id_producto
      )
      VALUES (?, ?)
    `);

    for (const productId of uniqueProductIds) {
      await insertItemStmt.bind(shareId, productId).run();
    }

    const origin =
      site?.toString().replace(/\/$/, "") ||
      url.origin;

    const shareUrl = `${origin}/favoritos/${shareId}`;

    return new Response(
      JSON.stringify({
        ok: true,
        shareId,
        shareUrl,
        count: uniqueProductIds.length,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("[api/share-favorites] Error:", error);

    return new Response(
      JSON.stringify({ error: "No se pudo generar la lista compartida" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};