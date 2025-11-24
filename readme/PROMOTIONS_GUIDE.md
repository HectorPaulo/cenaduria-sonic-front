# Guía de Uso del Sistema de Promociones

## Descripción General

El sistema de promociones permite a los administradores crear, gestionar y controlar promociones, mientras que los clientes pueden ver y añadir promociones activas a su carrito de compras.

## Servicios Implementados

### 1. PromotionsService (`src/app/services/promotions.service.ts`)

Servicio completo que implementa todos los endpoints de la API de promociones.

#### Operaciones CRUD (Administrador)

```typescript
import { PromotionsService, CreatePromotionRequest, UpdatePromotionRequest } from './services/promotions.service';

// Inyectar el servicio
constructor(private promotionsService: PromotionsService) {}

// Crear promoción temporal
createTemporaryPromotion() {
  const request: CreatePromotionRequest = {
    name: '2x1 en Tacos',
    description: 'Compra un taco y llévate otro gratis',
    price: 99.99,
    type: 'TEMPORARY',
    startsAt: '2024-10-20',
    endsAt: '2024-10-25',
    productIds: [1, 2, 3]
  };

  this.promotionsService.createPromotion(request).subscribe({
    next: (promotion) => console.log('Promoción creada:', promotion),
    error: (err) => console.error('Error:', err)
  });
}

// Crear promoción recurrente
createRecurringPromotion() {
  const request: CreatePromotionRequest = {
    name: 'Martes de Tacos',
    description: 'Todos los martes 2x1',
    price: 89.99,
    type: 'RECURRING',
    productIds: [1, 2],
    weeklyRules: [
      {
        dayOfWeek: 'TUESDAY',
        startTime: { hour: 10, minute: 0, second: 0, nano: 0 },
        endTime: { hour: 18, minute: 0, second: 0, nano: 0 }
      }
    ]
  };

  this.promotionsService.createPromotion(request).subscribe({
    next: (promotion) => console.log('Promoción creada:', promotion),
    error: (err) => console.error('Error:', err)
  });
}

// Actualizar promoción
updatePromotion(id: number) {
  const request: UpdatePromotionRequest = {
    name: '3x2 en Tacos',
    price: 149.99
  };

  this.promotionsService.updatePromotion(id, request).subscribe({
    next: (promotion) => console.log('Promoción actualizada:', promotion),
    error: (err) => console.error('Error:', err)
  });
}

// Activar/Desactivar promoción
toggleStatus(id: number) {
  this.promotionsService.togglePromotionStatus(id).subscribe({
    next: (promotion) => console.log('Estado cambiado:', promotion),
    error: (err) => console.error('Error:', err)
  });
}

// Subir imagen
uploadImage(id: number, file: File) {
  this.promotionsService.uploadPromotionImage(id, file).subscribe({
    next: (promotion) => console.log('Imagen subida:', promotion),
    error: (err) => console.error('Error:', err)
  });
}

// Eliminar promoción
deletePromotion(id: number) {
  this.promotionsService.deletePromotion(id).subscribe({
    next: () => console.log('Promoción eliminada'),
    error: (err) => console.error('Error:', err)
  });
}
```

#### Operaciones de Consulta (Cliente/Público)

```typescript
// Obtener promociones activas
getActivePromotions() {
  this.promotionsService.getActivePromotions().subscribe({
    next: (promotions) => {
      console.log('Promociones activas:', promotions);
      this.promotions = promotions;
    },
    error: (err) => console.error('Error:', err)
  });
}

// Obtener promociones válidas actualmente (activas y en horario válido)
getCurrentPromotions() {
  this.promotionsService.getCurrentlyValidPromotions().subscribe({
    next: (promotions) => {
      console.log('Promociones válidas ahora:', promotions);
    },
    error: (err) => console.error('Error:', err)
  });
}

// Buscar promociones por nombre
searchPromotions(searchTerm: string) {
  this.promotionsService.searchPromotionsByName(searchTerm).subscribe({
    next: (promotions) => {
      console.log('Resultados:', promotions);
    },
    error: (err) => console.error('Error:', err)
  });
}

// Obtener promociones por producto
getPromotionsByProduct(productId: number) {
  this.promotionsService.getActivePromotionsByProduct(productId).subscribe({
    next: (promotions) => {
      console.log('Promociones para producto:', promotions);
    },
    error: (err) => console.error('Error:', err)
  });
}

// Obtener promociones ordenadas por precio
getPromotionsByPrice() {
  // Ascendente (menor a mayor)
  this.promotionsService.getActivePromotionsByPriceAsc().subscribe({
    next: (promotions) => console.log('Más baratas primero:', promotions)
  });

  // Descendente (mayor a menor)
  this.promotionsService.getActivePromotionsByPriceDesc().subscribe({
    next: (promotions) => console.log('Más caras primero:', promotions)
  });
}

// Obtener promoción por ID
getPromotionDetails(id: number) {
  this.promotionsService.getPromotionById(id).subscribe({
    next: (promotion) => {
      console.log('Detalles:', promotion);
      console.log('Productos incluidos:', promotion.products);
      console.log('Reglas semanales:', promotion.weeklyRules);
    },
    error: (err) => console.error('Error:', err)
  });
}
```

