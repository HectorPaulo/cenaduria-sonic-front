import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonChip,
  IonLabel,
  IonCard,
  IonCardContent,
  IonCardTitle,
  IonCardHeader,
  IonAvatar,
  IonSpinner,
  IonGrid,
  IonRow,
  IonButton,
  IonRefresher,
  IonRefresherContent,
} from '@ionic/angular/standalone';
import { HeaderComponent } from '../components/header/header.component';
import { FabbtnComponent } from '../components/fabbtn/fabbtn.component';
import { OrdersService } from '../services/orders.service';
import { RefresherCustomEvent } from '@ionic/core';

interface Review {
  avatar: string;
  comment: string;
  bgColor: string;
}

interface Pedido {
  id: string | number;
  nombre: string;
  descripcion?: string;
  precio?: number;
  imagen?: string;
  estado?: string; // backend uses pendiente, en_preparacion, listo, entregado, cancelado
  tiempoEstimado?: string;
  fechaEntrega?: string;
  calificacion?: number;
  reviews?: Review[];
}

@Component({
  selector: 'app-pedidos',
  templateUrl: './pedidos.page.html',
  styleUrls: ['./pedidos.page.scss'],
  standalone: true,
  imports: [
    IonRefresherContent,
    IonRefresher,
    IonSpinner,
    IonContent,
    IonChip,
    IonLabel,
    IonCard,
    IonCardContent,
    IonCardTitle,
    IonCardHeader,
    IonAvatar,
    IonGrid,
    IonRow,
    IonButton,
    CommonModule,
    FormsModule,
    HeaderComponent,
    FabbtnComponent,
  ],
})
export class PedidosPage implements OnInit {
  doRefresh(event: RefresherCustomEvent) {
    setTimeout(() => {
      // TODO: Implementar la lógica para mandar a llamar a los datos actualizacos
      event.target.complete();
    }, 2000);
  }
  pedidosActivos: Pedido[] = [];

  pedidosHistorial: Pedido[] = [];

  // UI state
  loading = false;
  filterLabel = 'Todos';

  constructor(private ordersService: OrdersService) {}

  ngOnInit() {}

  ngAfterViewInit() {
    // Load initial set of orders (user's last active orders)
    this.loadMyOrdersPaged(1, 10);
  }

  loadMyOrdersPaged(page = 1, size = 10, sort = '') {
    this.loading = true;
    this.ordersService.getMyOrdersPaged(page, size, sort).subscribe({
      next: (res) => {
        // Try common payload shapes: array or { data: [...] }
        const raw = Array.isArray(res) ? res : res?.data || res?.orders || [];
        const items = raw.map((r: any) => this.normalizeOrder(r));
        // split between active (not final) and historial (final)
        this.pedidosActivos = items.filter((o: any) => {
          const estado = (o.estado || '').toString().toLowerCase();
          return !estado.includes('entregado') && !estado.includes('cancelado');
        });
        this.pedidosHistorial = items.filter((o: any) => {
          const estado = (o.estado || '').toString().toLowerCase();
          return estado.includes('entregado') || estado.includes('cancelado');
        });
        this.loading = false;
        this.filterLabel = 'Todos';
      },
      error: (err) => {
        console.error('Failed to load my orders', err);
        this.loading = false;
      },
    });
  }

  loadRecent() {
    this.loading = true;
    this.ordersService.getRecentOrders().subscribe({
      next: (res) => {
        const raw = Array.isArray(res) ? res : res?.data || [];
        this.pedidosActivos = raw.map((r: any) => this.normalizeOrder(r));
        this.pedidosHistorial = [];
        this.loading = false;
        this.filterLabel = 'Recientes';
      },
      error: (err) => {
        console.error('Failed to load recent orders', err);
        this.loading = false;
      },
    });
  }

  loadPending() {
    this.loading = true;
    this.ordersService.getPendingOrders().subscribe({
      next: (res) => {
        const raw = Array.isArray(res) ? res : res?.data || [];
        this.pedidosActivos = raw.map((r: any) => this.normalizeOrder(r));
        this.pedidosHistorial = [];
        this.loading = false;
        this.filterLabel = 'Pendientes';
      },
      error: (err) => {
        console.error('Failed to load pending orders', err);
        this.loading = false;
      },
    });
  }

  loadLast() {
    this.loading = true;
    this.ordersService.getLastOrder().subscribe({
      next: (res) => {
        const itemRaw = res?.data || res || null;
        this.pedidosActivos = itemRaw ? [this.normalizeOrder(itemRaw)] : [];
        this.pedidosHistorial = [];
        this.loading = false;
        this.filterLabel = 'Última';
      },
      error: (err) => {
        console.error('Failed to load last order', err);
        this.loading = false;
      },
    });
  }

  loadByDateRange(startIso: string, endIso: string) {
    this.loading = true;
    this.ordersService.getOrdersByDateRange(startIso, endIso).subscribe({
      next: (res) => {
        const raw = Array.isArray(res) ? res : res?.data || [];
        const items = raw.map((r: any) => this.normalizeOrder(r));
        this.pedidosActivos = items.filter((o: any) => {
          const estado = (o.estado || '').toString().toLowerCase();
          return !estado.includes('entregado') && !estado.includes('cancelado');
        });
        this.pedidosHistorial = items.filter((o: any) => {
          const estado = (o.estado || '').toString().toLowerCase();
          return estado.includes('entregado') || estado.includes('cancelado');
        });
        this.loading = false;
        this.filterLabel = 'Rango de fechas';
      },
      error: (err) => {
        console.error('Failed to load orders by date range', err);
        this.loading = false;
      },
    });
  }

  getEstadoChip(estado?: string) {
    const s = (estado || '').toString().toLowerCase();
    if (s.includes('pend')) {
      return { class: 'bg-yellow-100 text-yellow-800', label: 'Pendiente' };
    }
    if (
      s.includes('en') ||
      s.includes('prepar') ||
      s.includes('en_preparacion') ||
      s.includes('en-proceso')
    ) {
      return {
        class: 'bg-yellow-100 text-yellow-800',
        label: 'En preparación',
      };
    }
    if (s.includes('listo')) {
      return { class: 'bg-green-100 text-green-800', label: '¡Lista!' };
    }
    if (s.includes('entreg')) {
      return { class: 'bg-blue-100 text-blue-800', label: 'Entregado' };
    }
    if (s.includes('cancel')) {
      return { class: 'bg-gray-100 text-gray-800', label: 'Cancelado' };
    }
    return { class: 'bg-gray-100 text-gray-800', label: 'Desconocido' };
  }

  private normalizeOrder(o: any): Pedido {
    return {
      id: o?.id ?? o?.orderId ?? o?.uuid ?? 'unknown',
      nombre: o?.nombre || o?.name || o?.title || 'Pedido',
      descripcion: o?.descripcion || o?.description || '',
      precio: o?.precio || o?.price || 0,
      imagen: o?.imagen || o?.image || 'assets/comida.png',
      estado: o?.estado || o?.status || '',
      tiempoEstimado: o?.tiempoEstimado || o?.eta || '',
      fechaEntrega: o?.fechaEntrega || o?.deliveredAt || '',
      calificacion: o?.calificacion || o?.rating || undefined,
      reviews: Array.isArray(o?.reviews) ? o.reviews : [],
    } as Pedido;
  }

  getStars(calificacion: number = 0): string {
    const n = Math.max(0, Math.min(5, Math.floor(calificacion)));
    return '★'.repeat(n) + '☆'.repeat(5 - n);
  }
}
