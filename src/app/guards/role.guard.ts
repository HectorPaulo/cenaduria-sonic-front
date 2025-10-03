import { Injectable, inject } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService, UserRole } from '../services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class RoleGuard implements CanActivate {
  private authService = inject(AuthService);
  private router = inject(Router);

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const expectedRoles = route.data['roles'] as UserRole[];

    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return false;
    }

    if (expectedRoles && !this.authService.hasAnyRole(expectedRoles)) {
      // Redirigir a la página de inicio apropiada según el rol
      const userRole = this.authService.getUserRole();
      switch (userRole) {
        case UserRole.CLIENTE:
          this.router.navigate(['/cliente/home']);
          break;
        case UserRole.EMPLEADO:
          this.router.navigate(['/empleado/dashboard']);
          break;
        case UserRole.SYSADMIN:
          this.router.navigate(['/admin/dashboard']);
          break;
        default:
          this.router.navigate(['/login']);
      }
      return false;
    }

    return true;
  }
}
