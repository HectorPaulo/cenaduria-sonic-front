import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';

export interface UsuarioResponse {
  id: number | string;
  username: string;
  email: string;
  name: string;
  roles?: string[];
  avatarUrl?: string;
  registerDate?: string;
}

@Injectable({
  providedIn: 'root',
})
export class Usuarios {
  constructor(private http: HttpClient) {}

  getUserData(username: string): Observable<UsuarioResponse> {
    const url = `${environment.BASE_URL}/api/profile`;
    const token = localStorage.getItem('access_token');
    return this.http.get<UsuarioResponse>(url, {
      headers: {
        Authorization: token ? `Bearer ${token}` : '',
      },
    });
  }
}
