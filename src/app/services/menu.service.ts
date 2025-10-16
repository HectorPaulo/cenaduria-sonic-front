import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

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

  add(item: Omit<MenuItem, 'id'>) {
    const items = this.getItems();
    const newItem: MenuItem = { id: this._generateId(), ...item } as MenuItem;
    this._items.next([...items, newItem]);
    return newItem;
  }

  update(id: string, changes: Partial<MenuItem>) {
    const items = this.getItems().map((it) =>
      it.id === id ? { ...it, ...changes } : it
    );
    this._items.next(items);
  }

  remove(id: string) {
    const items = this.getItems().filter((it) => it.id !== id);
    this._items.next(items);
  }

  private _generateId() {
    return 'm' + Math.random().toString(36).slice(2, 9);
  }
}
