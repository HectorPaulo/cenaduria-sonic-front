import { Injectable } from '@angular/core';
import { OrdersService } from '../../services/orders.service';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment';

// Request/Response Interfaces
export interface CreateOrderItemRequest {
  type: 'PRODUCT' | 'PROMOTION';
  productId?: number;
  promotionId?: number;
  quantity: number;
}

export interface CreateOrderRequest {
  items: CreateOrderItemRequest[];
  tip?: number;
}

export interface UpdateOrderTipRequest {
  tip: number;
}

export interface UpdateOrderStatusRequest {
  status: string;
}

export interface UpdateOrderEstimatedTimeRequest {
  estimatedTime: string; // Format: "HH:MM" or "MM:SS"
}

export interface OrderStatisticsResponse {
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  ordersByStatus: Record<string, number>;
}

export interface TopSellingItem {
  id: number;
  name: string;
  totalQuantity: number;
  totalRevenue: number;
}

@Injectable({
  providedIn: 'root',
})
export class PedidosService {
  constructor(private ordersService: OrdersService, private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token =
      localStorage.getItem('access_token') ||
      localStorage.getItem('token') ||
      localStorage.getItem('auth_token') ||
      '';
    const masked = token
      ? `${token.slice(0, 6)}...${token.slice(-4)} (len=${token.length})`
      : 'none';
    console.log('[PedidosService] auth token:', masked);
    return new HttpHeaders({ Authorization: token ? `Bearer ${token}` : '' });
  }

  // ==================== EMPLOYEE/ADMIN ENDPOINTS ====================

  /**
   * Get paginated orders filtered by status
   */
  getOrdersByStatusPaged(
    status: string,
    page: number = 0,
    size: number = 100,
    sort: string = ''
  ): Observable<any> {
    const url = `${environment.BASE_URL}/api/orders/status/${encodeURIComponent(
      status
    )}`;
    const headers = this.getAuthHeaders();
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    if (sort) {
      params = params.set('sort', sort);
    }
    console.log(
      '[PedidosService] GET',
      url,
      'with Authorization',
      params.toString()
    );
    return this.http.get<any>(url, { headers, params });
  }

  /**
   * Get all active orders (not cancelled or delivered)
   */
  getActiveOrdersPaged(
    page: number = 0,
    size: number = 100,
    sort: string = ''
  ): Observable<any> {
    const url = `${environment.BASE_URL}/api/orders/active`;
    const headers = this.getAuthHeaders();
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    if (sort) {
      params = params.set('sort', sort);
    }
    return this.http.get<any>(url, { headers, params });
  }

  /**
   * Get detailed order information by ID
   */
  getOrderById(orderId: number | string): Observable<any> {
    const url = `${environment.BASE_URL}/api/orders/${orderId}`;
    const headers = this.getAuthHeaders();
    console.log('[PedidosService] GET', url);
    return this.http.get<any>(url, { headers });
  }

  /**
   * Update order status (EMPLOYEE/ADMIN only)
   */
  updateOrderStatus(orderId: number | string, status: string): Observable<any> {
    const url = `${environment.BASE_URL}/api/orders/${orderId}/status`;
    const headers = this.getAuthHeaders().set(
      'Content-Type',
      'application/json'
    );
    const body: UpdateOrderStatusRequest = { status };
    console.log('[PedidosService] PATCH', url, 'status:', status);
    return this.http.patch<any>(url, body, { headers });
  }

  /**
   * Update estimated time for an order (EMPLOYEE/ADMIN only)
   */
  updateOrderEstimatedTime(
    orderId: number | string,
    estimatedTime: string
  ): Observable<any> {
    const url = `${environment.BASE_URL}/api/orders/${orderId}/estimated-time`;
    const headers = this.getAuthHeaders().set(
      'Content-Type',
      'application/json'
    );
    const body: UpdateOrderEstimatedTimeRequest = { estimatedTime };
    console.log('[PedidosService] PATCH', url, 'estimatedTime:', estimatedTime);
    return this.http.patch<any>(url, body, { headers });
  }

  /**
   * Cancel an order
   */
  cancelOrder(orderId: number | string): Observable<any> {
    const url = `${environment.BASE_URL}/api/orders/${orderId}/cancel`;
    const headers = this.getAuthHeaders();
    console.log('[PedidosService] PATCH', url, 'cancel');
    return this.http.patch<any>(url, {}, { headers });
  }

  /**
   * Get general order statistics (EMPLOYEE/ADMIN only)
   */
  getOrderStatistics(): Observable<OrderStatisticsResponse> {
    const url = `${environment.BASE_URL}/api/orders/statistics`;
    const headers = this.getAuthHeaders();
    console.log('[PedidosService] GET', url);
    return this.http.get<OrderStatisticsResponse>(url, { headers });
  }

