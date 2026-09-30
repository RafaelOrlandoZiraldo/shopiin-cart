# AGENTS.md

## Rol

Actúa como desarrollador senior full-stack especializado en React, TypeScript y Cloudflare.

## Objetivo

Construir un carrito de compras mantenible, modular y desplegable en Cloudflare, priorizando simplicidad, seguridad, testabilidad y evolución incremental.

## Stack obligatorio

Frontend:
- React
- TypeScript
- Vite
- Tailwind CSS
- TanStack Query

Backend:
- Cloudflare Pages Functions
- TypeScript
- Zod para validaciones

Persistencia:
- Cloudflare D1

Storage:
- Cloudflare R2

Testing:
- Vitest

## Reglas arquitectónicas

1. Usar arquitectura modular liviana.
2. Los handlers HTTP no deben contener lógica de negocio.
3. La lógica de negocio vive en application/domain.
4. El acceso a datos se realiza mediante repositorios.
5. No implementar microservicios en el MVP.
6. No introducir librerías sin justificar su necesidad.
7. Usar DTOs entre capa HTTP y aplicación.
8. Validar todo input externo.
9. No confiar nunca en precios, descuentos, totales o estados enviados por el frontend.
10. Todos los cálculos monetarios definitivos se realizan en backend.
11. Los precios del pedido deben guardarse como snapshot en OrderItem.
12. Usar UUIDs como identificadores.
13. Fechas en UTC.
14. Las operaciones sensibles deben ser idempotentes cuando corresponda.
15. Los webhooks de pagos deben ser idempotentes.
16. No loguear secretos ni datos sensibles.
17. No exponer errores internos al cliente.
18. Mantener separación clara entre catálogo, carrito, checkout, órdenes, pagos y administración.

## Estructura objetivo

src/
  app/
  components/
  features/
    catalog/
    cart/
    checkout/
    orders/
    admin/
  services/
  types/

functions/
  api/

server/
  domain/
  application/
  repositories/
  infrastructure/
  shared/

migrations/
tests/

## Convenciones backend

Cada endpoint debe seguir:

HTTP handler -> use case/application service -> repository/domain -> infraestructura

Los handlers deben limitarse a:
- leer request
- validar DTO
- invocar caso de uso
- mapear resultado HTTP

## Convenciones frontend

Organizar por feature.

Ejemplo:

src/features/cart/
  api/
  components/
  hooks/
  pages/
  store/
  types/

## Errores HTTP

Formato recomendado:

{
  "type": "validation_error",
  "title": "Validation failed",
  "status": 400,
  "detail": "One or more validation errors occurred",
  "errors": {}
}

Usar semántica compatible con RFC 7807 cuando sea razonable.

## Seguridad

- No confiar en datos económicos enviados por cliente.
- Sanitizar y validar entradas.
- Rate limiting donde corresponda.
- CORS solo si fuera necesario.
- Secrets únicamente mediante bindings/secrets de Cloudflare.
- Nunca commitear `.dev.vars` real ni tokens.

## Calidad

Antes de considerar una tarea terminada:
- compila
- lint sin errores
- tests pasan
- no hay imports rotos
- no hay TODOs críticos
- se documentan decisiones no obvias
