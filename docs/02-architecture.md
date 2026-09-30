# Arquitectura

## 1. Estilo

Monolito modular serverless.

No usar microservicios en el MVP.

## 2. Diagrama

```text
Browser
  |
  v
React + Vite
  |
  | /api/*
  v
Cloudflare Pages Functions
  |
  +--> Application
  |      |
  |      v
  |    Domain
  |
  +--> Repositories
          |
          +--> D1
          +--> R2
          +--> Payment Provider
```

## 3. Capas

### HTTP
Responsabilidad:
- request/response
- validación externa
- auth contextual
- mapping de errores

### Application
Responsabilidad:
- casos de uso
- coordinación
- transacciones lógicas

### Domain
Responsabilidad:
- reglas de negocio
- invariantes
- estados

### Repositories
Responsabilidad:
- contratos de persistencia

### Infrastructure
Responsabilidad:
- D1
- R2
- proveedores externos

## 4. Módulos

- Catalog
- Cart
- Checkout
- Orders
- Payments
- Admin

## 5. Carrito anónimo

Persistir un `cartSessionId` generado en cliente.

Preferencia:
- cookie segura cuando sea viable
- fallback a localStorage si el MVP lo requiere

No almacenar precios de confianza en el cliente.

## 6. Separación futura

Si la API crece, puede extraerse a un Worker dedicado sin rediseñar el dominio.

## 7. Trade-offs

### Pages Functions
Ventajas:
- mismo repositorio
- misma plataforma
- menor configuración
- evita CORS en un despliegue unificado

Costo:
- acoplamiento operativo frontend/backend mayor que con API separada

### D1
Ventajas:
- serverless
- integración nativa Cloudflare
- SQL

Costo:
- no asumir comportamiento idéntico a SQL Server
- diseñar pensando en SQLite/D1
