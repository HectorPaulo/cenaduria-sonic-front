import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonList,
  IonItem,
  IonLabel,
  IonBadge,
  IonButton,
  IonIcon,
  IonRefresher,
  IonRefresherContent,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { checkmark, time, restaurant } from 'ionicons/icons';
import { HeaderComponent } from 'src/app/components/header/header.component';
import { OrdersService } from 'src/app/services/orders.service';
import { RefresherCustomEvent } from '@ionic/core';
import { FabbtnComponent } from 'src/app/components/fabbtn/fabbtn.component';

@Component({
  selector: 'app-pedidos-empleado',
  templateUrl: './pedidos.page.html',
  styleUrls: ['./pedidos.page.scss'],
  standalone: true,
  imports: [
    IonRefresherContent,
    IonRefresher,
    CommonModule,
    IonContent,
    IonList,
    IonItem,
    IonLabel,
    IonBadge,
    IonButton,
    IonIcon,
    HeaderComponent,
    FabbtnComponent,
  ],
})
export class PedidosEmpleadoPage implements OnInit {
  pedidos: any[] = [];

  loading = false;

  constructor(private ordersService: OrdersService) {
    addIcons({ checkmark, time, restaurant });
  }

  ngOnInit() {
    this.loadActiveOrders();
  }

  cambiarEstado(pedido: any, nuevoEstado: string) {
    pedido.estado = nuevoEstado;
  }

  getEstadoColor(estado: string): string {
    switch (estado) {
      case 'pendiente':
        return 'warning';
      case 'preparando':
        return 'primary';
      case 'listo':
        return 'success';
      default:
        return 'medium';
    }
  }

  getEstadoTexto(estado: string): string {
    switch (estado) {
      case 'pendiente':
        return 'Pendiente';
      case 'preparando':
        return 'Preparando';
      case 'listo':
        return 'Listo';
      default:
        return 'Desconocido';
    }
  }

  doRefresh(event: RefresherCustomEvent) {
    this.loadActiveOrders(() => event.target.complete());
  }

  loadActiveOrders(cb?: () => void) {
    this.loading = true;
    // default page size 20 to fetch a reasonable number of active orders
    const page = 1;
    const size = 20;
    this.ordersService.getActiveOrdersPaged(page, size).subscribe({
      next: (res: any) => {
        console.log('[PedidosEmpleado] loadActiveOrders response:', res);
        const raw = Array.isArray(res)
          ? res
          : res?.data || res?.orders || res?.content || [];
        this.pedidos = raw.map((o: any) => this.normalize(o));
        this.loading = false;
        if (cb) cb();
      },
      error: (err: any) => {
        console.error('[PedidosEmpleado] failed to load active orders', err);
        this.loading = false;
        if (cb) cb();
      },
    });
  }

  private normalize(o: any) {
    // map backend order to the simple UI model used by the template
    return {
      id: o?.id ?? o?.orderId ?? o?.uuid ?? 'N/A',
      cliente:
        o?.customer?.name ||
        o?.customerName ||
        o?.username ||
        o?.user ||
        'Cliente',
      items: (o?.items || o?.orderItems || []).map(
        (it: any) =>
          it?.name ||
          it?.title ||
          it?.productName ||
          `${it?.quantity || 1}x item`
      ),
      estado: o?.status || o?.estado || 'pendiente',
      total: o?.total || o?.amount || o?.price || 0,
      tiempo: o?.createdAt
        ? new Date(o.createdAt).toLocaleTimeString()
        : o?.time || '',
      raw: o,
    };
  }

  getEstadoIcon(estado: string): string {
    switch (estado) {
      case 'pendiente':
        return 'time';
      case 'preparando':
        return 'restaurant';
      case 'listo':
        return 'checkmark';
      default:
        return 'time';
    }
  }
}
