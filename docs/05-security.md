# Seguridad

## Reglas base

- Todo input se valida con Zod.
- No confiar en precios ni totales enviados por frontend.
- Evitar exposición de stack traces.
- Secrets mediante Cloudflare bindings/secrets.
- Rate limiting para endpoints sensibles.
- Webhooks autenticados/verificados según proveedor.
- Checkout idempotente cuando exista riesgo de doble envío.
- Webhooks idempotentes.
- Sanitizar contenido libre si luego se renderiza como HTML.
- No almacenar datos de tarjeta.

## Identidad

El MVP puede funcionar sin login para compra.

Si se agrega autenticación:
- separar identidad de carrito
- permitir merge de carrito anónimo
- proteger endpoints administrativos
