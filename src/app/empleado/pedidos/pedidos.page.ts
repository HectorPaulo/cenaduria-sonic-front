import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonBadge,
  IonButton,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonSelect,
  IonSelectOption,
  IonIcon,
  IonSpinner,
  IonRefresher,
  IonRefresherContent,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { checkmark, time, restaurant, close } from 'ionicons/icons';
import { HeaderComponent } from 'src/app/components/header/header.component';
import { PedidosService } from 'src/app/services/empleados/pedidos-service';
import { RefresherCustomEvent } from '@ionic/core';
import { FabbtnComponent } from 'src/app/components/fabbtn/fabbtn.component';
import { AlertController, ToastController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

interface PedidoView {
  id: string | number;
  cliente: string;
  items: string[];
  estado: string;
  statusServer?: string;
  total: number;
  tiempo: string;
  raw: any;
}

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
    IonSelect,
    IonSelectOption,
    IonIcon,
    IonSpinner,
    HeaderComponent,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    FabbtnComponent,
    FormsModule,
  ],
})
export class PedidosEmpleadoPage implements OnInit {
  pedidos: PedidoView[] = [];
  pedidosPendientes: PedidoView[] = [];
  pedidosPreparando: PedidoView[] = [];
  pedidosListos: PedidoView[] = [];
  pedidosEntregados: PedidoView[] = [];

  loading = false;

  constructor(
    private pedidosService: PedidosService,
    private alertController: AlertController,
    private toastController: ToastController
  ) {
    addIcons({ close, checkmark, time, restaurant });
  }

  ngOnInit() {
    this.loadActiveOrders();
  }

