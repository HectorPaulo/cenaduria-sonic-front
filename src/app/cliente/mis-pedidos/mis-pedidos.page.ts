import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonContent,
  IonSpinner,
  IonRefresher,
  IonRefresherContent,
  IonBadge,
  IonIcon,
  IonButton,
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
} from '@ionic/angular/standalone';
import { HeaderComponent } from 'src/app/components/header/header.component';
import { FabbtnComponent } from 'src/app/components/fabbtn/fabbtn.component';
import { PedidosService } from 'src/app/services/empleados/pedidos-service';
import { NotificationService } from 'src/app/services/notification.service';
import { NotificationType } from 'src/app/Types/websocket.types';
import { Subscription } from 'rxjs';
import { RefresherCustomEvent } from '@ionic/core';
import { addIcons } from 'ionicons';
import {
  time,
  restaurant,
  checkmark,
  informationCircle,
  receipt,
  cash,
  checkmarkCircle,
  close,
} from 'ionicons/icons';

interface OrderView {
  id: number;
  status: string;
  total: number;
  estimatedTime: string;
  createdAt: string;
  deliveredAt?: string;
  itemCount: number;
  items: any[];
}

@Component({
  selector: 'app-mis-pedidos',
  templateUrl: './mis-pedidos.page.html',
  styleUrls: ['./mis-pedidos.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonContent,
    IonSpinner,
    IonRefresher,
    IonRefresherContent,
    IonBadge,
    IonIcon,
    IonButton,
    IonModal,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    HeaderComponent,
    FabbtnComponent,
  ],
})
export class MisPedidosPage implements OnInit, OnDestroy {
  loading = false;
  orders: OrderView[] = [];
  selectedOrder: any = null;
  isModalOpen = false;
  private notificationSubscription?: Subscription;

  currentPage = 0;
  pageSize = 10;
  totalPages = 0;
  totalElements = 0;

  constructor(
    private readonly pedidosService: PedidosService,
    private readonly notificationService: NotificationService
  ) {
    addIcons({
      restaurant,
      cash,
      time,
      checkmarkCircle,
      informationCircle,
      close,
      checkmark,
      receipt,
    });
  }

  ngOnInit() {
    this.loadMyOrders();
    this.subscribeToNotifications();
  }

  ngOnDestroy() {
    if (this.notificationSubscription) {
      this.notificationSubscription.unsubscribe();
    }
  }

  /**
   * Subscribe to real-time notifications and update orders
   */
  private subscribeToNotifications(): void {
    this.notificationSubscription =
      this.notificationService.notifications$.subscribe((notifications) => {
        if (notifications.length > 0) {
          const latestNotification = notifications[0];

          // Handle different notification types
          switch (latestNotification.notificationType) {
            case NotificationType.ORDER_STATUS_CHANGED:
              console.log(
                '[MisPedidos] Order status changed:',
                latestNotification
              );
              this.updateOrderInList(latestNotification.orderId, {
                status: latestNotification.status,
              });
              break;

            case NotificationType.ORDER_ESTIMATED_TIME_CHANGED:
              console.log(
                '[MisPedidos] Estimated time changed:',
                latestNotification
              );
              this.updateOrderInList(latestNotification.orderId, {
                estimatedTime: latestNotification.estimatedTime || 'N/A',
              });
              break;

            case NotificationType.ORDER_CANCELLED:
              console.log('[MisPedidos] Order cancelled:', latestNotification);
              this.updateOrderInList(latestNotification.orderId, {
                status: 'CANCELADO',
              });
              break;
          }
        }
      });
  }

  /**
   * Update a specific order in the list without reloading everything
   */
  private updateOrderInList(
    orderId: number,
    updates: Partial<OrderView>
  ): void {
    const index = this.orders.findIndex((o) => o.id === orderId);
    if (index !== -1) {
      this.orders[index] = { ...this.orders[index], ...updates };
      // Trigger change detection
      this.orders = [...this.orders];

      // If the modal is open for this order, update it too
      if (this.selectedOrder?.id === orderId) {
        this.selectedOrder = { ...this.selectedOrder, ...updates };
      }
    }
  }

  doRefresh(event: RefresherCustomEvent) {
    this.loadMyOrders(() => event.target.complete());
  }

  loadMyOrders(cb?: () => void) {
    this.loading = true;

    this.pedidosService.getMyOrders(this.currentPage, this.pageSize).subscribe({
      next: (response: any) => {
        const content = response?.content || response?.data || response || [];
        this.orders = Array.isArray(content)
          ? content
              .map((o: any) => this.normalizeOrder(o))
              .sort((a, b) => b.id - a.id) // Ordenar por ID descendente (más reciente primero)
          : [];
        this.totalPages = response?.totalPages || 0;
        this.totalElements = response?.totalElements || 0;
        this.loading = false;
        if (cb) cb();
      },
      error: (err: any) => {
        console.error('[MisPedidos] Failed to load orders', err);
        this.loading = false;
        if (cb) cb();
      },
    });
  }

  private normalizeOrder(o: any): OrderView {
    // Try different possible field names for item count
    const itemCount = o.itemCount || o.totalItems || o.items?.length || 0;

    console.log('[MisPedidos] Normalizing order:', {
      id: o.id,
      itemCount,
      rawItemCount: o.itemCount,
      rawTotalItems: o.totalItems,
      rawItemsLength: o.items?.length,
      rawData: o,
    });

    return {
      id: o.id,
      status: o.status,
      total: o.total || 0,
      estimatedTime: o.estimatedTime || 'N/A',
      createdAt: o.createdAt,
      deliveredAt: o.deliveredAt,
      itemCount: itemCount,
      items: o.items || [],
    };
  }

  nextPage() {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++;
      this.loadMyOrders();
    }
  }

  prevPage() {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.loadMyOrders();
    }
  }

  viewOrderDetails(order: OrderView) {
    this.loading = true;
    this.pedidosService.getOrderById(order.id).subscribe({
      next: (fullOrder: any) => {
        this.selectedOrder = fullOrder;
        this.isModalOpen = true;
        this.loading = false;
      },
      error: (err: any) => {
        console.error('[MisPedidos] Failed to load order details', err);
        this.loading = false;
      },
    });
  }

  closeModal() {
    this.isModalOpen = false;
    this.selectedOrder = null;
  }

  getStatusColor(status: string): string {
    switch (status?.toUpperCase()) {
      case 'PENDIENTE':
        return 'warning';
      case 'EN_PREPARACION':
        return 'primary';
      case 'LISTO':
        return 'success';
      case 'ENTREGADO':
        return 'medium';
      case 'CANCELADO':
        return 'danger';
      default:
        return 'medium';
    }
  }

  getStatusLabel(status: string): string {
    switch (status?.toUpperCase()) {
      case 'PENDIENTE':
        return 'Pendiente';
      case 'EN_PREPARACION':
        return 'En Preparación';
      case 'LISTO':
        return 'Listo para Recoger';
      case 'ENTREGADO':
        return 'Entregado';
      case 'CANCELADO':
        return 'Cancelado';
      default:
        return status;
    }
  }

  getStatusIcon(status: string): string {
    switch (status?.toUpperCase()) {
      case 'PENDIENTE':
        return 'time';
      case 'EN_PREPARACION':
        return 'restaurant';
      case 'LISTO':
      case 'ENTREGADO':
        return 'checkmark';
      default:
        return 'receipt';
    }
  }

  trackById(index: number, item: OrderView) {
    return item.id;
  }
}