  /**
   * Get order statistics by date range (EMPLOYEE/ADMIN only)
   */
  getOrderStatisticsByDateRange(
    startDate: string,
    endDate: string
  ): Observable<OrderStatisticsResponse> {
    const url = `${environment.BASE_URL}/api/orders/statistics/date-range`;
    const headers = this.getAuthHeaders();
    const params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate);
    console.log('[PedidosService] GET', url, params.toString());
    return this.http.get<OrderStatisticsResponse>(url, { headers, params });
  }

  /**
   * Get top selling products (EMPLOYEE/ADMIN only)
   */
  getTopSellingProducts(): Observable<TopSellingItem[]> {
    const url = `${environment.BASE_URL}/api/orders/top-selling/products`;
    const headers = this.getAuthHeaders();
    console.log('[PedidosService] GET', url);
    return this.http.get<TopSellingItem[]>(url, { headers });
  }

  /**
   * Get top selling promotions (EMPLOYEE/ADMIN only)
   */
  getTopSellingPromotions(): Observable<TopSellingItem[]> {
    const url = `${environment.BASE_URL}/api/orders/top-selling/promotions`;
    const headers = this.getAuthHeaders();
    console.log('[PedidosService] GET', url);
    return this.http.get<TopSellingItem[]>(url, { headers });
  }

  /**
   * Get orders by date range (EMPLOYEE/ADMIN only)
   */
  getOrdersByDateRange(
    startDate: string,
    endDate: string,
    page: number = 0,
    size: number = 100
  ): Observable<any> {
    const url = `${environment.BASE_URL}/api/orders/date-range`;
    const headers = this.getAuthHeaders();
    const params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate)
      .set('page', page.toString())
      .set('size', size.toString());
    console.log('[PedidosService] GET', url, params.toString());
    return this.http.get<any>(url, { headers, params });
  }

  // ==================== USER/CLIENT ENDPOINTS ====================

  /**
   * Create a new order
   */
  createOrder(orderData: CreateOrderRequest): Observable<any> {
    const url = `${environment.BASE_URL}/api/orders`;
    const headers = this.getAuthHeaders().set(
      'Content-Type',
      'application/json'
    );
    console.log('[PedidosService] POST', url, orderData);
    return this.http.post<any>(url, orderData, { headers });
  }

  /**
   * Update an existing order (only if PENDIENTE or within 5 min of EN_PREPARACION)
   */
  updateOrder(
    orderId: number | string,
    orderData: CreateOrderRequest
  ): Observable<any> {
    const url = `${environment.BASE_URL}/api/orders/${orderId}`;
    const headers = this.getAuthHeaders().set(
      'Content-Type',
      'application/json'
    );
    console.log('[PedidosService] PUT', url, orderData);
    return this.http.put<any>(url, orderData, { headers });
  }

  /**
   * Update order tip
   */
  updateOrderTip(orderId: number | string, tip: number): Observable<any> {
    const url = `${environment.BASE_URL}/api/orders/${orderId}/tip`;
    const headers = this.getAuthHeaders().set(
      'Content-Type',
      'application/json'
    );
    const body: UpdateOrderTipRequest = { tip };
    console.log('[PedidosService] PATCH', url, 'tip:', tip);
    return this.http.patch<any>(url, body, { headers });
  }

  /**
   * Get all orders for the authenticated user
   */
  getMyOrders(page: number = 0, size: number = 20): Observable<any> {
    const url = `${environment.BASE_URL}/api/orders/my-orders`;
    const headers = this.getAuthHeaders();
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    console.log('[PedidosService] GET', url, params.toString());
    return this.http.get<any>(url, { headers, params });
  }

  /**
   * Get recent orders for the authenticated user (ordered by date desc)
   */
  getMyRecentOrders(): Observable<any> {
    const url = `${environment.BASE_URL}/api/orders/my-orders/recent`;
    const headers = this.getAuthHeaders();
    console.log('[PedidosService] GET', url);
    return this.http.get<any>(url, { headers });
  }

  /**
   * Get pending orders for the authenticated user
   */
  getMyPendingOrders(): Observable<any> {
    const url = `${environment.BASE_URL}/api/orders/my-orders/pending`;
    const headers = this.getAuthHeaders();
    console.log('[PedidosService] GET', url);
    return this.http.get<any>(url, { headers });
  }

  /**
   * Get the last order for the authenticated user
   */
  getMyLastOrder(): Observable<any> {
    const url = `${environment.BASE_URL}/api/orders/my-orders/last`;
    const headers = this.getAuthHeaders();
    console.log('[PedidosService] GET', url);
    return this.http.get<any>(url, { headers });
  }

  /**
   * Check if user has active orders
   */
  hasActiveOrders(): Observable<boolean> {
    const url = `${environment.BASE_URL}/api/orders/has-active-orders`;
    const headers = this.getAuthHeaders();
    console.log('[PedidosService] GET', url);
    return this.http.get<boolean>(url, { headers });
  }
}
