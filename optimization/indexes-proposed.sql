-- PROPUESTA: NO EJECUTAR EN PRODUCCION SIN EXPLAIN QUERY PLAN Y RESPALDO.
-- Los indices no alteran asignaciones curatoriales ni filas de datos.
-- Comprobar primero PRAGMA index_list(...) para evitar indices duplicados.
-- Optimizacion de imagen principal en home, explorar y busqueda.
CREATE INDEX IF NOT EXISTS idx_personajes_imagenes_principal_orden
  ON personajes_imagenes (id_personaje, es_principal DESC, orden ASC);
-- Listados de personajes por nombre y universo.
CREATE INDEX IF NOT EXISTS idx_personajes_nombre_id
  ON personajes (nombre_personaje, id_personaje);
CREATE INDEX IF NOT EXISTS idx_personajes_universo_nombre
  ON personajes (id_universo, nombre_personaje, id_personaje);
-- Conteo de productos por personaje y filtros de tipo.
CREATE INDEX IF NOT EXISTS idx_productos_personaje_cosplay
  ON productos (id_personaje, tipo_cosplay);
-- Filtrado por origen.
CREATE INDEX IF NOT EXISTS idx_personajes_etiquetas_etiqueta_personaje
  ON personajes_etiquetas (id_etiqueta, id_personaje);
