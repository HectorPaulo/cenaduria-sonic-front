import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonButton,
  IonIcon,
  IonText,
} from '@ionic/angular/standalone';
import { AuthService, UserRole } from '../services/auth.service';
import { addIcons } from 'ionicons';
import { person, briefcase, settings, logIn } from 'ionicons/icons';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonIcon,
    IonText,
  ],
})
export class LoginPage {
  private authService = inject(AuthService);
  private router = inject(Router);

  // Exponer enum para uso en template
  UserRole = UserRole;

  constructor() {
    addIcons({ person, briefcase, settings, logIn });
  }

  async loginAs(role: UserRole) {
    try {
      await this.authService.login(role);

      // Redirigir según el rol
      switch (role) {
        case UserRole.CLIENTE:
          this.router.navigate(['/cliente/home']);
          break;
        case UserRole.EMPLEADO:
          this.router.navigate(['/empleado/dashboard']);
          break;
        case UserRole.SYSADMIN:
          this.router.navigate(['/admin/dashboard']);
          break;
      }
    } catch (error) {
      console.error('Error during login:', error);
    }
  }
}