### 2. CartService Actualizado (`src/app/services/cart.service.ts`)

El servicio de carrito ahora soporta tanto productos como promociones.

```typescript
import { CartService } from './services/cart.service';

constructor(private cartService: CartService) {}

// Añadir producto al carrito (método existente)
addProductToCart(product: any) {
  this.cartService.add(product, 1);
}

// Añadir promoción al carrito (NUEVO)
addPromotionToCart(promotion: any) {
  this.cartService.addPromotion(promotion, 1);
  console.log('Promoción añadida al carrito');
}

// Obtener items del carrito
getCartItems() {
  const items = this.cartService.getItems();
  console.log('Items en carrito:', items);

  // Filtrar por tipo
  const products = items.filter(item => item.type === 'PRODUCT');
  const promotions = items.filter(item => item.type === 'PROMOTION');

  console.log('Productos:', products);
  console.log('Promociones:', promotions);
}

// Calcular subtotal
getSubtotal() {
  return this.cartService.subtotal;
}
```

### 3. OrdersService Actualizado (`src/app/services/orders.service.ts`)

El servicio de órdenes ahora puede crear órdenes con productos y promociones.

```typescript
import { OrdersService } from './services/orders.service';
import { CartService } from './services/cart.service';

constructor(
  private ordersService: OrdersService,
  private cartService: CartService
) {}

// Crear orden desde el carrito (NUEVO)
createOrderFromCart(tip: number = 0) {
  const cartItems = this.cartService.getItems();

  this.ordersService.createOrderFromCart(cartItems, tip).subscribe({
    next: (order) => {
      console.log('Orden creada:', order);
      this.cartService.clear(); // Limpiar carrito
    },
    error: (err) => console.error('Error al crear orden:', err)
  });
}

// Crear orden manualmente
createCustomOrder() {
  const payload = {
    tip: 15.0,
    items: [
      {
        type: 'PRODUCT',
        productId: 1,
        promotionId: null,
        quantity: 2
      },
      {
        type: 'PROMOTION',
        productId: null,
        promotionId: 5,
        quantity: 1
      }
    ]
  };

  this.ordersService.createOrder(payload).subscribe({
    next: (order) => console.log('Orden creada:', order),
    error: (err) => console.error('Error:', err)
  });
}
```

## Ejemplo de Componente Completo

