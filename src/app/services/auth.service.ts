import { Injectable } from '@angular/core';
import {
  BehaviorSubject,
  Observable,
  switchMap,
  of,
  map,
  catchError,
} from 'rxjs';
import {
  HttpAuthService,
  LoginResponse,
  ProfileResponse,
} from './http-auth.service';
import { tap } from 'rxjs/operators';

export enum UserRole {
  CLIENTE = 'cliente',
  EMPLEADO = 'empleado',
  SYSADMIN = 'sysadmin',
}

export interface User {
  id: string;
  nombre: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private httpAuth: HttpAuthService) {
    // ? Cargar usuario desde localStorage si existe
    this.loadUserFromStorage();
  }

  loginRemote(username: string, password: string): Observable<User | null> {
    return this.httpAuth.login(username, password).pipe(
      switchMap((res: LoginResponse) => {
        if (!res || !res.accessToken) {
          console.warn('[AuthService] login returned no accessToken', res);
          return of(null);
        }

        localStorage.setItem('access_token', res.accessToken);
        if (res.refreshToken) {
          localStorage.setItem('refresh_token', res.refreshToken);
        }

        return this.httpAuth.getProfile().pipe(
          map((profile: ProfileResponse) => {
            if (!profile) {
              console.warn(
                '[AuthService] profile endpoint returned empty profile'
              );
              return null;
            }

            const roleFromProfile = Array.isArray((profile as any).roles)
              ? (profile as any).roles
              : undefined;
            const normalizedRole = this.normalizeRole(roleFromProfile as any);

            const user: User = {
              id: String((profile as any).id),
              nombre:
                (profile as any).name || (profile as any).username || 'Usuario',
              email: (profile as any).email || '',
              role: normalizedRole,
              avatar: (profile as any).avatarUrl || (profile as any).avatar,
            };
            this.setCurrentUser(user);
            return user;
          }),
          catchError((err) => {
            console.error('[AuthService] getProfile failed', err);
            if (res.user) {
              try {
                const fallbackRole = this.normalizeRole(
                  res.user?.role || res.user?.rol
                );
                const user: User = {
                  id: res.user.id || res.user.username || 'unknown',
                  nombre:
                    res.user.nombre ||
                    res.user.username ||
                    res.user.email ||
                    'Usuario',
                  email: res.user.email || '',
                  role: fallbackRole,
                  avatar: res.user.avatar,
                };
                this.setCurrentUser(user);
                return of(user);
              } catch (e) {
                return of(null);
              }
            }
            return of(null);
          })
        );
      })
    );
  }

  // * Simular diferentes tipos de usuarios para testing
  // ! Eliminar función cuando se use la API real
  login(userType: UserRole): Promise<User> {
    return new Promise((resolve) => {
      let user: User;

      switch (userType) {
        case UserRole.CLIENTE:
          user = {
            id: '1',
            nombre: 'Juan Cliente',
            email: 'cliente@example.com',
            role: UserRole.CLIENTE,
            avatar: 'assets/avatars/cliente.png',
          };
          break;

        case UserRole.EMPLEADO:
          user = {
            id: '2',
            nombre: 'Papu Gómez',
            email: 'empleado@example.com',
            role: UserRole.EMPLEADO,
            avatar: 'assets/avatars/empleado.png',
          };
          break;

        case UserRole.SYSADMIN:
          user = {
            id: '3',
            nombre: 'Admin Sistema',
            email: 'admin@example.com',
            role: UserRole.SYSADMIN,
            avatar: 'assets/avatars/admin.png',
          };
          break;
      }

      this.setCurrentUser(user);
      resolve(user);
    });
  }

  logout(): void {
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  getUserRole(): UserRole | null {
    const user = this.getCurrentUser();
    return user ? user.role : null;
  }

  isLoggedIn(): boolean {
    return this.getCurrentUser() !== null;
  }

  hasRole(role: UserRole): boolean {
    const userRole = this.getUserRole();
    return userRole === role;
  }

  hasAnyRole(roles: UserRole[]): boolean {
    const userRole = this.getUserRole();
    return userRole ? roles.includes(userRole) : false;
  }

  canViewAdminPanel(): boolean {
    return this.hasRole(UserRole.SYSADMIN);
  }

  canManageOrders(): boolean {
    return this.hasAnyRole([UserRole.EMPLEADO, UserRole.SYSADMIN]);
  }

  canPlaceOrders(): boolean {
    return this.hasAnyRole([
      UserRole.CLIENTE,
      UserRole.EMPLEADO,
      UserRole.SYSADMIN,
    ]);
  }

  canViewReports(): boolean {
    return this.hasAnyRole([UserRole.EMPLEADO, UserRole.SYSADMIN]);
  }

  canManageUsers(): boolean {
    return this.hasRole(UserRole.SYSADMIN);
  }

  public setCurrentUser(user: User): void {
    localStorage.setItem('currentUser', JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  public getCurrentToken(): string | null {
    return localStorage.getItem('access_token');
  }

  public refreshToken(): Observable<boolean> {
    const refresh = localStorage.getItem('refresh_token');
    if (!refresh) {
      console.warn('[AuthService] no refresh_token available');
      return of(false);
    }

    return this.httpAuth.refresh(refresh).pipe(
      map((res: LoginResponse) => {
        if (res?.accessToken) {
          localStorage.setItem('access_token', res.accessToken);
          if (res.refreshToken) {
            localStorage.setItem('refresh_token', res.refreshToken);
          }
          return true;
        }
        return false;
      }),
      catchError((err) => {
        console.error('[AuthService] refreshToken failed', err);
        return of(false);
      })
    );
  }

  private normalizeRole(raw?: string | string[]): UserRole {
    if (!raw) return UserRole.CLIENTE;
    if (Array.isArray(raw)) {
      const r = raw.map((s) => String(s).toLowerCase());
      if (r.some((x) => x.includes('admin'))) return UserRole.SYSADMIN;
      if (r.some((x) => x.includes('emple') || x.includes('employee')))
        return UserRole.EMPLEADO;
      if (r.some((x) => x.includes('client') || x.includes('cliente')))
        return UserRole.CLIENTE;
      return UserRole.CLIENTE;
    }

    const r = String(raw).toLowerCase();
    if (r.includes('admin')) return UserRole.SYSADMIN;
    if (r.includes('emple') || r.includes('employee')) return UserRole.EMPLEADO;
    if (r.includes('client') || r.includes('cliente')) return UserRole.CLIENTE;
    return UserRole.CLIENTE;
  }

  private loadUserFromStorage(): void {
    const userStr = localStorage.getItem('currentUser');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        this.currentUserSubject.next(user);
      } catch (error) {
        console.error('Error parsing user from storage:', error);
        localStorage.removeItem('currentUser');
      }
    }
  }
}
