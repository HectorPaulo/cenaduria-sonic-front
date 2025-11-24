import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
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
import { RefresherCustomEvent } from '@ionic/core';
import { addIcons } from 'ionicons';
import {
  time,
  restaurant,
  checkmark,
  informationCircle,
  receipt,
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
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
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
export class MisPedidosPage implements OnInit {
  loading = false;
  orders: OrderView[] = [];
  selectedOrder: any = null;
  isModalOpen = false;

  currentPage = 0;
  pageSize = 10;
  totalPages = 0;
  totalElements = 0;

  constructor(private readonly pedidosService: PedidosService) {
    addIcons({ time, restaurant, checkmark, informationCircle, receipt });
  }

  ngOnInit() {
    this.loadMyOrders();
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
          ? content.map((o: any) => this.normalizeOrder(o))
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
