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
  IonSegment,
  IonSegmentButton,
  IonModal,
  IonButtons,
  IonToolbar,
  IonTitle,
  IonHeader,
  ModalController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  checkmark,
  time,
  restaurant,
  close,
  informationCircle,
} from 'ionicons/icons';
import { HeaderComponent } from 'src/app/components/header/header.component';
import { PedidosService } from 'src/app/services/empleados/pedidos-service';
import { RefresherCustomEvent } from '@ionic/core';
import { FabbtnComponent } from 'src/app/components/fabbtn/fabbtn.component';
import { AlertController, ToastController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';

interface PedidoItem {
  name: string;
  quantity: number;
  price: number;
  total: number;
  imageUrl?: string;
  type?: string;
}

interface PedidoView {
  id: string | number;
  cliente: string;
  items: PedidoItem[];
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
    IonHeader,
    IonTitle,
    IonToolbar,
    IonButtons,
    IonModal,
    IonSegmentButton,
    IonSegment,
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
  selectedSegment: string = 'PENDIENTE';
  pedidos: PedidoView[] = [];
  loading = false;

  // Pagination
  currentPage = 0;
  pageSize = 10;
  totalPages = 0;
  totalElements = 0;

  // Order detail modal
  selectedOrder: any = null;
  isModalOpen = false;

  changingStatus: Record<string, boolean> = {};

  constructor(
    private readonly pedidosService: PedidosService,
    private readonly alertController: AlertController,
    private readonly toastController: ToastController,
    private readonly modalController: ModalController
  ) {
    addIcons({ close, checkmark, time, restaurant, informationCircle });
  }

  ngOnInit() {
    this.loadOrdersBySegment();
  }

  segmentChanged(event: any) {
    this.selectedSegment = event.detail.value;
    this.currentPage = 0;
    this.loadOrdersBySegment();
  }

  getEstadoColor(estado: string): string {
    switch (estado) {
      case 'pendiente':
        return 'warning';
      case 'preparando':
        return 'primary';
      case 'listo':
        return 'success';
      case 'entregado':
        return 'medium';
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
      case 'entregado':
        return 'Entregado';
      default:
        return 'Desconocido';
    }
  }

  doRefresh(event: RefresherCustomEvent) {
    this.loadOrdersBySegment(() => event.target.complete());
  }

  loadOrdersBySegment(cb?: () => void) {
    this.loading = true;

    this.pedidosService
      .getOrdersByStatusPaged(
        this.selectedSegment,
        this.currentPage,
        this.pageSize,
        'createdAt,desc'
      )
      .pipe(
        catchError((err) => {
          console.error('[PedidosEmpleado] failed to load orders', err);
          return of({ content: [], totalPages: 0, totalElements: 0 });
        })
      )
      .subscribe({
        next: (response: any) => {
          const content = response?.content || response?.data || response || [];
          this.pedidos = Array.isArray(content)
            ? content.map((o: any) => this.normalize(o))
            : [];
          this.totalPages = response?.totalPages || 0;
          this.totalElements = response?.totalElements || 0;
          this.loading = false;
          if (cb) cb();
        },
        error: (err: any) => {
          console.error('[PedidosEmpleado] error', err);
          this.loading = false;
          if (cb) cb();
        },
      });
  }

  nextPage() {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++;
      this.loadOrdersBySegment();
    }
  }

  prevPage() {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.loadOrdersBySegment();
    }
  }

  trackById(index: number, item: PedidoView) {
    return item?.raw?.id ?? item?.id ?? index;
  }

  private normalize(o: any): PedidoView {
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

    const items: PedidoItem[] = (o?.items || []).map((it: any) => ({
      name: it.itemName || it.name || 'Producto',
      quantity: it.quantity || 1,
      price: it.unitPrice || it.price || 0,
      total: it.lineTotal || it.quantity * it.unitPrice || 0,
      imageUrl: it.imageUrl,
      type: it.type,
    }));

    const total = o?.total ?? o?.amount ?? o?.price ?? o?.subtotal ?? 0;
    const tiempo =
      (o?.estimatedTime ??
        (o?.createdAt
          ? new Date(o.createdAt).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })
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

  async confirmCancel(pedido: PedidoView) {
    const alert = await this.alertController.create({
      header: 'Confirmar cancelación',
      message: `¿Deseas cancelar la orden #${pedido.id} de ${pedido.cliente}?`,
      buttons: [
        { text: 'No', role: 'cancel' },
        {
          text: 'Sí, cancelar',
          handler: () => {
            void this.executeCancel(pedido);
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
        const message = res?.message || 'Pedido cancelado correctamente';
        const toast = await this.toastController.create({
          message,
          duration: 3000,
          color: 'success',
        });
        toast.present();
        this.loadOrdersBySegment(() => {
          this.changingStatus[id] = false;
        });
      },
      error: async (err: any) => {
        console.error('[PedidosEmpleado] failed to cancel order', err);
        const toast = await this.toastController.create({
          message: err?.error?.message || 'Error al cancelar el pedido',
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
      next: async (res: any) => {
        console.log('[PedidosEmpleado] status updated', res);
        const toast = await this.toastController.create({
          message: 'Estado actualizado correctamente',
          duration: 2000,
          color: 'success',
        });
        toast.present();
        this.loadOrdersBySegment(() => {
          this.changingStatus[id] = false;
        });
      },
      error: async (err: any) => {
        console.error('[PedidosEmpleado] failed to update status', err);
        const toast = await this.toastController.create({
          message: err?.error?.message || 'Error al actualizar el estado',
          duration: 3000,
          color: 'danger',
        });
        toast.present();
        this.changingStatus[id] = false;
      },
    });
  }

  async viewOrderDetails(pedido: PedidoView) {
    const id = pedido.raw?.id || pedido.id;
    if (!id) return;

    this.loading = true;
    this.pedidosService.getOrderById(id).subscribe({
      next: (order: any) => {
        this.selectedOrder = order;
        this.isModalOpen = true;
        this.loading = false;
      },
      error: async (err: any) => {
        console.error('[PedidosEmpleado] failed to load order details', err);
        const toast = await this.toastController.create({
          message: 'Error al cargar los detalles del pedido',
          duration: 3000,
          color: 'danger',
        });
        toast.present();
        this.loading = false;
      },
    });
  }

  closeModal() {
    this.isModalOpen = false;
    this.selectedOrder = null;
  }

  canChangeStatus(pedido: PedidoView): boolean {
    const status = pedido.statusServer?.toUpperCase();
    return status !== 'ENTREGADO' && status !== 'CANCELADO';
  }

  canCancel(pedido: PedidoView): boolean {
    const status = pedido.statusServer?.toUpperCase();
    return status === 'PENDIENTE' || status === 'EN_PREPARACION';
  }

  getNextStatusOptions(pedido: PedidoView): string[] {
    const status = pedido.statusServer?.toUpperCase();
    switch (status) {
      case 'PENDIENTE':
        return ['EN_PREPARACION'];
      case 'EN_PREPARACION':
        return ['LISTO'];
      case 'LISTO':
        return ['ENTREGADO'];
      default:
        return [];
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'EN_PREPARACION':
        return 'En preparación';
      case 'LISTO':
        return 'Listo';
      case 'ENTREGADO':
        return 'Entregado';
      default:
        return status;
    }
  }

  async updateEstimatedTime(pedido: PedidoView) {
    const alert = await this.alertController.create({
      header: 'Actualizar Tiempo Estimado',
      message: `Orden #${pedido.id} - ${pedido.cliente}`,
      inputs: [
        {
          name: 'estimatedTime',
          type: 'text',
          placeholder: 'MM:SS (ej: 15:00)',
          value: pedido.raw?.estimatedTime || '15:00',
        },
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Actualizar',
          handler: (data) => {
            if (!data.estimatedTime) {
              void this.showToast('Por favor ingresa un tiempo', 'warning');
              return false;
            }

            // Validate format MM:SS
            const timeRegex = /^\d{1,2}:\d{2}$/;
            if (!timeRegex.test(data.estimatedTime)) {
              void this.showToast(
                'Formato inválido. Usa MM:SS (ej: 15:00)',
                'warning'
              );
              return false;
            }

            void this.executeUpdateEstimatedTime(pedido, data.estimatedTime);
            return true;
          },
        },
      ],
    });
    await alert.present();
  }

  private async executeUpdateEstimatedTime(
    pedido: PedidoView,
    estimatedTime: string
  ) {
    const id = pedido.raw?.id || pedido.id;
    if (!id) return;

    this.loading = true;
    this.pedidosService.updateOrderEstimatedTime(id, estimatedTime).subscribe({
      next: async (res: any) => {
        console.log('[PedidosEmpleado] estimated time updated', res);
        await this.showToast(
          'Tiempo estimado actualizado correctamente',
          'success'
        );
        this.loadOrdersBySegment();
      },
      error: async (err: any) => {
        console.error('[PedidosEmpleado] failed to update estimated time', err);
        await this.showToast(
          err?.error?.message || 'Error al actualizar el tiempo estimado',
          'danger'
        );
        this.loading = false;
      },
    });
  }

  private async showToast(message: string, color: string = 'primary') {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      color,
    });
    await toast.present();
  }
}
