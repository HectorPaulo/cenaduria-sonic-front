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
  IonBadge,
  IonItem,
  IonLabel,
  IonList,
  IonCardSubtitle,
  IonRefresher,
  IonRefresherContent,
  RefresherEventDetail,
} from '@ionic/angular/standalone';
import { AuthService } from '../../services/auth.service';
import { MenuService } from '../../services/menu.service';
import { Alimento } from '../../Types/Alimento';
import { PedidosService } from 'src/app/services/empleados/pedidos-service';
import { addIcons } from 'ionicons';
import {
  receipt,
  cube,
  people,
  statsChart,
  logOut,
  notifications,
  person,
} from 'ionicons/icons';
import { HeaderComponent } from 'src/app/components/header/header.component';
import { IonRefresherCustomEvent } from '@ionic/core';
import { FabbtnComponent } from 'src/app/components/fabbtn/fabbtn.component';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone: true,
  imports: [
    IonRefresherContent,
    IonRefresher,
    IonCardTitle,
    IonList,
    CommonModule,
    IonContent,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonButton,
    IonIcon,
    IonBadge,
    IonItem,
    IonLabel,
    HeaderComponent,
  ],
})
export class DashboardPage implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  private menuService = inject(MenuService);
  private pedidosService = inject(PedidosService);

  user = this.authService.getCurrentUser();

  products: Alimento[] = [];
  pendingOrders = 0;
  activeProductsCount = 0;

  doRefresh($event: IonRefresherCustomEvent<RefresherEventDetail>) {
    this.menuService.loadActive().subscribe({
      next: () => $event.detail.complete(),
      error: () => $event.detail.complete(),
    });
  }

  constructor() {
    addIcons({
      person,
      receipt,
      cube,
      people,
      statsChart,
      logOut,
      notifications,
    });
  }

  ngOnInit() {
    if (!this.user) {
      this.router.navigate(['/login']);
      return;
    }

    // cargar productos activos
    this.menuService.loadActive().subscribe({
      next: () => {
        this.products = this.menuService.getItems();
        this.activeProductsCount = this.products.length;
      },
      error: (e) => console.error('[EmpleadoDashboard] loadActive failed', e),
    });

    // cargar número de pedidos pendientes (no inventado)
    this.pedidosService.getOrdersByStatusPaged('PENDIENTE').subscribe({
      next: (res: any) => {
        const list = Array.isArray(res)
          ? res
          : res?.content || res?.data || res || [];
        this.pendingOrders = Array.isArray(list) ? list.length : 0;
      },
      error: (err) => {
        console.error('[EmpleadoDashboard] load pending orders failed', err);
        this.pendingOrders = 0;
      },
    });
  }

  navigateTo(route: string) {
    this.router.navigate([`/empleado/${route}`]);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  getEstadoColor(estado: string): string {
    switch (estado) {
      case 'Pendiente':
        return 'warning';
      case 'En preparación':
        return 'primary';
      case 'Listo':
        return 'success';
      default:
        return 'medium';
    }
  }

  editarMenu() {
    this.router.navigate(['/empleado/editar-menu']);
  }

  goToEdit() {
    this.router.navigate(['/empleado/editar-menu']);
  }
}
