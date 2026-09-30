# Requerimientos funcionales

## 1. Alcance MVP

El sistema debe permitir que un usuario:

- Navegue productos.
- Filtre por categoría.
- Busque productos.
- Vea detalle de producto.
- Agregue productos a un carrito.
- Modifique cantidades.
- Elimine productos.
- Visualice subtotal.
- Complete un checkout.
- Genere una orden.
- Inicie un pago.
- Consulte el resultado de la orden.

El carrito debe funcionar inicialmente sin autenticación.

## 2. Catálogo

### Categorías
- Listar categorías activas.
- Cada categoría tiene nombre y slug.

### Productos
- Nombre.
- Descripción.
- Precio actual.
- Imagen principal.
- Categoría.
- Estado activo/inactivo.

### Búsqueda
Permitir filtros por:
- categoría
- texto
- paginación

## 3. Carrito

- El navegador recibe/genera un `cartSessionId`.
- El carrito se identifica por sesión anónima.
- Agregar producto.
- Cambiar cantidad.
- Eliminar item.
- Vaciar carrito.
- Recuperar carrito existente.

### Regla crítica
El frontend nunca define el precio efectivo del producto.

## 4. Checkout

Solicitar como mínimo:
- nombre
- apellido
- email
- teléfono opcional
- dirección
- ciudad
- provincia/estado
- código postal

Al confirmar:
1. Releer productos desde base.
2. Revalidar precios.
3. Recalcular subtotal.
4. Generar Order.
5. Copiar productos a OrderItem.
6. Inicializar estado de pago.

## 5. Órdenes

Estados sugeridos:
- PendingPayment
- Paid
- Cancelled
- Failed
- Completed

El pedido debe conservar snapshot de:
- nombre del producto
- precio unitario
- cantidad
- total de línea

## 6. Pagos

El dominio no debe depender directamente de un proveedor concreto.

Contrato lógico:

PaymentProvider.createPayment(...)

Implementaciones futuras:
- Mercado Pago
- Stripe
- otro proveedor

## 7. Administración

MVP administrativo opcional posterior:
- ABM categorías
- ABM productos
- carga de imágenes
- activar/desactivar productos
- consultar órdenes

## 8. Fuera de alcance inicial

- promociones complejas
- cupones avanzados
- múltiples depósitos
- stock distribuido
- facturación fiscal
- recuperación de carrito multi-dispositivo
- recomendaciones IA
