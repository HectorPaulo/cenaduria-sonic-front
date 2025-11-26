# Análisis de Cobertura de API vs Frontend

Este documento detalla los endpoints definidos en `api.json` que **no se encontraron implementados** en los servicios principales del frontend (`AuthService`, `OrdersService`, `PromotionsService`, `MenuService`, `UsuariosService`).

## 📊 Resumen General

| Módulo         | Estado        | Comentarios                                                                                |
| :------------- | :------------ | :----------------------------------------------------------------------------------------- |
| **Promotions** | ✅ Completo   | Se ha implementado la gran mayoría de los endpoints.                                       |
| **Auth**       | ⚠️ Parcial    | Faltan endpoints de verificación y logout en servidor.                                     |
| **Products**   | ⚠️ Parcial    | Faltan búsquedas avanzadas y gestión de estado individual.                                 |
| **Categories** | ❌ Incompleto | Falta casi todo el CRUD (Crear, Editar, Eliminar) y búsquedas.                             |
| **Orders**     | ⚠️ Parcial    | Faltan funciones administrativas (estadísticas, tiempos estimados) y detalles específicos. |

---

## 🔍 Detalles de Endpoints Faltantes

### 1. Autenticación (`/api/auth`)

Aunque el login y registro funcionan, faltan mecanismos de seguridad y verificación.

- `POST /api/auth/logout`: El frontend actual solo borra el token localmente (`localStorage`), pero no llama al backend para invalidar el token (lista negra).
- `GET /api/auth/verify-roles`: No se utiliza para verificar roles desde el servidor (se confía en el token decodificado o datos locales).

### 2. Categorías (`/api/categories`)

Actualmente el frontend parece consumir categorías solo para mostrarlas en el menú, pero **no tiene implementada la gestión (CRUD)** de las mismas.

- **Gestión (Admin/Empleado):**
  - `POST /api/categories`: Crear nueva categoría.
  - `PUT /api/categories/{id}`: Editar categoría.
  - `DELETE /api/categories/{id}`: Eliminar categoría.
- **Consultas Específicas:**
  - `GET /api/categories/{id}`: Obtener una categoría por ID.
  - `GET /api/categories/{id}/detailed`: Categoría con productos detallados.
  - `GET /api/categories/{id}/products/count`: Conteo de productos.
  - `GET /api/categories/search`: Buscar categorías por nombre.
  - `GET /api/categories/name/{name}`: Buscar por nombre exacto.
  - `GET /api/categories/without-products`: Categorías vacías.

### 3. Productos (`/api/products`)

La gestión básica existe, pero faltan herramientas de búsqueda y consultas específicas.

- **Gestión:**
  - `PATCH /api/products/{id}/status`: Activar/Desactivar producto rápidamente (toggle).
- **Consultas:**
  - `GET /api/products/{id}`: Obtener detalle de un producto (admin/general).
  - `GET /api/products/{id}/active`: Obtener detalle de producto activo (cliente).
  - `GET /api/products/category/{categoryId}`: Obtener _todos_ los productos de una categoría (incluyendo inactivos).
- **Búsqueda:**
  - `GET /api/products/search`: Búsqueda simple.
  - `GET /api/products/search/advanced`: Búsqueda con filtros múltiples.
  - `GET /api/products/search/active`: Búsqueda de productos activos.
- **Conteos:**
  - `GET /api/products/category/{categoryId}/count`: Total productos en categoría.
  - `GET /api/products/category/{categoryId}/count/active`: Total activos en categoría.

### 4. Órdenes (`/api/orders`)

Faltan principalmente funcionalidades para el panel administrativo/empleado (estadísticas, gestión de tiempos).

- **Gestión de Orden (Empleado):**
  - `PUT /api/orders/{orderId}`: Actualización completa de orden.
  - `PATCH /api/orders/{orderId}/estimated-time`: **Crítico para cocina**. Actualizar tiempo estimado.
  - `PATCH /api/orders/{orderId}/tip`: Actualizar propina.
- **Consultas:**
  - `GET /api/orders/{orderId}`: Obtener detalle de una orden específica por ID.
  - `GET /api/orders/has-active-orders`: Verificar si hay órdenes activas (útil para UX).
- **Estadísticas y Reportes (Admin):**
  - `GET /api/orders/statistics`: Estadísticas generales.
  - `GET /api/orders/statistics/date-range`: Estadísticas por fecha.
  - `GET /api/orders/top-selling/products`: Productos más vendidos.
  - `GET /api/orders/top-selling/promotions`: Promociones más vendidas.
- **Filtros Avanzados:**
  - `GET /api/orders/status/{status}`: Filtrar todas las órdenes por estado.
  - `GET /api/orders/date-range`: Filtrar todas las órdenes por fecha.
  - `GET /api/orders/user/{userId}/status/{status}`: Órdenes de usuario por estado.
  - `GET /api/orders/user/{userId}/date-range`: Órdenes de usuario por fecha.

---

## 💡 Recomendaciones

1.  **Prioridad Alta (Cocina/Admin):** Implementar `PATCH /api/orders/{orderId}/estimated-time` para que los empleados puedan informar a los clientes cuánto tardará su pedido.
2.  **Prioridad Alta (Seguridad):** Implementar `POST /api/auth/logout` para cerrar sesión correctamente en el servidor.
3.  **Prioridad Media (Gestión):** Crear un servicio `CategoriesService` para manejar el CRUD de categorías, ya que actualmente parece no existir o estar muy limitado en `MenuService`.
4.  **Prioridad Media (Dashboard):** Implementar los endpoints de estadísticas (`/statistics`, `/top-selling`) para el dashboard del administrador.
