import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import {
  IonContent,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonButton,
  IonIcon,
  IonGrid,
  IonRow,
  IonCol,
  IonList,
  IonItem,
  IonLabel,
  IonBadge,
} from '@ionic/angular/standalone';
import { AuthService } from '../../services/auth.service';
import { MenuService } from '../../services/menu.service';
import { Alimento } from '../../Types/Alimento';
import { addIcons } from 'ionicons';
import {
  people,
  receipt,
  statsChart,
  settings,
  logOut,
  trendingUp,
  cube,
  cash,
  person,
  add,
  pencil,
} from 'ionicons/icons';
import { HeaderComponent } from 'src/app/components/header/header.component';
import { FabbtnComponent } from 'src/app/components/fabbtn/fabbtn.component';
import { RefresherCustomEvent } from '@ionic/core';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonContent,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonButton,
    IonIcon,
    IonList,
    IonItem,
    IonLabel,
    IonBadge,
    HeaderComponent,
  ],
})
export class AdminDashboardPage implements OnInit {
  editarMenu() {
    this.router.navigate(['/empleado/editar-menu']);
  }
  private authService = inject(AuthService);
  private router = inject(Router);
  private menuService = inject(MenuService);

  user = this.authService.getCurrentUser();
  products: Alimento[] = [];

  constructor() {
    addIcons({
      pencil,
      add,
      logOut,
      people,
      receipt,
      cash,
      cube,
      trendingUp,
      statsChart,
      settings,
      person,
    });
  }

  ngOnInit() {
    if (!this.user) {
      this.router.navigate(['/login']);
      return;
    }

    this.menuService.loadActive().subscribe({
      next: () => (this.products = this.menuService.getItems()),
      error: (e) => console.error('[AdminDashboard] loadActive failed', e),
    });
  }

  doRefresh(event: RefresherCustomEvent) {
    setTimeout(() => {
      // TODO: Implementar la lógica para mandar a llamar a los datos actualizacos
      event.target.complete();
    }, 2000);
  }

  navigateTo(route: string) {
    this.router.navigate([`/admin/${route}`]);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
