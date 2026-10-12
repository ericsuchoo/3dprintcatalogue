
import type { APIRoute } from "astro";

export const prerender = false;

type EtiquetaRow = {
  id_etiqueta: number;
  nombre_etiqueta: string;
};

export const GET: APIRoute = async ({ locals }) => {
  const db = (locals as any).runtime?.env?.DB;

  if (!db) {
    return new Response(
      JSON.stringify({ error: "DB no disponible" }),
      { status: 503 }
    );
  }

  try {
    const result = await db.prepare(`
      SELECT
        id_etiqueta,
        nombre_etiqueta
      FROM etiquetas
      ORDER BY nombre_etiqueta ASC, id_etiqueta ASC
    `).all();

    const etiquetas = (
      (result.results || []) as EtiquetaRow[]
    ).map((row) => ({
      id: String(row.id_etiqueta),
      name: row.nombre_etiqueta,
    }));

    return new Response(
      JSON.stringify({ results: etiquetas }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          "Cache-Control": "public, max-age=300",
        },
      }
    );
  } catch (error) {
    console.error("[shop/etiquetas]", error);

    return new Response(
      JSON.stringify({ error: "Error al cargar etiquetas" }),
      { status: 500 }
    );
  }
};
