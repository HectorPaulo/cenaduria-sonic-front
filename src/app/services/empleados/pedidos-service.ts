import { Injectable } from '@angular/core';
import { OrdersService } from '../../services/orders.service';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';

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

  getActiveOrdersPaged(
    page: number = 1,
    size: number = 20,
    sort: string = ''
  ): Observable<any> {
    const url = `${
      environment.BASE_URL
    }/api/orders/active`;
    const headers = this.getAuthHeaders();
    return this.http.get<any>(url, { headers });
  }

  getOrdersByStatusPaged(
    status: string,
    page: number = 1,
    size: number = 20,
    sort: string = ''
  ): Observable<any> {
    const url = `${environment.BASE_URL}/api/orders/status/${encodeURIComponent(
      status
    )}`;
    const headers = this.getAuthHeaders();
    console.log('[PedidosService] GET', url, 'with Authorization');
    return this.http.get<any>(url, { headers });
  }

  updateOrderStatus(orderId: number | string, status: string): Observable<any> {
    const url = `${environment.BASE_URL}/api/orders/${orderId}/status`;
    const headers = this.getAuthHeaders().set(
      'Content-Type',
      'application/json'
    );
    console.log('[PedidosService] PATCH', url, 'status:', status);
    return this.http.patch<any>(url, { status }, { headers });
  }

  cancelOrder(orderId: number | string): Observable<any> {
    const url = `${environment.BASE_URL}/api/orders/${orderId}/cancel`;
    const headers = this.getAuthHeaders();
    console.log('[PedidosService] PATCH', url, 'cancel');
    return this.http.patch<any>(url, {}, { headers });
  }
}
