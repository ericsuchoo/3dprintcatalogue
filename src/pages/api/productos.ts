export const prerender = false;

export async function GET({ locals }: any) {
  try {
    const db = locals?.runtime?.env?.DB;

    if (!db) {
      return new Response(
        JSON.stringify({
          ok: false,
          error: "Missing D1 binding: env.DB is undefined",
          hint: "Configura el binding DB en el entorno Preview (Settings > Functions > D1 databases).",
        }),
        { status: 500, headers: { "content-type": "application/json" } }
      );
    }

    const { results } = await db
      .prepare(`
        SELECT
          id_producto,
          nombre_producto,
          subtitulo,
          descripcion,
          img_producto,
          unidades,
          precio,
          descuento,
          id_proveedor,
          id_universo,
          id_personaje,
          fecha_creacion,
          fecha_modifica
        FROM productos
        ORDER BY id_producto DESC
        LIMIT 50
      `)
      .all();

    return new Response(JSON.stringify(results), {
      headers: { "content-type": "application/json" },
    });
  } catch (err: any) {
    return new Response(
      JSON.stringify({
        ok: false,
        error: String(err?.message ?? err),
        stack: err?.stack ?? null,
      }),
      { status: 500, headers: { "content-type": "application/json" } }
    );
  }
}