  cambiarEstado(pedido: PedidoView, nuevoEstado: string) {
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
    const page = 1;
    const size = 100; 

    this.pedidosService.getActiveOrdersPaged(page, size).subscribe({
      next: (r: any) => {
        console.log('[PedidosEmpleado] loadActiveOrders response:', r);
        const raw = Array.isArray(r)
          ? r
          : r?.content || r?.data || r?.orders || [];
        const mapped = raw.map((o: any) => this.normalize(o));
        this.pedidos = mapped;
        this.recomputeGroups();
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

  trackById(index: number, item: PedidoView) {
    return item?.raw?.id ?? item?.id ?? index;
  }

  private normalize(o: any) {
    const id = o?.id ?? o?.orderId ?? o?.uuid ?? 'N/A';
    const userName =
      o?.user?.fullName ||
      o?.user?.name ||
      o?.customer?.name ||
      o?.customerName ||
      o?.username ||
      o?.user ||
      'Cliente';
    const statusRaw = o?.status ?? o?.estado ?? '';
    const statusServer = statusRaw ? String(statusRaw) : '';
    const estado = this.mapServerStatusToNormalized(statusServer);
    // The backend does not always include item details in this API,
    // so for the employee view we omit item parsing and keep an empty list.
    const items: string[] = [];
    const total = o?.total ?? o?.amount ?? o?.price ?? o?.subtotal ?? 0;
    const tiempo =
      (o?.estimatedTime ??
        (o?.createdAt
          ? new Date(o.createdAt).toLocaleTimeString()
          : o?.time)) ||
      '';

    return {
      id,
      cliente: userName,
      items,
      estado,
      statusServer,
      total,
      tiempo,
      raw: o,
    };
  }

  private mapServerStatusToNormalized(status: string): string {
    if (!status) return 'pendiente';
    const s = String(status).toLowerCase();
    if (s.includes('pend')) return 'pendiente';
    if (
      s.includes('prepar') ||
      s.includes('en_preparacion') ||
      s.includes('en-preparacion') ||
      s.includes('en prepar')
    )
      return 'preparando';
    if (s.includes('list')) return 'listo';
    if (s.includes('entreg')) return 'entregado';
    if (s.includes('cancel')) return 'cancelado';
    return 'pendiente';
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

  changingStatus: Record<string, boolean> = {};

  async confirmCancel(pedido: PedidoView) {
    const alert = await this.alertController.create({
      header: 'Confirmar cancelación',
      message: `¿Deseas cancelar la orden #${pedido.id} de ${pedido.cliente}?`,
      buttons: [
        { text: 'No', role: 'cancel' },
        {
          text: 'Sí, cancelar',
          handler: () => {
            this.executeCancel(pedido);
          },
        },
      ],
    });
    await alert.present();
  }

  private async executeCancel(pedido: PedidoView) {
    const id = pedido.raw?.id || pedido.id;
    if (!id) return;
    this.changingStatus[id] = true;
    this.pedidosService.cancelOrder(id).subscribe({
      next: async (res: any) => {
        console.log('[PedidosEmpleado] order cancelled', res);
        // remove from all lists
        const matchId = id;
        this.pedidos = this.pedidos.filter(
          (p) => (p.raw?.id || p.id) !== matchId
        );
        this.pedidosPendientes = this.pedidosPendientes.filter(
          (p) => (p.raw?.id || p.id) !== matchId
        );
        this.pedidosPreparando = this.pedidosPreparando.filter(
          (p) => (p.raw?.id || p.id) !== matchId
        );
        this.pedidosListos = this.pedidosListos.filter(
          (p) => (p.raw?.id || p.id) !== matchId
        );
        this.pedidosEntregados = this.pedidosEntregados.filter(
          (p) => (p.raw?.id || p.id) !== matchId
        );

        const message = res?.message || 'Pedido cancelado correctamente';
        const toast = await this.toastController.create({
          message,
          duration: 3000,
          color: 'success',
        });
        toast.present();
        this.changingStatus[id] = false;
      },
      error: async (err: any) => {
        console.error('[PedidosEmpleado] failed to cancel order', err);
        const toast = await this.toastController.create({
          message: 'Error al cancelar el pedido',
          duration: 3000,
          color: 'danger',
        });
        toast.present();
        this.changingStatus[id] = false;
      },
    });
  }

  changeOrderStatus(pedido: PedidoView, newStatus: string) {
    const id = pedido.raw?.id || pedido.id;
    if (!id) return;
    this.changingStatus[id] = true;
    this.pedidosService.updateOrderStatus(id, newStatus).subscribe({
      next: (res: any) => {
        console.log('[PedidosEmpleado] status updated', res);
        // Update local pedido using returned fields when available
        const statusFromRes = res?.status || res?.statusServer || newStatus;
        pedido.raw = { ...(pedido.raw || {}), ...(res || {}) };
        pedido.statusServer = statusFromRes;
        pedido.estado = this.mapServerStatusToNormalized(
          String(statusFromRes || newStatus)
        );
        // update master list entry too
        const idx = this.pedidos.findIndex(
          (p) => (p.raw?.id || p.id) === (pedido.raw?.id || pedido.id)
        );
        if (idx >= 0) this.pedidos[idx] = pedido;
        // recompute grouped lists
        this.recomputeGroups();
        this.changingStatus[id] = false;
      },
      error: (err: any) => {
        console.error('[PedidosEmpleado] failed to update status', err);
        this.changingStatus[id] = false;
      },
    });
  }

  private recomputeGroups() {
    const mapped = this.pedidos || [];
    this.pedidosPendientes = mapped.filter(
      (p: PedidoView) => (p.estado || '').toLowerCase() === 'pendiente'
    );
    this.pedidosPreparando = mapped.filter(
      (p: PedidoView) => (p.estado || '').toLowerCase() === 'preparando'
    );
    this.pedidosListos = mapped.filter(
      (p: PedidoView) => (p.estado || '').toLowerCase() === 'listo'
    );
    this.pedidosEntregados = mapped.filter(
      (p: PedidoView) => (p.estado || '').toLowerCase() === 'entregado'
    );
  }

  cancelOrder(pedido: PedidoView) {
    const id = pedido.raw?.id || pedido.id;
    if (!id) return;
    this.changingStatus[id] = true;
    this.pedidosService.cancelOrder(id).subscribe({
      next: (res: any) => {
        console.log('[PedidosEmpleado] order cancelled', res);
        // remove from list or update status
        const idx = this.pedidos.findIndex((p) => (p.raw?.id || p.id) === id);
        if (idx >= 0) {
          // remove cancelled order from pending list
          this.pedidos.splice(idx, 1);
        }
        this.changingStatus[id] = false;
      },
      error: (err: any) => {
        console.error('[PedidosEmpleado] failed to cancel order', err);
        this.changingStatus[id] = false;
      },
    });
  }
}
