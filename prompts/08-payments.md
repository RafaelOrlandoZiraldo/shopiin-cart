# Prompt 08 - Payments

Crear abstracción de proveedor de pagos.

Definir:
- PaymentProvider
- CreatePaymentRequest
- CreatePaymentResult
- PaymentStatus

Implementar inicialmente un FakePaymentProvider para desarrollo.

Crear endpoint de webhook genérico preparado para proveedor real.

Requisitos:
- idempotencia
- logs sin secretos
- transición segura de estados

No acoplar Orders a un SDK concreto.
