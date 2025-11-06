import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import Alimento from '../Types/Pedido';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import Recomendacion from '../Types/Recomendacion';

@Injectable({ providedIn: 'root' })
export class ComidasService {
  private _items = new BehaviorSubject<Alimento[]>([]);
  public items$ = this._items.asObservable();
  private _categories = new BehaviorSubject<Recomendacion[]>([]);
  public categories$ = this._categories.asObservable();

  constructor(private http: HttpClient) {}

  getItems(): Alimento[] {
    return this._items.getValue();
  }

  getCategories(): Recomendacion[] {
    return this._categories.getValue();
  }

  setCategories(categories: Recomendacion[]) {
    this._categories.next(categories);
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
        Authorization: `Bearer ${token}`,
      },
    });
    console.log('Token: ', token);
    console.debug('Respuesta API comidas:', response);
    return response;
  }

  loadCategories(): Observable<any> {
    const url = `${environment.BASE_URL}/api/categories`;
    return this.http.get<any>(url);
  }
}
