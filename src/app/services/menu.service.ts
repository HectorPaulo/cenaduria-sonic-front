import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, tap, catchError, of } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
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
}
