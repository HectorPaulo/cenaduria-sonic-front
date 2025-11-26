import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, tap, catchError, of } from 'rxjs';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';
import { Alimento } from '../Types/Alimento';

@Injectable({ providedIn: 'root' })
export class MenuService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);

  private _items = new BehaviorSubject<Alimento[]>([]);

  get items$(): Observable<Alimento[]> {
    return this._items.asObservable();
  }

  getItems(): Alimento[] {
    return this._items.getValue();
  }

  // Load all products from backend and populate the BehaviorSubject
  loadAll() {
    const url = `${environment.BASE_URL}/api/products/all`;
    return this.http.get<Alimento[]>(url).pipe(
      tap((list) => {
        this._items.next(list || []);
      }),
      catchError((err) => {
        console.error('[MenuService] loadAll failed', err);
        return of([]);
      })
    );
  }

  // Load only active products
  loadActive() {
    const url = `${environment.BASE_URL}/api/products/active`;
    const token = this.auth.getCurrentToken();
    const headers = token
      ? new HttpHeaders({ Authorization: `Bearer ${token}` })
      : undefined;
    return this.http.get<Alimento[]>(url, { headers }).pipe(
      tap((list) => {
        this._items.next(list || []);
      }),
      catchError((err) => {
        console.error('[MenuService] loadActive failed', err);
        return of([]);
      })
    );
  }

  // Create product (multipart/form-data)
  addRemote(payload: {
    name: string;
    price: number;
    active: boolean;
    categoryId: number;
    file?: File | null;
  }) {
    const url = `${environment.BASE_URL}/api/products`;
    const fd = new FormData();
    fd.append('name', payload.name);
    fd.append('price', String(payload.price));
    fd.append('active', String(payload.active));
    fd.append('categoryId', String(payload.categoryId));
    if (payload.file) {
      fd.append('image', payload.file, payload.file.name);
    }

    const token = this.auth.getCurrentToken();
    const headers = token
      ? new HttpHeaders({ Authorization: `Bearer ${token}` })
      : undefined;

    return this.http.post<Alimento>(url, fd, { headers }).pipe(
      tap((added) => {
        this._items.next([...this.getItems(), added]);
        // Clear cache since product count changed
        this.clearCountCache();
      }),
      catchError((err) => {
        console.error('[MenuService] addRemote failed', err);
        throw err;
      })
    );
  }

  // Update product (JSON PUT)
  updateRemote(
    id: number,
    changes: Partial<Alimento> & { categoryId?: number }
  ) {
    const url = `${environment.BASE_URL}/api/products/${id}`;

    // Extract categoryId from either the explicit field or the Alimento category object
    const catId = changes.categoryId ?? changes.category?.id;

    const body: any = {
      name: changes.name,
      price: changes.price,
      active: changes.active,
      categoryId: catId,
    };

    const token = this.auth.getCurrentToken();
    const headers = token
      ? new HttpHeaders({
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        })
      : new HttpHeaders({ 'Content-Type': 'application/json' });

    return this.http.put<Alimento>(url, body, { headers }).pipe(
      tap((updated) => {
        const items = this.getItems().map((it) =>
          it.id === id ? updated : it
        );
        this._items.next(items);
        // Clear cache if category changed
        this.clearCountCache();
      }),
      catchError((err) => {
        console.error('[MenuService] updateRemote failed', err);
        throw err;
      })
    );
  }

  // Update product image (PATCH multipart/form-data)
  updateImage(id: number, file: File) {
    const url = `${environment.BASE_URL}/api/products/${id}/image`;
    const fd = new FormData();
    fd.append('image', file, file.name);

    const token = this.auth.getCurrentToken();
    const headers = token
      ? new HttpHeaders({ Authorization: `Bearer ${token}` })
      : undefined;

    return this.http.patch<Alimento>(url, fd, { headers }).pipe(
      tap((updated) => {
        const items = this.getItems().map((it) =>
          it.id === id ? updated : it
        );
        this._items.next(items);
      }),
      catchError((err) => {
        console.error('[MenuService] updateImage failed', err);
        throw err;
      })
    );
  }

  // Delete product
  deleteRemote(id: number) {
    const url = `${environment.BASE_URL}/api/products/${id}`;
    const token = this.auth.getCurrentToken();
    const headers = token
      ? new HttpHeaders({ Authorization: `Bearer ${token}` })
      : undefined;
    return this.http.delete<any>(url, { headers }).pipe(
      tap(() => {
        const items = this.getItems().filter((it) => it.id !== id);
        this._items.next(items);
        // Clear cache since product count changed
        this.clearCountCache();
      }),
      catchError((err) => {
        console.error('[MenuService] deleteRemote failed', err);
        throw err;
      })
    );
  }

  // Get categories
  getCategories() {
    const url = `${environment.BASE_URL}/api/categories`;
    const token = this.auth.getCurrentToken();
    const headers = token
      ? new HttpHeaders({ Authorization: `Bearer ${token}` })
      : undefined;
    return this.http.get<any[]>(url, { headers }).pipe(
      catchError((err) => {
        console.error('[MenuService] getCategories failed', err);
        return of([]);
      })
    );
  }

  // ========== NEW ENDPOINTS ==========

  // Simple cache for count endpoints (5 minutes TTL)
  private countCache = new Map<string, { value: number; timestamp: number }>();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  private getCachedCount(key: string): number | null {
    const cached = this.countCache.get(key);
    if (!cached) return null;

    const now = Date.now();
    if (now - cached.timestamp > this.CACHE_TTL) {
      this.countCache.delete(key);
      return null;
    }

    return cached.value;
  }

  private setCachedCount(key: string, value: number): void {
    this.countCache.set(key, { value, timestamp: Date.now() });
  }

  /**
   * Clear all cached counts
   * Call this after creating/deleting/updating products
   */
  clearCountCache(): void {
    this.countCache.clear();
  }

  // Get product by ID
  getProductById(id: number): Observable<Alimento> {
    const url = `${environment.BASE_URL}/api/products/${id}`;
    const token = this.auth.getCurrentToken();
    const headers = token
      ? new HttpHeaders({ Authorization: `Bearer ${token}` })
      : undefined;

    return this.http.get<Alimento>(url, { headers }).pipe(
      catchError((err) => {
        console.error('[MenuService] getProductById failed', err);
        throw err;
      })
    );
  }

  // Toggle product status (active/inactive)
  toggleProductStatus(id: number, active: boolean): Observable<Alimento> {
    const url = `${environment.BASE_URL}/api/products/${id}/status?active=${active}`;
    const token = this.auth.getCurrentToken();
    const headers = token
      ? new HttpHeaders({ Authorization: `Bearer ${token}` })
      : undefined;

    return this.http.patch<Alimento>(url, {}, { headers }).pipe(
      tap((updated) => {
        // Update local state
        const items = this.getItems().map((it) =>
          it.id === id ? updated : it
        );
        this._items.next(items);
        // Clear cache since counts may have changed
        this.clearCountCache();
      }),
      catchError((err) => {
        console.error('[MenuService] toggleProductStatus failed', err);
        throw err;
      })
    );
  }

  // Get active product by ID (for validation)
  getActiveProductById(id: number): Observable<Alimento> {
    const url = `${environment.BASE_URL}/api/products/${id}/active`;
    return this.http.get<Alimento>(url).pipe(
      catchError((err) => {
        console.error('[MenuService] getActiveProductById failed', err);
        throw err;
      })
    );
  }

  // Search products by name
  searchProducts(searchTerm: string): Observable<Alimento[]> {
    const url = `${
      environment.BASE_URL
    }/api/products/search?name=${encodeURIComponent(searchTerm)}`;
    const token = this.auth.getCurrentToken();
    const headers = token
      ? new HttpHeaders({ Authorization: `Bearer ${token}` })
      : undefined;

    return this.http.get<Alimento[]>(url, { headers }).pipe(
      catchError((err) => {
        console.error('[MenuService] searchProducts failed', err);
        return of([]);
      })
    );
  }

  // Advanced search with filters
  searchProductsAdvanced(filters: {
    name?: string;
    categoryId?: number;
    active?: boolean;
  }): Observable<Alimento[]> {
    let params = new HttpParams();

    if (filters.name) {
      params = params.set('name', filters.name);
    }
    if (filters.categoryId !== undefined) {
      params = params.set('categoryId', filters.categoryId.toString());
    }
    if (filters.active !== undefined) {
      params = params.set('active', filters.active.toString());
    }

    const url = `${environment.BASE_URL}/api/products/search/advanced`;
    const token = this.auth.getCurrentToken();
    const headers = token
      ? new HttpHeaders({ Authorization: `Bearer ${token}` })
      : undefined;

    return this.http.get<Alimento[]>(url, { headers, params }).pipe(
      catchError((err) => {
        console.error('[MenuService] searchProductsAdvanced failed', err);
        return of([]);
      })
    );
  }

  // Count products by category (with cache)
  countProductsByCategory(categoryId: number): Observable<number> {
    const cacheKey = `count_${categoryId}`;
    const cached = this.getCachedCount(cacheKey);

    if (cached !== null) {
      console.log(
        `[MenuService] Using cached count for category ${categoryId}`
      );
      return of(cached);
    }

    const url = `${environment.BASE_URL}/api/products/category/${categoryId}/count`;
    const token = this.auth.getCurrentToken();
    const headers = token
      ? new HttpHeaders({ Authorization: `Bearer ${token}` })
      : undefined;

    return this.http.get<number>(url, { headers }).pipe(
      tap((count) => {
        this.setCachedCount(cacheKey, count);
      }),
      catchError((err) => {
        console.error('[MenuService] countProductsByCategory failed', err);
        return of(0);
      })
    );
  }

  // Count active products by category (with cache)
  countActiveProductsByCategory(categoryId: number): Observable<number> {
    const cacheKey = `count_active_${categoryId}`;
    const cached = this.getCachedCount(cacheKey);

    if (cached !== null) {
      console.log(
        `[MenuService] Using cached active count for category ${categoryId}`
      );
      return of(cached);
    }

    const url = `${environment.BASE_URL}/api/products/category/${categoryId}/count/active`;
    return this.http.get<number>(url).pipe(
      tap((count) => {
        this.setCachedCount(cacheKey, count);
      }),
      catchError((err) => {
        console.error(
          '[MenuService] countActiveProductsByCategory failed',
          err
        );
        return of(0);
      })
    );
  }
}
