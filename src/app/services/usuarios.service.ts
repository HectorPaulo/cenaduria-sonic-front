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
    // kept for backward compatibility; ignores username and fetches current profile
    return this.getProfile();
  }

  getProfile(): Observable<UsuarioResponse> {
    const url = `${environment.BASE_URL}/api/profile`;
    const token =
      localStorage.getItem('access_token') ||
      localStorage.getItem('token') ||
      '';
    return this.http.get<UsuarioResponse>(url, {
      headers: {
        Authorization: token ? `Bearer ${token}` : '',
      },
    });
  }

  updatePassword(payload: {
    currentPassword: string;
    newPassword: string;
    confirmNewPassword: string;
  }): Observable<any> {
    const url = `${environment.BASE_URL}/api/profile/password`;
    const token =
      localStorage.getItem('access_token') ||
      localStorage.getItem('token') ||
      '';
    return this.http.put<any>(url, payload, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: token ? `Bearer ${token}` : '',
      },
    });
  }

  updateAvatar(form: FormData): Observable<any> {
    const url = `${environment.BASE_URL}/api/profile/avatar`;
    const token =
      localStorage.getItem('access_token') ||
      localStorage.getItem('token') ||
      '';
    // Do not set Content-Type for multipart; browser will set the boundary
    return this.http.put<any>(url, form, {
      headers: {
        Authorization: token ? `Bearer ${token}` : '',
      },
    });
  }
}
