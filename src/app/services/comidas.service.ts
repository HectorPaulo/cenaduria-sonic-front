import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import Alimento from '../Types/Pedido';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class ComidasService {
  private _items = new BehaviorSubject<Alimento[]>([]);
  public items$ = this._items.asObservable();

  constructor(private http: HttpClient) {}

  getItems(): Alimento[] {
    return this._items.getValue();
  }

  setItems(items: Alimento[]) {
    this._items.next(items);
  }

  add(item: Alimento) {
    const items = this.getItems();
    this._items.next([...items, item]);
  }

  update(
    indexOrPredicate: number | ((i: Alimento) => boolean),
    partial: Partial<Alimento>
  ) {
    const items = this.getItems().slice();
    if (typeof indexOrPredicate === 'number') {
      items[indexOrPredicate] = {
        ...items[indexOrPredicate],
        ...partial,
      } as Alimento;
    } else {
      const idx = items.findIndex(indexOrPredicate);
      if (idx >= 0) items[idx] = { ...items[idx], ...partial } as Alimento;
    }
    this._items.next(items);
  }

  remove(indexOrPredicate: number | ((i: Alimento) => boolean)) {
    let items = this.getItems().slice();
    if (typeof indexOrPredicate === 'number') {
      items.splice(indexOrPredicate, 1);
    } else {
      items = items.filter((i) => !indexOrPredicate(i));
    }
    this._items.next(items);
  }

  find(predicate: (i: Alimento) => boolean): Alimento | undefined {
    return this.getItems().find(predicate);
  }

  loadFromApi(): Observable<Alimento[]> {
    const url = `${environment.BASE_URL}/api/products/active`;
    const token = localStorage.getItem('access_token');
    const response = this.http.get<Alimento[]>(url, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response;
  }
}
