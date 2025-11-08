import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import Promocion from '../Types/Promocion';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PromosService {
  private _items =  new BehaviorSubject<Promocion[]>([]);
  private items$ = this._items.asObservable();

  constructor(private http: HttpClient) {}

  getItems(): Promocion[] {
    return this._items.getValue();
  }

  setItems(items: Promocion[]) {
    this._items.next(items);
  }

  add(item: Promocion) {
    const items = this.getItems();
    this._items.next([...items, item]);
  }

  update(
    indexOrPredicate: number | ((i: Promocion) => boolean),
    partial: Partial<Promocion>
  ) {
    const items = this.getItems().slice();
    if (typeof indexOrPredicate === 'number') {
      items[indexOrPredicate] = {

        ...items[indexOrPredicate],
        ...partial,
      } as Promocion;
    } else {
      const idx = items.findIndex(indexOrPredicate);
      if (idx >= 0) items[idx] = { ...items[idx], ...partial } as Promocion;
    }
    this._items.next(items);
  }

  remove(indexOrPredicate: number | ((i: Promocion) => boolean)) {
    let items = this.getItems().slice();
    if (typeof indexOrPredicate === 'number') {
      items.splice(indexOrPredicate, 1);
    } else {
      items = items.filter((i) => !indexOrPredicate(i));
    }
    this._items.next(items);
  }

  find(predicate: (i: Promocion) => boolean): Promocion | undefined {
    return this.getItems().find(predicate);
  }

  loadFromApi(): Observable<Promocion[]> {
    const url = `${environment.BASE_URL}/api/promotions/active`;
    return this.http.get<Promocion[]>(url);
  }

}
