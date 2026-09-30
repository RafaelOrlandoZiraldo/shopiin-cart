# Diseño de base de datos

## Tablas

### Categories
- Id TEXT PK
- Name TEXT NOT NULL
- Slug TEXT NOT NULL UNIQUE
- Active INTEGER NOT NULL DEFAULT 1
- CreatedAt TEXT NOT NULL

### Products
- Id TEXT PK
- CategoryId TEXT NOT NULL
- Name TEXT NOT NULL
- Description TEXT
- PriceCents INTEGER NOT NULL
- ImageUrl TEXT
- Active INTEGER NOT NULL DEFAULT 1
- CreatedAt TEXT NOT NULL
- UpdatedAt TEXT NOT NULL

### Carts
- Id TEXT PK
- SessionId TEXT NOT NULL UNIQUE
- Status TEXT NOT NULL
- CreatedAt TEXT NOT NULL
- UpdatedAt TEXT NOT NULL

### CartItems
- Id TEXT PK
- CartId TEXT NOT NULL
- ProductId TEXT NOT NULL
- Quantity INTEGER NOT NULL
- UnitPriceCents INTEGER NOT NULL
- CreatedAt TEXT NOT NULL
- UpdatedAt TEXT NOT NULL

Unique sugerido:
- CartId + ProductId

### Orders
- Id TEXT PK
- CartId TEXT
- Email TEXT NOT NULL
- FirstName TEXT NOT NULL
- LastName TEXT NOT NULL
- Phone TEXT
- Status TEXT NOT NULL
- PaymentStatus TEXT NOT NULL
- SubtotalCents INTEGER NOT NULL
- ShippingCents INTEGER NOT NULL
- TotalCents INTEGER NOT NULL
- ShippingAddressJson TEXT NOT NULL
- CreatedAt TEXT NOT NULL
- UpdatedAt TEXT NOT NULL

### OrderItems
- Id TEXT PK
- OrderId TEXT NOT NULL
- ProductId TEXT NOT NULL
- ProductName TEXT NOT NULL
- Quantity INTEGER NOT NULL
- UnitPriceCents INTEGER NOT NULL
- LineTotalCents INTEGER NOT NULL

### Payments
- Id TEXT PK
- OrderId TEXT NOT NULL
- Provider TEXT NOT NULL
- ProviderPaymentId TEXT
- Status TEXT NOT NULL
- AmountCents INTEGER NOT NULL
- IdempotencyKey TEXT
- CreatedAt TEXT NOT NULL
- UpdatedAt TEXT NOT NULL

## Dinero

Usar enteros en centavos.

Nunca usar floating point para importes monetarios.

## Índices recomendados

- Products(CategoryId, Active)
- Products(Name)
- CartItems(CartId)
- Orders(Email)
- Orders(CreatedAt)
- Payments(OrderId)
- Payments(ProviderPaymentId)