```typescript
import { Component, OnInit } from "@angular/core";
import { PromotionsService, PromotionSummaryResponse } from "./services/promotions.service";
import { CartService } from "./services/cart.service";
import { OrdersService } from "./services/orders.service";

@Component({
  selector: "app-promotions",
  template: `
    <div class="promotions-container">
      <h2>Promociones Activas</h2>

      <div class="promotions-grid">
        <div *ngFor="let promo of promotions" class="promotion-card">
          <img [src]="promo.imageUrl" [alt]="promo.name" />
          <h3>{{ promo.name }}</h3>
          <p>{{ promo.description }}</p>
          <p class="price">\${{ promo.price }}</p>
          <button (click)="addToCart(promo)">Añadir al Carrito</button>
        </div>
      </div>

      <div class="cart-section">
        <h3>Carrito ({{ cartItems.length }} items)</h3>
        <div *ngFor="let item of cartItems">
          <p>{{ item.nombre }} - {{ item.type }} - \${{ item.precio }} x {{ item.cantidad }}</p>
        </div>
        <p>Subtotal: \${{ subtotal }}</p>
        <button (click)="checkout()">Realizar Pedido</button>
      </div>
    </div>
  `,
})
export class PromotionsComponent implements OnInit {
  promotions: PromotionSummaryResponse[] = [];
  cartItems: any[] = [];
  subtotal: number = 0;

  constructor(private promotionsService: PromotionsService, private cartService: CartService, private ordersService: OrdersService) {}

  ngOnInit() {
    this.loadPromotions();
    this.loadCart();
  }

  loadPromotions() {
    this.promotionsService.getCurrentlyValidPromotions().subscribe({
      next: (promotions) => {
        this.promotions = promotions;
      },
      error: (err) => {
        console.error("Error al cargar promociones:", err);
      },
    });
  }

  loadCart() {
    this.cartService.items$.subscribe((items) => {
      this.cartItems = items;
      this.subtotal = this.cartService.subtotal;
    });
  }

  addToCart(promotion: PromotionSummaryResponse) {
    this.cartService.addPromotion(promotion, 1);
    alert("Promoción añadida al carrito");
  }

  checkout() {
    const tip = 0; // O solicitar al usuario
    this.ordersService.createOrderFromCart(this.cartItems, tip).subscribe({
      next: (order) => {
        console.log("Orden creada exitosamente:", order);
        this.cartService.clear();
        alert("¡Pedido realizado con éxito!");
      },
      error: (err) => {
        console.error("Error al crear orden:", err);
        alert("Error al realizar el pedido");
      },
    });
  }
}
```

## Tipos de Datos

### CartItem

```typescript
interface CartItem {
  type: "PRODUCT" | "PROMOTION";
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  imagen?: string;
  cantidad: number;
  categoria?: string;
  extras?: string[];
  productId?: number;
  promotionId?: number;
}
```

### OrderItemDto

```typescript
interface OrderItemDto {
  type: "PRODUCT" | "PROMOTION";
  productId?: number | null;
  promotionId?: number | null;
  quantity: number;
}
```

### PromotionDetailResponse

```typescript
interface PromotionDetailResponse {
  id: number;
  name: string;
  description?: string;
  imageUrl?: string;
  price: number;
  type: "TEMPORARY" | "RECURRING";
  startsAt?: string;
  endsAt?: string;
  active: boolean;
  currentlyValid: boolean;
  products: ProductSummaryResponse[];
  weeklyRules?: WeeklyRuleResponse[];
}
```

## Flujo de Trabajo

### Para Administradores:

1. Crear promoción con `createPromotion()`
2. Subir imagen con `uploadPromotionImage()`
3. Activar/desactivar con `togglePromotionStatus()`
4. Actualizar con `updatePromotion()`
5. Eliminar con `deletePromotion()`

### Para Clientes:

1. Ver promociones activas con `getActivePromotions()` o `getCurrentlyValidPromotions()`
2. Añadir promoción al carrito con `cartService.addPromotion()`
3. Crear orden con `ordersService.createOrderFromCart()`

## Notas Importantes

- **Autenticación**: Todos los métodos de administración requieren token JWT
- **Refresh Token**: El servicio maneja automáticamente la renovación de tokens
- **Tipos de Promoción**:
  - `TEMPORARY`: Promociones con fechas de inicio y fin
  - `RECURRING`: Promociones recurrentes con reglas semanales
- **Validación**: Las promociones se validan automáticamente según fecha/hora
- **Carrito**: Soporta mezclar productos y promociones en la misma orden

## Endpoints Disponibles

Ver `promotions-api.json` para la especificación completa de la API.

### Principales endpoints:

- `GET /api/promotions/active` - Promociones activas
- `GET /api/promotions/current` - Promociones válidas ahora
- `GET /api/promotions/{id}` - Detalle de promoción
- `POST /api/promotions` - Crear promoción (admin)
- `PUT /api/promotions/{id}` - Actualizar promoción (admin)
- `DELETE /api/promotions/{id}` - Eliminar promoción (admin)
- `PATCH /api/promotions/{id}/status` - Cambiar estado (admin)
- `PATCH /api/promotions/{id}/image` - Subir imagen (admin)
