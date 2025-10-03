import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {
  IonFabButton,
  IonFab,
  IonFabList,
  IonIcon,
} from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { addIcons } from 'ionicons';
import {
  chevronUpCircle,
  person,
  colorPalette,
  chevronDownCircle,
  chevronForwardCircle,
  globe,
  moon,
  sunny,
  home,
  logOut,
} from 'ionicons/icons';
import { ThemeService } from 'src/app/services/theme.service';
import { AuthService, UserRole } from 'src/app/services/auth.service';

@Component({
  selector: 'app-fabbtn',
  templateUrl: './fabbtn.component.html',
  styleUrls: ['./fabbtn.component.scss'],
  imports: [CommonModule, IonIcon, IonFabList, IonFab, IonFabButton],
})
export class FabbtnComponent implements OnInit {
  private router = inject(Router);
  private authService = inject(AuthService);

  currentUser = this.authService.getCurrentUser();

  navigateToPerfil() {
    const userRole = this.authService.getUserRole();
    switch (userRole) {
      case UserRole.CLIENTE:
        this.router.navigate(['/cliente/perfil']);
        break;
      case UserRole.EMPLEADO:
        this.router.navigate(['/empleado/perfil']);
        break;
      case UserRole.SYSADMIN:
        this.router.navigate(['/admin/perfil']);
        break;
      default:
        this.router.navigate(['/login']);
    }
  }

  navigateToHome() {
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
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  onThemeToggle() {
    this.themeService.toggleTheme();
  }

  constructor(public themeService: ThemeService) {
    addIcons({
      chevronUpCircle,
      person,
      colorPalette,
      chevronDownCircle,
      chevronForwardCircle,
      globe,
      moon,
      sunny,
      home,
      logOut,
    });
  }

  ngOnInit() {
    // Actualizar usuario si cambia
    this.authService.currentUser$.subscribe((user) => {
      this.currentUser = user;
    });
  }
}
