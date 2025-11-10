import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface OrderItemDto {
  type: 'PRODUCT' | 'PROMOTION';
  productId?: number | null;
  promotionId?: number | null;
  quantity: number;
}

export interface CreateOrderDto {
  tip?: number;
  items: OrderItemDto[];
}

@Injectable({ providedIn: 'root' })
export class OrdersService {
  constructor(private http: HttpClient) {}

  createOrder(payload: CreateOrderDto): Observable<any> {
    const url = `${environment.BASE_URL}/api/orders`;
    return this.http.post<any>(url, payload);
  }

  updateOrder(
    orderId: string | number,
    payload: CreateOrderDto
  ): Observable<any> {
    const url = `${environment.BASE_URL}/api/orders/${orderId}`;
    return this.http.put<any>(url, payload);
  }

  getMyOrders(): Observable<any> {
    const url = `${environment.BASE_URL}/api/orders/my-orders`;
    return this.http.get<any>(url);
  }

  getMyOrdersPaged(
    page: number = 1,
    size: number = 10,
    sort: string = ''
  ): Observable<any> {
    const url = `${
      environment.BASE_URL
    }/api/orders/my-orders?page=${page}&size=${size}&sort=${encodeURIComponent(
      sort
    )}`;
    return this.http.get<any>(url);
  }

  getRecentOrders(): Observable<any> {
    const url = `${environment.BASE_URL}/api/orders/my-orders/recent`;
    return this.http.get<any>(url);
  }

  getPendingOrders(): Observable<any> {
    const url = `${environment.BASE_URL}/api/orders/my-orders/pending`;
    return this.http.get<any>(url);
  }

  getLastOrder(): Observable<any> {
    const url = `${environment.BASE_URL}/api/orders/my-orders/last`;
    return this.http.get<any>(url);
  }

  getOrdersByDateRange(startIso: string, endIso: string): Observable<any> {
    const url = `${
      environment.BASE_URL
    }/api/orders/my-orders/date-range?startDate=${encodeURIComponent(
      startIso
    )}&endDate=${encodeURIComponent(endIso)}`;
    return this.http.get<any>(url);
  }
}
