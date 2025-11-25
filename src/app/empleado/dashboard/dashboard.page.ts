import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import {
  IonContent,
  IonCard,
  IonCardContent,
  IonIcon,
  IonRefresher,
  IonRefresherContent,
  RefresherEventDetail,
} from '@ionic/angular/standalone';
import { AuthService } from '../../services/auth.service';
import { MenuService } from '../../services/menu.service';
import { Alimento } from '../../Types/Alimento';
import { PedidosService } from 'src/app/services/empleados/pedidos-service';
import { NotificationService } from 'src/app/services/notification.service';
import { NotificationType } from 'src/app/Types/websocket.types';
import { Subscription } from 'rxjs';
import { addIcons } from 'ionicons';
import {
  receipt,
  cube,
  people,
  statsChart,
  logOut,
  notifications,
  person,
  pricetag,
  personAdd,
} from 'ionicons/icons';
import { HeaderComponent } from 'src/app/components/header/header.component';
import { IonRefresherCustomEvent } from '@ionic/core';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone: true,
  imports: [
    IonRefresherContent,
    IonRefresher,
    CommonModule,
    IonContent,
    IonCard,
    IonCardContent,
    IonIcon,
    HeaderComponent,
  ],
})
export class DashboardPage implements OnInit, OnDestroy {
  private authService = inject(AuthService);
  private router = inject(Router);
  private menuService = inject(MenuService);
  private pedidosService = inject(PedidosService);
  private notificationService = inject(NotificationService);
  private notificationSubscription?: Subscription;

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
      pricetag,
      personAdd,
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

    // Subscribe to real-time notifications
    this.subscribeToNotifications();
  }

  ngOnDestroy() {
    // Clean up subscription
    if (this.notificationSubscription) {
      this.notificationSubscription.unsubscribe();
    }
  }

  /**
   * Subscribe to real-time notifications and update dashboard
   */
  private subscribeToNotifications(): void {
    this.notificationSubscription =
      this.notificationService.notifications$.subscribe((notifications) => {
        if (notifications.length > 0) {
          const latestNotification = notifications[0];

          // Reload data when relevant notifications arrive
          if (
            latestNotification.notificationType ===
              NotificationType.ORDER_CREATED ||
            latestNotification.notificationType ===
              NotificationType.ORDER_UPDATED
          ) {
            console.log(
              '[Dashboard] Reloading data due to notification:',
              latestNotification
            );
            this.loadPendingOrders();
          }
        }
      });
  }

  /**
   * Load pending orders count
   */
  private loadPendingOrders(): void {
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
