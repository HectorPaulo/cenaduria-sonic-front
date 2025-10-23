import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, from } from 'rxjs';
import { environment } from '../../environments/environment';
import { Capacitor } from '@capacitor/core';
import { Http } from '@capacitor-community/http';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private base = environment.BASE_URL;

  constructor(private http: HttpClient) {}

  async nativeGet(url: string) {
    const response = await Http.request({ method: 'GET', url });
    return response;
  }

  get<T>(path: string): Observable<T> {
    const url = `${this.base}${path}`;
    if (Capacitor.getPlatform() !== 'web') {
      return from(this.nativeGet(url).then((r) => r.data as T));
    }
    return this.http.get<T>(url);
  }
  post<T>(path: string, body: any): Observable<T> {
    return this.http.post<T>(`${this.base}${path}`, body);
  }
  put<T>(path: string, body: any): Observable<T> {
    return this.http.put<T>(`${this.base}${path}`, body);
  }
  delete<T>(path: string): Observable<T> {
    return this.http.delete<T>(`${this.base}${path}`);
  }
}
