import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Capacitor } from '@capacitor/core';

export interface LoginResponse {
  accessToken: string;
  refreshToken?: string;
  user?: any;
}

export interface ProfileResponse {
  id: number | string;
  username: string;
  email: string;
  name: string;
  avatarUrl?: string;
  registerDate?: string;
  roles?: string[];
}

@Injectable({ providedIn: 'root' })
export class HttpAuthService {
  constructor(private http: HttpClient) {}

  login(username: string, password: string): Observable<LoginResponse> {
    const url = `${environment.BASE_URL}/api/auth/login`;
    console.debug('[HttpAuthService] POST', url, { username });
    return this.http.post<LoginResponse>(url, { username, password });
  }

  getProfile(): Observable<ProfileResponse> {
    const url = `${environment.BASE_URL}/api/profile`;
    console.debug('[HttpAuthService] GET profile', url);
    return this.http.get<ProfileResponse>(url);
  }

  refresh(refreshToken: string | null): Observable<LoginResponse> {
    const url = `${environment.BASE_URL}/api/auth/refresh`;
    console.debug('[HttpAuthService] POST refresh', url, {
      hasRefresh: !!refreshToken,
    });
    return this.http.post<LoginResponse>(url, { refreshToken });
  }

  register(payload: any, adminToken?: string | null): Observable<any> {
    const url = `${environment.BASE_URL}/api/auth/register`;
    const headers: any = {};
    if (adminToken) {
      headers.Authorization = `Bearer ${adminToken}`;
    }
    console.debug('[HttpAuthService] POST register', url, {
      hasToken: !!adminToken,
    });
    return this.http.post<any>(url, payload, { headers });
  }

  getDiagnostics(): { baseUrl: string; platform?: string } {
    const baseUrl = String(environment.BASE_URL);
    let platform: string | undefined;
    try {
      platform = Capacitor.getPlatform();
    } catch (e) {
      platform = undefined;
    }
    return { baseUrl, platform };
  }
}
