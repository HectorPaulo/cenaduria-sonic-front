import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { tap, catchError, switchMap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { AuthService } from './auth.service';

// ============ INTERFACES & TYPES ============

export type PromotionType = 'TEMPORARY' | 'RECURRING';
export type DayOfWeek =
  | 'MONDAY'
  | 'TUESDAY'
  | 'WEDNESDAY'
  | 'THURSDAY'
  | 'FRIDAY'
  | 'SATURDAY'
  | 'SUNDAY';

export interface LocalTime {
  hour: number;
  minute: number;
  second: number;
  nano: number;
}

export interface ProductSummaryResponse {
  id: number;
  name: string;
  imageUrl?: string;
  price: number;
}

export interface WeeklyRuleResponse {
  id: number;
  dayOfWeek: DayOfWeek;
  startTime: LocalTime;
  endTime: LocalTime;
  activeNow: boolean;
}

export interface PromotionSummaryResponse {
  id: number;
  name: string;
  description?: string;
  imageUrl?: string;
  price: number;
  type: PromotionType;
  active: boolean;
  currentlyValid: boolean;
}

export interface PromotionDetailResponse {
  id: number;
  name: string;
  description?: string;
  imageUrl?: string;
  price: number;
  type: PromotionType;
  startsAt?: string; // date format
  endsAt?: string; // date format
  active: boolean;
  currentlyValid: boolean;
  products: ProductSummaryResponse[];
  weeklyRules?: WeeklyRuleResponse[];
}

export interface CreateWeeklyRuleRequest {
  dayOfWeek: DayOfWeek;
  startTime: LocalTime;
  endTime: LocalTime;
}

export interface CreatePromotionRequest {
  name: string;
  description?: string;
  price: number;
  type: PromotionType;
  startsAt?: string; // date format YYYY-MM-DD
  endsAt?: string; // date format YYYY-MM-DD
  productIds: number[];
  weeklyRules?: CreateWeeklyRuleRequest[];
}

export interface UpdatePromotionRequest {
  name?: string;
  description?: string;
  price?: number;
  startsAt?: string;
  endsAt?: string;
  active?: boolean;
  productIds?: number[];
  weeklyRules?: CreateWeeklyRuleRequest[];
}

export interface PageableResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

@Injectable({ providedIn: 'root' })
export class PromotionsService {
  private baseUrl = `${environment.BASE_URL}/api/promotions`;

  constructor(private http: HttpClient, private auth: AuthService) {}

  // ============ PRIVATE HELPER METHODS ============

  private getAuthHeaders(): HttpHeaders {
    const token =
      localStorage.getItem('access_token') ||
      localStorage.getItem('token') ||
      localStorage.getItem('auth_token') ||
      '';
    return new HttpHeaders({
      Authorization: token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json',
    });
  }

  private doGet<T>(url: string, logLabel = ''): Observable<T> {
    const token =
      localStorage.getItem('access_token') ||
      localStorage.getItem('token') ||
      localStorage.getItem('auth_token') ||
      '';
    const masked = token
      ? `${token.slice(0, 6)}...${token.slice(-4)} (len=${token.length})`
      : 'none';
    console.log(`[PromotionsService] ${logLabel} token:`, masked);
    const headers = new HttpHeaders({
      Authorization: token ? `Bearer ${token}` : '',
    });
    console.log(
      `[PromotionsService] ${logLabel} GET`,
      url,
      'headers present:',
      !!token
    );

    return this.http.get<T>(url, { headers }).pipe(
      tap((res) =>
        console.log(`[PromotionsService] ${logLabel} response:`, res)
      ),
      catchError((err) => {
        console.error(`[PromotionsService] ${logLabel} error:`, err);
        if (
          (err?.status === 401 || err?.status === 403) &&
          localStorage.getItem('refresh_token')
        ) {
          console.log(
            '[PromotionsService] attempting token refresh and retry...'
          );
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
                  '[PromotionsService] refresh succeeded, new token:',
                  newMasked
                );
                const newHeaders = new HttpHeaders({
                  Authorization: newToken ? `Bearer ${newToken}` : '',
                });
                return this.http.get<T>(url, { headers: newHeaders }).pipe(
                  tap((res2) =>
                    console.log(
                      `[PromotionsService] ${logLabel} retry response:`,
                      res2
                    )
                  ),
                  catchError((err2) => {
                    console.error(
                      `[PromotionsService] ${logLabel} retry failed:`,
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

  // ============ CRUD OPERATIONS (ADMIN) ============

  /**
   * Crear una nueva promoción (ADMIN)
   */
  createPromotion(
    request: CreatePromotionRequest
  ): Observable<PromotionDetailResponse> {
    const url = this.baseUrl;
    const headers = this.getAuthHeaders();
    console.log('[PromotionsService] createPromotion POST', url, request);
    return this.http
      .post<PromotionDetailResponse>(url, request, { headers })
      .pipe(
        tap((res) =>
          console.log('[PromotionsService] createPromotion response:', res)
        ),
        catchError((err) => {
          console.error('[PromotionsService] createPromotion error:', err);
          return throwError(() => err);
        })
      );
  }

  /**
   * Obtener promoción por ID
   */
  getPromotionById(id: number): Observable<PromotionDetailResponse> {
    const url = `${this.baseUrl}/${id}`;
    return this.doGet<PromotionDetailResponse>(url, `getPromotionById(${id})`);
  }

  /**
   * Actualizar promoción existente (ADMIN)
   */
  updatePromotion(
    id: number,
    request: UpdatePromotionRequest
  ): Observable<PromotionDetailResponse> {
    const url = `${this.baseUrl}/${id}`;
    const headers = this.getAuthHeaders();
    console.log('[PromotionsService] updatePromotion PUT', url, request);
    return this.http
      .put<PromotionDetailResponse>(url, request, { headers })
      .pipe(
        tap((res) =>
          console.log('[PromotionsService] updatePromotion response:', res)
        ),
        catchError((err) => {
          console.error('[PromotionsService] updatePromotion error:', err);
          return throwError(() => err);
        })
      );
  }

  /**
   * Eliminar promoción (ADMIN)
   */
  deletePromotion(id: number): Observable<void> {
    const url = `${this.baseUrl}/${id}`;
    const headers = this.getAuthHeaders();
    console.log('[PromotionsService] deletePromotion DELETE', url);
    return this.http.delete<void>(url, { headers }).pipe(
      tap(() => console.log('[PromotionsService] deletePromotion success')),
      catchError((err) => {
        console.error('[PromotionsService] deletePromotion error:', err);
        return throwError(() => err);
      })
    );
  }

  /**
   * Cambiar estado de promoción (activar/desactivar) (ADMIN)
   */
  togglePromotionStatus(id: number): Observable<PromotionDetailResponse> {
    const url = `${this.baseUrl}/${id}/status`;
    const headers = this.getAuthHeaders();
    console.log('[PromotionsService] togglePromotionStatus PATCH', url);
    return this.http.patch<PromotionDetailResponse>(url, {}, { headers }).pipe(
      tap((res) =>
        console.log('[PromotionsService] togglePromotionStatus response:', res)
      ),
      catchError((err) => {
        console.error('[PromotionsService] togglePromotionStatus error:', err);
        return throwError(() => err);
      })
    );
  }

  /**
   * Subir imagen de promoción (ADMIN)
   */
  uploadPromotionImage(
    id: number,
    imageFile: File
  ): Observable<PromotionDetailResponse> {
    const url = `${this.baseUrl}/${id}/image`;
    const token =
      localStorage.getItem('access_token') ||
      localStorage.getItem('token') ||
      localStorage.getItem('auth_token') ||
      '';
    const headers = new HttpHeaders({
      Authorization: token ? `Bearer ${token}` : '',
      // Don't set Content-Type for multipart/form-data, browser will set it with boundary
    });

    const formData = new FormData();
    formData.append('imageFile', imageFile);

    console.log('[PromotionsService] uploadPromotionImage PATCH', url);
    return this.http
      .patch<PromotionDetailResponse>(url, formData, { headers })
      .pipe(
        tap((res) =>
          console.log('[PromotionsService] uploadPromotionImage response:', res)
        ),
        catchError((err) => {
          console.error('[PromotionsService] uploadPromotionImage error:', err);
          return throwError(() => err);
        })
      );
  }

  // ============ QUERY OPERATIONS (PUBLIC/CUSTOMER) ============

  /**
   * Obtener todas las promociones con paginación
   */
  getPromotions(
    page: number = 0,
    size: number = 10,
    sort: string = ''
  ): Observable<PageableResponse<PromotionSummaryResponse>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    if (sort) {
      params = params.set('sort', sort);
    }
    const url = `${this.baseUrl}?${params.toString()}`;
    return this.doGet<PageableResponse<PromotionSummaryResponse>>(
      url,
      'getPromotions'
    );
  }

  /**
   * Obtener todas las promociones activas (para clientes)
   */
  getActivePromotions(): Observable<PromotionSummaryResponse[]> {
    const url = `${this.baseUrl}/active`;
    return this.doGet<PromotionSummaryResponse[]>(url, 'getActivePromotions');
  }

  /**
   * Obtener promociones válidas actualmente (activas y en horario válido)
   */
  getCurrentlyValidPromotions(): Observable<PromotionSummaryResponse[]> {
    const url = `${this.baseUrl}/current`;
    return this.doGet<PromotionSummaryResponse[]>(
      url,
      'getCurrentlyValidPromotions'
    );
  }

  /**
   * Obtener promociones por tipo
   */
  getPromotionsByType(
    type: PromotionType
  ): Observable<PromotionSummaryResponse[]> {
    const url = `${this.baseUrl}/type/${type}`;
    return this.doGet<PromotionSummaryResponse[]>(
      url,
      `getPromotionsByType(${type})`
    );
  }

  /**
   * Buscar promociones por nombre
   */
  searchPromotionsByName(name: string): Observable<PromotionSummaryResponse[]> {
    const params = new HttpParams().set('name', name);
    const url = `${this.baseUrl}/search?${params.toString()}`;
    return this.doGet<PromotionSummaryResponse[]>(
      url,
      `searchPromotionsByName(${name})`
    );
  }

  /**
   * Obtener promociones activas por producto
   */
  getActivePromotionsByProduct(
    productId: number
  ): Observable<PromotionSummaryResponse[]> {
    const url = `${this.baseUrl}/product/${productId}`;
    return this.doGet<PromotionSummaryResponse[]>(
      url,
      `getActivePromotionsByProduct(${productId})`
    );
  }

  /**
   * Obtener promociones activas por múltiples productos
   */
  getActivePromotionsByProducts(
    productIds: number[]
  ): Observable<PromotionSummaryResponse[]> {
    const params = new HttpParams().set('productIds', productIds.join(','));
    const url = `${this.baseUrl}/products?${params.toString()}`;
    return this.doGet<PromotionSummaryResponse[]>(
      url,
      'getActivePromotionsByProducts'
    );
  }

  /**
   * Obtener promociones ordenadas por precio ascendente
   */
  getActivePromotionsByPriceAsc(): Observable<PromotionSummaryResponse[]> {
    const url = `${this.baseUrl}/active/price-asc`;
    return this.doGet<PromotionSummaryResponse[]>(
      url,
      'getActivePromotionsByPriceAsc'
    );
  }

  /**
   * Obtener promociones ordenadas por precio descendente
   */
  getActivePromotionsByPriceDesc(): Observable<PromotionSummaryResponse[]> {
    const url = `${this.baseUrl}/active/price-desc`;
    return this.doGet<PromotionSummaryResponse[]>(
      url,
      'getActivePromotionsByPriceDesc'
    );
  }

  /**
   * Obtener promociones por fecha de inicio
   */
  getPromotionsByStartDate(
    date: string
  ): Observable<PromotionSummaryResponse[]> {
    const url = `${this.baseUrl}/start-date/${date}`;
    return this.doGet<PromotionSummaryResponse[]>(
      url,
      `getPromotionsByStartDate(${date})`
    );
  }

  /**
   * Obtener promociones por fecha de fin
   */
  getPromotionsByEndDate(date: string): Observable<PromotionSummaryResponse[]> {
    const url = `${this.baseUrl}/end-date/${date}`;
    return this.doGet<PromotionSummaryResponse[]>(
      url,
      `getPromotionsByEndDate(${date})`
    );
  }

  /**
   * Obtener promociones temporales por rango de fechas
   */
  getTemporaryPromotionsByDateRange(
    startDate: string,
    endDate: string
  ): Observable<PromotionSummaryResponse[]> {
    const params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate);
    const url = `${this.baseUrl}/date-range?${params.toString()}`;
    return this.doGet<PromotionSummaryResponse[]>(
      url,
      'getTemporaryPromotionsByDateRange'
    );
  }

  /**
   * Obtener promociones que expiran pronto
   */
  getPromotionsExpiringSoon(
    startDate: string,
    endDate: string
  ): Observable<PromotionSummaryResponse[]> {
    const params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate);
    const url = `${this.baseUrl}/expiring-soon?${params.toString()}`;
    return this.doGet<PromotionSummaryResponse[]>(
      url,
      'getPromotionsExpiringSoon'
    );
  }

  /**
   * Obtener promociones expiradas
   */
  getExpiredPromotions(): Observable<PromotionSummaryResponse[]> {
    const url = `${this.baseUrl}/expired`;
    return this.doGet<PromotionSummaryResponse[]>(url, 'getExpiredPromotions');
  }

  // ============ COUNT OPERATIONS ============

  /**
   * Contar promociones por tipo
   */
  getPromotionsCountByType(type: PromotionType): Observable<number> {
    const url = `${this.baseUrl}/count/type/${type}`;
    return this.doGet<number>(url, `getPromotionsCountByType(${type})`);
  }

  /**
   * Contar promociones activas por tipo
   */
  getActivePromotionsCountByType(type: PromotionType): Observable<number> {
    const url = `${this.baseUrl}/count/active/type/${type}`;
    return this.doGet<number>(url, `getActivePromotionsCountByType(${type})`);
  }
}
