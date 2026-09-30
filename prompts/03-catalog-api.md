# Prompt 03 - Catalog API

Implementar vertical slice de catálogo backend.

Endpoints:
- GET /api/categories
- GET /api/products
- GET /api/products/:id

Soportar filtros:
- category
- search
- page
- pageSize

Capas:
handler -> application -> repository -> D1

Agregar:
- DTOs
- validaciones
- paginación
- errores 404
- tests

No implementar admin todavía.
