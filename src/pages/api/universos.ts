export const prerender = false;

export async function GET({ locals }: any) {
  const db = locals.runtime.env.DB;

  const { results } = await db
    .prepare(`
      SELECT *
      FROM universos
      ORDER BY id_unive DESC
      LIMIT 200
    `)
    .all();

  const url = new URL(locals.request.url);
  const pretty = url.searchParams.get("pretty") === "1";

  return new Response(pretty ? JSON.stringify(results, null, 2) : JSON.stringify(results), {
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}