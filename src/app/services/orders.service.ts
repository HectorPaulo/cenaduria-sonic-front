import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { tap, catchError, switchMap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { AuthService } from './auth.service';

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
  constructor(private http: HttpClient, private auth: AuthService) {}

  private doGet(url: string, logLabel = ''): Observable<any> {
    const token =
      localStorage.getItem('access_token') ||
      localStorage.getItem('token') ||
      localStorage.getItem('auth_token') ||
      '';
    const masked = token
      ? `${token.slice(0, 6)}...${token.slice(-4)} (len=${token.length})`
      : 'none';
    console.log(`[OrdersService] ${logLabel} token:`, masked);
    const headers = new HttpHeaders({
      Authorization: token ? `Bearer ${token}` : '',
    });
    console.log(
      `[OrdersService] ${logLabel} GET`,
      url,
      'headers present:',
      !!token
    );

    return this.http.get<any>(url, { headers }).pipe(
      tap((res) => console.log(`[OrdersService] ${logLabel} response:`, res)),
      catchError((err) => {
        console.error(`[OrdersService] ${logLabel} error:`, err);
        // If unauthorized/forbidden, attempt a refresh and retry once
        if (
          (err?.status === 401 || err?.status === 403) &&
          localStorage.getItem('refresh_token')
        ) {
          console.log('[OrdersService] attempting token refresh and retry...');
          return this.auth.refreshToken().pipe(
            switchMap((ok) => {
              if (ok) {
                const newToken = localStorage.getItem('access_token') || '';
                const newMasked = newToken
                  ? `${newToken.slice(0, 6)}...${newToken.slice(-4)} (len=${
                      newToken.length
                    })`
                  : 'none';
                console.log(
                  '[OrdersService] refresh succeeded, new token:',
                  newMasked
                );
                const newHeaders = new HttpHeaders({
                  Authorization: newToken ? `Bearer ${newToken}` : '',
                });
                return this.http.get<any>(url, { headers: newHeaders }).pipe(
                  tap((res2) =>
                    console.log(
                      `[OrdersService] ${logLabel} retry response:`,
                      res2
                    )
                  ),
                  catchError((err2) => {
                    console.error(
                      `[OrdersService] ${logLabel} retry failed:`,
                      err2
                    );
                    return throwError(() => err2);
                  })
                );
              }
              return throwError(() => err);
            })
          );
        }

        return throwError(() => err);
      })
    );
  }

  createOrder(payload: CreateOrderDto): Observable<any> {
    const url = `${environment.BASE_URL}/api/orders`;
    const token =
      localStorage.getItem('access_token') ||
      localStorage.getItem('token') ||
      localStorage.getItem('auth_token') ||
      '';
    const masked = token
      ? `${token.slice(0, 6)}...${token.slice(-4)} (len=${token.length})`
      : 'none';
    console.log('[OrdersService] createOrder token:', masked);
    const headers = new HttpHeaders({
      Authorization: token ? `Bearer ${token}` : '',
    });
    console.log('[OrdersService] POST', url, 'headers present:', !!token);
    return this.http
      .post<any>(url, payload, { headers })
      .pipe(
        tap((res) => console.log('[OrdersService] createOrder response:', res))
      );
  }

  getMyOrders(): Observable<any> {
    const url = `${environment.BASE_URL}/api/orders/my-orders`;
    const token =
      localStorage.getItem('access_token') ||
      localStorage.getItem('token') ||
      localStorage.getItem('auth_token') ||
      '';
    const masked = token
      ? `${token.slice(0, 6)}...${token.slice(-4)} (len=${token.length})`
      : 'none';
    console.log('[OrdersService] getMyOrders token:', masked);
    const headers = new HttpHeaders({
      Authorization: token ? `Bearer ${token}` : '',
    });
    console.log('[OrdersService] GET', url, 'headers present:', !!token);
    return this.doGet(url, 'getMyOrders');
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
    const token =
      localStorage.getItem('access_token') ||
      localStorage.getItem('token') ||
      localStorage.getItem('auth_token') ||
      '';
    const masked = token
      ? `${token.slice(0, 6)}...${token.slice(-4)} (len=${token.length})`
      : 'none';
    console.log('[OrdersService] getMyOrdersPaged token:', masked);
    const headers = new HttpHeaders({
      Authorization: token ? `Bearer ${token}` : '',
    });
    console.log('[OrdersService] GET', url, 'headers present:', !!token);
    return this.doGet(url, 'getMyOrdersPaged');
  }

  getRecentOrders(): Observable<any> {
    const url = `${environment.BASE_URL}/api/orders/my-orders/recent`;
    const token =
      localStorage.getItem('access_token') ||
      localStorage.getItem('token') ||
      localStorage.getItem('auth_token') ||
      '';
    const masked = token
      ? `${token.slice(0, 6)}...${token.slice(-4)} (len=${token.length})`
      : 'none';
    console.log('[OrdersService] getRecentOrders token:', masked);
    const headers = new HttpHeaders({
      Authorization: token ? `Bearer ${token}` : '',
    });
    console.log('[OrdersService] GET', url, 'headers present:', !!token);
    return this.doGet(url, 'getRecentOrders');
  }

  getPendingOrders(): Observable<any> {
    const url = `${environment.BASE_URL}/api/orders/my-orders/pending`;
    const token =
      localStorage.getItem('access_token') ||
      localStorage.getItem('token') ||
      localStorage.getItem('auth_token') ||
      '';
    const masked = token
      ? `${token.slice(0, 6)}...${token.slice(-4)} (len=${token.length})`
      : 'none';
    console.log('[OrdersService] getPendingOrders token:', masked);
    const headers = new HttpHeaders({
      Authorization: token ? `Bearer ${token}` : '',
    });
    console.log('[OrdersService] GET', url, 'headers present:', !!token);
    return this.doGet(url, 'getPendingOrders');
  }

  getLastOrder(): Observable<any> {
    const url = `${environment.BASE_URL}/api/orders/my-orders/last`;
    const token =
      localStorage.getItem('access_token') ||
      localStorage.getItem('token') ||
      localStorage.getItem('auth_token') ||
      '';
    const masked = token
      ? `${token.slice(0, 6)}...${token.slice(-4)} (len=${token.length})`
      : 'none';
    console.log('[OrdersService] getLastOrder token:', masked);
    const headers = new HttpHeaders({
      Authorization: token ? `Bearer ${token}` : '',
    });
    console.log('[OrdersService] GET', url, 'headers present:', !!token);
    return this.doGet(url, 'getLastOrder');
  }

  getOrdersByDateRange(startIso: string, endIso: string): Observable<any> {
    const url = `${
      environment.BASE_URL
    }/api/orders/my-orders/date-range?startDate=${encodeURIComponent(
      startIso
    )}&endDate=${encodeURIComponent(endIso)}`;
    const token =
      localStorage.getItem('access_token') ||
      localStorage.getItem('token') ||
      localStorage.getItem('auth_token') ||
      '';
    const masked = token
      ? `${token.slice(0, 6)}...${token.slice(-4)} (len=${token.length})`
      : 'none';
    console.log('[OrdersService] getOrdersByDateRange token:', masked);
    const headers = new HttpHeaders({
      Authorization: token ? `Bearer ${token}` : '',
    });
    console.log('[OrdersService] GET', url, 'headers present:', !!token);
    return this.doGet(url, 'getOrdersByDateRange');
  }
}
