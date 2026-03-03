export const prerender = false;

export async function GET({ locals }: any) {
  const db = locals.runtime.env.DB;

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
}