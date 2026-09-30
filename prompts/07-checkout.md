# Prompt 07 - Checkout

Implementar backend y frontend de checkout.

Frontend:
- formulario cliente
- dirección
- validación
- resumen del carrito

Backend:
- POST /api/checkout
- releer carrito
- releer productos
- recalcular precios
- crear Order
- crear OrderItems como snapshot
- total en centavos
- estado PendingPayment

Evitar doble creación por doble click mediante estrategia de idempotencia.

Agregar tests.
