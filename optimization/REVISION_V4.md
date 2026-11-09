# Revisión v4: caché de metadatos públicos

## Alcance real
- Los endpoints GET `/api/universos` y `/api/shop/etiquetas` usan caché de borde de Cloudflare cuando está disponible, con TTL de 120 segundos en borde y 60 segundos en navegador.
- Si la caché no existe o falla, consultan D1 como antes. Los errores no se almacenan en caché.
- No cambia la estructura de los JSON, los filtros, las asignaciones producto-personaje ni las tablas.
- Una actualización de universos o etiquetas puede tardar hasta 120 segundos en verse en una misma ubicación de borde; se requiere invalidación si se necesita visibilidad inmediata.
- La caché no evita lecturas de la página SSR de inicio ni optimiza las consultas principales de personajes y productos. No se promete reducción global sin medición.

## Validación
1. `git apply --check` sobre la rama que ya incluye v3.
2. `npm run build` en el entorno local con dependencias instaladas.
3. Abrir ambos endpoints dos veces y verificar igualdad exacta de respuestas; la segunda visita al mismo borde debería reutilizar la respuesta.
4. Repetir un recorrido comparable y medir filas leídas por consulta y ejecución en D1 Insights.
5. Comprobar cambios recientes de etiquetas y universos teniendo en cuenta TTL.

## Reversión
`git revert <hash-del-commit-v4>`; no requiere revertir datos ni migraciones.

## Próximo cuello de botella
La consulta SSR de todos los personajes con imagen principal y el listado amplio de productos siguen necesitando una refactorización coordinada con el frontend y pruebas de búsqueda y favoritos.
