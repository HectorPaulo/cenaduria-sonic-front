import { Injectable } from '@angular/core';
import {
  BehaviorSubject,
  Observable,
  switchMap,
  of,
  map,
  catchError,
  firstValueFrom,
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
  // Timer id for periodic refresh (ms interval)
  private refreshTimerId: number | null = null;
  // default refresh interval: 60 minutes
  private readonly REFRESH_INTERVAL_MS = 60 * 60 * 1000;

  constructor(private httpAuth: HttpAuthService) {
    // ? Cargar usuario desde localStorage si existe
    this.loadUserFromStorage();
    // If there is an access or refresh token in storage, start the auto-refresh timer
    if (
      localStorage.getItem('access_token') ||
      localStorage.getItem('refresh_token')
    ) {
      this.startAutoRefresh();
    }
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

  logout(): Promise<void> {
    return new Promise((resolve) => {
      const token = localStorage.getItem('access_token');

      // If we have a token, try to invalidate it on the server
      if (token) {
        console.log(
          '[AuthService] Attempting to invalidate token on server...'
        );

        // Set a timeout to ensure logout completes even if server is slow/unreachable
        const timeoutId = setTimeout(() => {
          console.warn(
            '[AuthService] Server logout timeout - proceeding with local logout'
          );
          this.performLocalLogout();
          resolve();
        }, 5000); // 5 second timeout

        this.httpAuth.logout(token).subscribe({
          next: (response) => {
            clearTimeout(timeoutId);
            console.log(
              '[AuthService] ✅ Token invalidated on server:',
              response.message
            );
            this.performLocalLogout();
            resolve();
          },
          error: (error) => {
            clearTimeout(timeoutId);
            console.error(
              '[AuthService] ⚠️ Error invalidating token on server:',
              error
            );

            // Log specific error types for debugging
            if (error.status === 0) {
              console.warn(
                '[AuthService] Network error - server may be unreachable'
              );
            } else if (error.status === 401) {
              console.warn('[AuthService] Token already invalid or expired');
            } else {
              console.warn(
                `[AuthService] Server returned error ${error.status}`
              );
            }

            // Always perform local logout even if server call fails
            console.log(
              '[AuthService] Proceeding with local logout despite server error'
            );
            this.performLocalLogout();
            resolve();
          },
        });
      } else {
        // No token to invalidate, just clear local data
        console.log('[AuthService] No token found - performing local logout');
        this.performLocalLogout();
        resolve();
      }
    });
  }

  /**
   * Performs local logout by clearing all stored data
   * This is separated into its own method to ensure consistency
   */
  private performLocalLogout(): void {
    console.log('[AuthService] Clearing local storage and user session...');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    this.currentUserSubject.next(null);
    this.stopAutoRefresh();
    console.log('[AuthService] ✅ Local logout completed');
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
    // ensure refresh timer is active after login/set user
    this.startAutoRefresh();
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
          // reset/start the auto-refresh timer so next refresh happens after full interval
          try {
            (this as any).startAutoRefresh?.();
          } catch (e) {
            // ignore if method not present for some reason
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

  /**
   * Start periodic refresh of access token using the stored refresh_token.
   * Refresh runs every REFRESH_INTERVAL_MS. Calling startAutoRefresh resets the timer.
   */
  public startAutoRefresh(intervalMs?: number) {
    try {
      const ms = intervalMs ?? this.REFRESH_INTERVAL_MS;
      // clear existing timer if any
      if (this.refreshTimerId) {
        clearInterval(this.refreshTimerId);
        this.refreshTimerId = null;
      }

      // Only start if there's a refresh token present
      if (!localStorage.getItem('refresh_token')) return;

      this.refreshTimerId = window.setInterval(() => {
        this.refreshToken().subscribe((ok) => {
          if (!ok) {
            console.warn('[AuthService] automatic refresh failed');
            // if refresh fails, stop the periodic attempts to avoid pounding the server
            this.stopAutoRefresh();
            // consider logging out the user here if desired
          }
        });
      }, ms);
    } catch (e) {
      console.warn('[AuthService] startAutoRefresh failed', e);
    }
  }

  /** Stop periodic refresh timer */
  public stopAutoRefresh() {
    if (this.refreshTimerId) {
      clearInterval(this.refreshTimerId);
      this.refreshTimerId = null;
    }
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
