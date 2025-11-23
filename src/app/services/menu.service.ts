import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, tap, catchError, of } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

export interface MenuItem {
  id: string;
  nombre: string;
  descripcion?: string;
  precio: number;
  disponible?: boolean;
  categoria?: string;
  imagen?: string;
}

@Injectable({ providedIn: 'root' })
export class MenuService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);

  private _items = new BehaviorSubject<MenuItem[]>([
    {
      id: 'p1',
      nombre: 'Albóndigas Clásicas',
      descripcion: 'Jugosas albóndigas con salsa casera',
      precio: 8.99,
      disponible: true,
      categoria: 'comida',
    },
    {
      id: 'p2',
      nombre: 'Hamburguesa con Queso',
      descripcion: 'Carne, queso y aderezos',
      precio: 7.99,
      disponible: true,
      categoria: 'comida',
    },
  ]);

  get items$(): Observable<MenuItem[]> {
    return this._items.asObservable();
  }

  getItems(): MenuItem[] {
    return this._items.getValue();
  }
  // Load all products from backend and populate the BehaviorSubject
  loadAll() {
    const url = `${environment.BASE_URL}/api/products`;
    return this.http.get<any[]>(url).pipe(
      tap((list) => {
        const mapped = (list || []).map((p) => this.mapToMenuItem(p));
        this._items.next(mapped);
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
    return this.http.get<any[]>(url, { headers }).pipe(
      tap((list) => {
        const mapped = (list || []).map((p) => this.mapToMenuItem(p));
        this._items.next(mapped);
      }),
      catchError((err) => {
        console.error('[MenuService] loadActive failed', err);
        return of([]);
      })
    );
  }

  // Create product (multipart/form-data)
  addRemote(payload: {
    nombre: string;
    descripcion?: string;
    precio: number;
    disponible?: boolean;
    categoria?: string | number;
    file?: File | null;
  }) {
    const url = `${environment.BASE_URL}/api/products`;
    const fd = new FormData();
    fd.append('name', payload.nombre);
    fd.append('price', String(payload.precio));
    fd.append('active', String(!!payload.disponible));
    const catId = Number(payload.categoria) || 1;
    fd.append('categoryId', String(catId));
    if (payload.file) {
      fd.append('image', payload.file, payload.file.name);
    }

    const token = this.auth.getCurrentToken();
    const headers = token
      ? new HttpHeaders({ Authorization: `Bearer ${token}` })
      : undefined;

    return this.http.post<any>(url, fd, { headers }).pipe(
      tap((res) => {
        const added = this.mapToMenuItem(res);
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
    id: string,
    changes: Partial<MenuItem> & { categoria?: string | number }
  ) {
    const url = `${environment.BASE_URL}/api/products/${id}`;
    const body: any = {
      name: changes.nombre,
      price: changes.precio,
      active: changes.disponible,
      categoryId: Number(changes.categoria) || undefined,
    };

    const token = this.auth.getCurrentToken();
    const headers = token
      ? new HttpHeaders({
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        })
      : new HttpHeaders({ 'Content-Type': 'application/json' });

    return this.http.put<any>(url, body, { headers }).pipe(
      tap((res) => {
        const updated = this.mapToMenuItem(res);
        const items = this.getItems().map((it) =>
          it.id === id ? { ...it, ...updated } : it
        );
        this._items.next(items);
      }),
      catchError((err) => {
        console.error('[MenuService] updateRemote failed', err);
        throw err;
      })
    );
  }

  // Delete product
  deleteRemote(id: string) {
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

  /** Map backend product shape to MenuItem used in the app */
  private mapToMenuItem(p: any): MenuItem {
    return {
      id: String(p.id ?? p.productId ?? p._id ?? this._generateId()),
      nombre: p.name ?? p.nombre ?? 'Sin nombre',
      descripcion: p.description ?? p.descripcion ?? '',
      precio: Number(p.price ?? p.precio ?? 0),
      disponible: p.active ?? p.disponible ?? false,
      categoria: String(p.categoryId ?? p.categoria ?? ''),
      imagen: p.imageUrl ?? p.image ?? p.imagen ?? '',
    } as MenuItem;
  }

  private _generateId() {
    return 'm' + Math.random().toString(36).slice(2, 9);
  }
}
