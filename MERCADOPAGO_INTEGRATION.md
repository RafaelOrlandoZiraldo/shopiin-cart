# Integracion Mercado Pago Checkout Pro

Este proyecto queda preparado para usar Mercado Pago Checkout Pro sin acoplar Orders a un SDK concreto. La integracion usa la abstraccion `PaymentProvider` y llamadas REST directas para crear preferencias.

## Variables necesarias

Configurar como secrets en Cloudflare Pages:

```bash
npx wrangler pages secret put PAYMENT_PROVIDER --project-name shopping-cart
npx wrangler pages secret put MERCADOPAGO_ACCESS_TOKEN --project-name shopping-cart
npx wrangler pages secret put MERCADOPAGO_WEBHOOK_SECRET --project-name shopping-cart
npx wrangler pages secret put MERCADOPAGO_NOTIFICATION_URL --project-name shopping-cart
npx wrangler pages secret put MERCADOPAGO_BACK_URL_BASE --project-name shopping-cart
npx wrangler pages secret put MERCADOPAGO_STATEMENT_DESCRIPTOR --project-name shopping-cart
```

Valores esperados:

- `PAYMENT_PROVIDER=mercadopago`
- `MERCADOPAGO_ACCESS_TOKEN`: access token de Mercado Pago.
- `MERCADOPAGO_WEBHOOK_SECRET`: secret generado en Mercado Pago para validar `x-signature`.
- `MERCADOPAGO_NOTIFICATION_URL`: URL publica del webhook, por ejemplo `https://tu-dominio.com/api/payments/webhook/mercadopago`.
- `MERCADOPAGO_BACK_URL_BASE`: URL publica del storefront, por ejemplo `https://tu-dominio.com`.
- `MERCADOPAGO_STATEMENT_DESCRIPTOR`: texto corto opcional para identificar el comercio.

Para desarrollo local se puede mantener `PAYMENT_PROVIDER=fake` en `.dev.vars`.

## Flujo implementado

1. `POST /api/checkout` recalcula carrito, productos y total en backend.
2. Se crea la orden en estado `PendingPayment`.
3. Si `PAYMENT_PROVIDER=mercadopago`, se crea una preferencia de Checkout Pro en Mercado Pago usando `POST https://api.mercadopago.com/checkout/preferences`.
4. La preferencia usa:
   - `external_reference = orderId`
   - `notification_url = MERCADOPAGO_NOTIFICATION_URL`
   - `back_urls` basadas en `MERCADOPAGO_BACK_URL_BASE`
   - `x-idempotency-key` con la clave de pago interna
   - `auto_return = approved` cuando existe `MERCADOPAGO_BACK_URL_BASE`
   - `metadata.order_id`
5. El checkout devuelve `payment.redirectUrl`, que corresponde al `init_point` de Checkout Pro, para redirigir al cliente a Mercado Pago.
6. Mercado Pago llama a `/api/payments/webhook/mercadopago`.
7. El webhook valida firma si hay secret configurado, consulta el pago real en Mercado Pago y actualiza la orden.

## Webhook

Endpoint:

```text
POST /api/payments/webhook/mercadopago
```

El handler espera notificaciones tipo payment. Toma `data.id` desde query string o body, valida `x-signature` y `x-request-id`, consulta:

```text
GET https://api.mercadopago.com/v1/payments/{paymentId}
```

Mapeo de estados:

- `approved`, `authorized` -> `Paid`
- `cancelled`, `charged_back`, `refunded`, `rejected` -> `Failed`
- otros estados -> `Pending`

La idempotencia se conserva con la clave:

```text
mercadopago:webhook:{eventId}
```

## Configuracion en Mercado Pago

En la aplicacion de Mercado Pago:

1. Configurar la URL de webhook:
   `https://tu-dominio.com/api/payments/webhook/mercadopago`
2. Habilitar notificaciones de pagos.
3. Copiar el secret de Webhooks en `MERCADOPAGO_WEBHOOK_SECRET`.
4. Usar credenciales de prueba en preview/dev y credenciales productivas solo en production.

## Cosas a tener en cuenta

- No commitear access tokens ni webhook secrets.
- Usar HTTPS real para webhooks en preview/production.
- Probar primero con credenciales sandbox/test.
- Confirmar que el pago de Mercado Pago tenga `external_reference` igual al `orderId`.
- Revisar logs `payment_webhook_processed` sin exponer secretos.
- El frontend ya muestra `Continuar a Mercado Pago` cuando `payment.redirectUrl` viene informado.
- Checkout Pro abre el flujo alojado de Mercado Pago por redirect. Para una integracion embebida con Bricks se deberia crear otro proveedor o adaptar el frontend.
- Si se decide usar Checkout API/Bricks en vez de Checkout Pro, mantener la abstraccion `PaymentProvider` y crear otro proveedor.
