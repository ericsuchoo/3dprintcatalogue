export const prerender = false;

export async function GET({ locals }: any) {
  const db = locals.runtime.env.DB;

  const { results } = await db
    .prepare("SELECT id_unive, nombre_universo, img_universo FROM universos ORDER BY id_unive DESC")
    .all();

  return new Response(JSON.stringify(results), {
    headers: { "content-type": "application/json" },
  });
}