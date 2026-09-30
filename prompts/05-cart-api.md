# Prompt 05 - Cart API

Implementar carrito anónimo.

Endpoints:
- GET /api/cart
- POST /api/cart/items
- PUT /api/cart/items/:id
- DELETE /api/cart/items/:id
- DELETE /api/cart

Usar `X-Cart-Session` como identificador inicial.

Reglas:
- quantity > 0
- producto debe existir y estar activo
- precio se obtiene siempre desde D1
- no confiar en price enviado por cliente
- guardar UnitPriceCents server-side
- recalcular subtotal en backend

Agregar tests de casos principales.
