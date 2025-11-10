import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Alimento } from '../Types/Alimento';

export interface CartItem {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  imagen?: string;
  cantidad: number;
  categoria?: string;
  extras?: string[];
}

@Injectable({ providedIn: 'root' })
export class CartService {
  private _items = new BehaviorSubject<CartItem[]>([]);
  public items$ = this._items.asObservable();

  constructor() {
    try {
      const raw = localStorage.getItem('cart_items');
      if (raw) this._items.next(JSON.parse(raw));
    } catch (e) {
      console.debug('CartService: failed to load cart from storage', e);
    }
  }

  private save() {
    try {
      localStorage.setItem(
        'cart_items',
        JSON.stringify(this._items.getValue())
      );
    } catch (e) {
      console.debug('CartService: failed to save cart to storage', e);
    }
  }

  getItems(): CartItem[] {
    return this._items.getValue().slice();
  }

  clear() {
    this._items.next([]);
    this.save();
  }

  add(alimento: Alimento, quantity: number = 1) {
    const id = String((alimento as any).id ?? alimento.name ?? Math.random());
    const items = this.getItems();
    const idx = items.findIndex((i) => String(i.id) === id);
    if (idx >= 0) {
      items[idx].cantidad += quantity;
    } else {
      const newItem: CartItem = {
        id,
        nombre:
          (alimento as any).name || (alimento as any).nombre || 'Producto',
        descripcion:
          (alimento as any).description || (alimento as any).descripcion || '',
        precio: Number(
          (alimento as any).price ?? (alimento as any).precio ?? 0
        ),
        imagen:
          (alimento as any).imageUrl ||
          (alimento as any).image ||
          (alimento as any).imagen,
        cantidad: quantity,
        categoria:
          (alimento as any).category?.name || (alimento as any).categoria,
        extras: (alimento as any).extras || undefined,
      };
      items.push(newItem);
    }
    this._items.next(items);
    this.save();
  }

  removeById(id: string) {
    const items = this.getItems().filter((i) => String(i.id) !== String(id));
    this._items.next(items);
    this.save();
  }

  increaseQuantity(id: string) {
    const items = this.getItems();
    const idx = items.findIndex((i) => String(i.id) === String(id));
    if (idx >= 0) {
      items[idx].cantidad++;
      this._items.next(items);
      this.save();
    }
  }

  decreaseQuantity(id: string) {
    const items = this.getItems();
    const idx = items.findIndex((i) => String(i.id) === String(id));
    if (idx >= 0) {
      if (items[idx].cantidad > 1) {
        items[idx].cantidad--;
      } else {
        items.splice(idx, 1);
      }
      this._items.next(items);
      this.save();
    }
  }

  get subtotal(): number {
    return this.getItems().reduce((s, it) => s + it.precio * it.cantidad, 0);
  }
}
