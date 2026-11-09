/** Read-only administrative repository. All queries bounded and parameterized. */
export type D1DatabaseLike = { prepare(sql: string): { bind(...args: unknown[]): { all(): Promise<{ results?: unknown[] }> }; all(): Promise<{ results?: unknown[] }> } };
export const ENTITIES = {
  productos: { table: 'productos', id: 'id_producto', columns: 'id_producto,nombre_producto,subtitulo,id_personaje,id_universo' },
  personajes: { table: 'personajes', id: 'id_personaje', columns: 'id_personaje,nombre_personaje,id_universo' },
  ediciones: { table: 'ediciones', id: 'id_edicion', columns: 'id_edicion,nombre_edicion' },
} as const;
export type Entity = keyof typeof ENTITIES;
export function isEntity(value: string): value is Entity { return Object.prototype.hasOwnProperty.call(ENTITIES, value); }
export async function listEntity(db: D1DatabaseLike, entity: Entity, page: number) {
  const e = ENTITIES[entity];
  return (await db.prepare(`SELECT ${e.columns} FROM ${e.table} ORDER BY ${e.id} DESC LIMIT ? OFFSET ?`).bind(25, (page - 1) * 25).all()).results ?? [];
}
export async function dashboard(db: D1DatabaseLike) {
  const counts = await Promise.all((['productos', 'personajes', 'ediciones'] as const).map(async entity => {
    const result = await db.prepare(`SELECT COUNT(*) AS total FROM ${ENTITIES[entity].table}`).all();
    return [entity, (result.results?.[0] as { total?: number } | undefined)?.total ?? 0] as const;
  }));
  return Object.fromEntries(counts) as Record<Entity, number>;
}
