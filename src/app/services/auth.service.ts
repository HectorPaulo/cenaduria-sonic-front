import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

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

  constructor() {
    // Cargar usuario desde localStorage si existe
    this.loadUserFromStorage();
  }

  // Simular diferentes tipos de usuarios para testing
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
            nombre: 'María',
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

  // Permisos específicos según rol
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

  private setCurrentUser(user: User): void {
    localStorage.setItem('currentUser', JSON.stringify(user));
    this.currentUserSubject.next(user);
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
