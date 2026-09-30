# Estrategia de testing

## Unit tests

Prioridad alta:
- cálculo de subtotal
- validación de cantidades
- creación de order snapshot
- transiciones de estado
- idempotencia de pagos

## Integration tests

- repositorios D1
- endpoints cart
- checkout

## Frontend tests

- ProductCard
- CartItem
- CartSummary
- checkout validation

## Criterio por slice

Cada prompt debe terminar con:
- build correcto
- lint correcto
- tests correctos
