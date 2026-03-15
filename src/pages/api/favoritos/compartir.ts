import type { APIRoute } from "astro";

function generateShareId(length = 12) {
  const chars =
    "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
  let result = "";

  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return result;
}

function buildListSignature(productIds: number[]) {
  const normalized = [...new Set(productIds)].sort((a, b) => a - b);
  return normalized.join(",");
}

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const db = locals.runtime.env.DB as any;

    const body = await request.json();

    const rawIds: unknown[] = Array.isArray(body?.productIds)
      ? body.productIds
      : [];

    const productIds = rawIds
      .map((v: unknown) => Number(v))
      .filter((v: number) => Number.isInteger(v) && v > 0);

    if (productIds.length === 0) {
      return new Response(
        JSON.stringify({ ok: false, error: "Lista vacía" }),
        { status: 400 }
      );
    }

    const nombreLista =
      typeof body?.nombre_lista === "string" ? body.nombre_lista.trim() : null;

    const notas =
      typeof body?.notas === "string" ? body.notas.trim() : null;

    const uniqueIds = [...new Set(productIds)];

    const firmaLista = buildListSignature(uniqueIds);

    // buscar lista existente
    const existing = await db
      .prepare(
        `
        SELECT id_compartido
        FROM favoritos_compartidos
        WHERE firma_lista = ?
        AND activo = 1
        LIMIT 1
        `
      )
      .bind(firmaLista)
      .first();

    if (existing?.id_compartido) {
      return new Response(
        JSON.stringify({
          ok: true,
          reused: true,
          id: existing.id_compartido,
          url: `/favoritos/${existing.id_compartido}`,
        }),
        { status: 200 }
      );
    }

    // generar nuevo id
    let shareId = "";
    let exists = true;

    while (exists) {
      shareId = generateShareId();

      const check = await db
        .prepare(
          `SELECT id_compartido FROM favoritos_compartidos WHERE id_compartido = ?`
        )
        .bind(shareId)
        .first();

      exists = Boolean(check);
    }

    // crear lista
    await db
      .prepare(
        `
        INSERT INTO favoritos_compartidos (
          id_compartido,
          firma_lista,
          nombre_lista,
          notas,
          activo
        )
        VALUES (?, ?, ?, ?, 1)
        `
      )
      .bind(shareId, firmaLista, nombreLista, notas)
      .run();

    // insertar productos
    for (const id of uniqueIds) {
      await db
        .prepare(
          `
          INSERT INTO favoritos_compartidos_items
          (id_compartido, id_producto)
          VALUES (?, ?)
          `
        )
        .bind(shareId, id)
        .run();
    }

    return new Response(
      JSON.stringify({
        ok: true,
        reused: false,
        id: shareId,
        url: `/favoritos/${shareId}`,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error crear lista compartida:", error);

    return new Response(
      JSON.stringify({
        ok: false,
        error: "No se pudo generar la lista",
      }),
      { status: 500 }
    );
  }
};