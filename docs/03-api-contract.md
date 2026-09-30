# Contrato API

Base path: `/api`

## Catálogo

### GET /api/categories

Respuesta:
```json
[
  {
    "id": "uuid",
    "name": "Bebidas",
    "slug": "bebidas"
  }
]
```

### GET /api/products

Query params:
- `category`
- `search`
- `page`
- `pageSize`

Respuesta:
```json
{
  "items": [],
  "page": 1,
  "pageSize": 20,
  "total": 0
}
```

### GET /api/products/:id

## Carrito

Header sugerido:
`X-Cart-Session: <uuid>`

### GET /api/cart

### POST /api/cart/items

Request:
```json
{
  "productId": "uuid",
  "quantity": 2
}
```

### PUT /api/cart/items/:id

Request:
```json
{
  "quantity": 3
}
```

### DELETE /api/cart/items/:id

### DELETE /api/cart

## Checkout

### POST /api/checkout

Request:
```json
{
  "customer": {
    "firstName": "Rafael",
    "lastName": "Ziraldo",
    "email": "example@example.com",
    "phone": ""
  },
  "shippingAddress": {
    "line1": "Calle 123",
    "line2": "",
    "city": "Villa Regina",
    "state": "Rio Negro",
    "postalCode": "8336",
    "country": "AR"
  }
}
```

Respuesta:
```json
{
  "orderId": "uuid",
  "status": "PendingPayment",
  "payment": {
    "redirectUrl": null
  }
}
```

## Órdenes

### GET /api/orders/:id

## Pagos

### POST /api/payments/webhook/:provider

Debe ser idempotente.

## Errores

Ejemplo:
```json
{
  "type": "validation_error",
  "title": "Validation failed",
  "status": 400,
  "detail": "Invalid request",
  "errors": {
    "quantity": ["Must be greater than zero"]
  }
}
```
