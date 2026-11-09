# Optimización D1 — revisión conservadora

## Base
- Rama de trabajo: `optimization/d1-catalogue-v2`, commit previo `4711bb4`.
- Referencia funcional declarada: `fix/personajes-imagen-main` / `da02ac6`.
- Medición reportada por el usuario: 20.630 filas leídas en un recorrido de Preview.

## Cambios efectivos de código
- `src/pages/explorar.astro`: sustituye la agregación MIN/MAX de IDs por dos búsquedas ordenadas con LIMIT 1. La selección diaria por segmentos, las rutas y el renderizado permanecen intactos. La ganancia depende de que id_personaje esté indexado (normalmente PRIMARY KEY); validar en D1 Insights.

## Índices candidatos (NO aplicados)
- `optimization/indexes-proposed.sql` contiene índices para subconsultas de imagen, ordenación, filtros y conteos. No se ejecutan automáticamente. Confirmar estructura e índices existentes, plan de consultas, tamaño y coste de escritura antes de adoptarlos.
- D1 del Preview podría compartir binding con producción. No ejecutar cambios de esquema desde el Preview sin confirmar el entorno.

## Límites de verificación
- No se dispone aquí de una copia representativa de la base D1 ni de acceso autenticado para EXPLAIN sobre sus datos.
- La compilación completa no pudo ejecutarse con las dependencias disponibles en este entorno.
- No hay evidencia para prometer una reducción de 50/75/90 % ni para considerar esto la optimización integral terminada.

## Prueba comparativa
1. Guardar la referencia estable y su número de filas leídas.
2. Probar exactamente el mismo recorrido en el Preview de esta rama, con ventana temporal aislada.
3. Comparar las consultas de MIN/MAX, personajes+imagen, etiquetas y conteos, por separado.
4. Ejecutar `EXPLAIN QUERY PLAN` en una copia D1 para los SQL de mayor lectura, antes y después de crear índices.
5. Validar búsquedas por personaje/universo, favoritos, paginación, filtros y dioramas compuestos.

## Aplicación segura
1. En la rama optimization/d1-catalogue-v2, verificar `git status`.
2. `git apply --check ../3dprintcatalogue_d1_v3.patch`
3. `git apply ../3dprintcatalogue_d1_v3.patch`
4. `git diff --check` y compilar con `npm ci && npm run build`.
5. Si las pruebas pasan, `git add src/pages/explorar.astro optimization/`.
6. `git commit -m "perf(d1): use indexed character bounds and document index candidates"`
7. `git push -u origin optimization/d1-catalogue-v2`.
8. Revisar Preview; NO fusionar hasta validar funcionalidad y métricas.

## Reversión
- Para revertir únicamente este commit después de publicarlo: `git revert <hash_del_nuevo_commit>`.
- No hay migraciones D1 automáticas en esta entrega.
