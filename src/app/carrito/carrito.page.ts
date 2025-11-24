import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonButton,
  IonIcon,
  IonLabel,
  IonChip,
  AlertController,
} from '@ionic/angular/standalone';
import { HeaderComponent } from '../components/header/header.component';
import { FabbtnComponent } from '../components/fabbtn/fabbtn.component';
import { CartService } from '../services/cart.service';
import {
  OrdersService,
  CreateOrderDto,
  OrderItemDto,
} from '../services/orders.service';
import { RouterLink } from '@angular/router';
import { addIcons } from 'ionicons';
import { add, remove, trash, card, cash, wallet, close } from 'ionicons/icons';

interface ItemCarrito {
  type: 'PRODUCT' | 'PROMOTION';
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  imagen?: string;
  cantidad: number;
  categoria: 'comida' | 'bebida';
  extras?: string[];
  productId?: number;
  promotionId?: number;
}

interface MetodoPago {
  id: string;
  nombre: string;
  icono: string;
  disponible: boolean;
}

@Component({
  selector: 'app-carrito',
  templateUrl: './carrito.page.html',
  styleUrls: ['./carrito.page.scss'],
  standalone: true,
  imports: [
    IonChip,
    IonLabel,
    IonIcon,
    IonButton,
    IonCardContent,
    IonCardTitle,
    IonCardHeader,
    IonCard,
    IonContent,
    CommonModule,
    FormsModule,
    HeaderComponent,
    FabbtnComponent,
    RouterLink,
  ],
})
export class CarritoPage implements OnInit {
  itemsCarrito: ItemCarrito[] = [];

  metodosPago: MetodoPago[] = [
    { id: 'efectivo', nombre: 'Efectivo', icono: 'cash', disponible: true },
  ];

  metodoSeleccionado: string = 'efectivo';
  descuentoAplicado: number = 0;
  propina: number = 0;

  constructor(
    private readonly alertController: AlertController,
    private readonly cartService: CartService,
    private readonly ordersService: OrdersService
  ) {
    addIcons({ close, trash, remove, add, card, cash, wallet });
  }

  ngOnInit() {
    this.cartService.items$.subscribe((items) => {
      this.itemsCarrito = items.map((i: any) => ({
        type: i.type || 'PRODUCT',
        id: i.id,
        nombre: i.nombre,
        descripcion: i.descripcion ?? '',
        precio: i.precio ?? 0,
        imagen: i.imagen,
        cantidad: i.cantidad ?? 1,
        categoria: i.categoria === 'bebida' ? 'bebida' : 'comida',
        extras: i.extras ?? [],
        productId: i.productId,
        promotionId: i.promotionId,
      }));
      this.calcularTotales();
    });
  }

  aumentarCantidad(item: ItemCarrito) {
    this.cartService.increaseQuantity(item.id);
  }

  disminuirCantidad(item: ItemCarrito) {
    this.cartService.decreaseQuantity(item.id);
  }

  async eliminarItem(item: ItemCarrito) {
    const alert = await this.alertController.create({
      header: 'Eliminar producto',
      message: `¿Quieres eliminar "${item.nombre}" del carrito?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Eliminar',
          handler: () => {
            // remove using cart service
            this.cartService.removeById(item.id);
          },
        },
      ],
    });
    await alert.present();
  }

  get subtotal(): number {
    return this.itemsCarrito.reduce(
      (total, item) => total + item.precio * item.cantidad,
      0
    );
  }

  get totalConDescuento(): number {
    return this.subtotal - this.descuentoAplicado;
  }

  get total(): number {
    return this.totalConDescuento + this.propina;
  }

  get cantidadItems(): number {
    return this.itemsCarrito.reduce((total, item) => total + item.cantidad, 0);
  }

  calcularTotales() {
    console.log('Recalculando totales...');
  }

  private getActiveOrderStorageKey(): string {
    const token =
      localStorage.getItem('access_token') ||
      localStorage.getItem('token') ||
      localStorage.getItem('auth_token') ||
      '';
    if (!token) return 'active_order_id_guest';
    const prefix = token.slice(0, 8);
    return `active_order_id_${prefix}`;
  }

  seleccionarMetodoPago(metodoId: string) {
    this.metodoSeleccionado = metodoId;
  }

  async aplicarCupon() {
    const alert = await this.alertController.create({
      header: 'Aplicar cupón',
      inputs: [
        {
          name: 'cupon',
          type: 'text',
          placeholder: 'Código del cupón',
        },
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Aplicar',
          handler: (data) => {
            if (data.cupon === 'DESCUENTO10') {
              this.descuentoAplicado = this.subtotal * 0.1;
              this.mostrarMensaje('¡Cupón aplicado! 10% de descuento');
            } else if (data.cupon === 'PRIMERAVEZ') {
              this.descuentoAplicado = 5;
              this.mostrarMensaje('¡Cupón aplicado! $5 de descuento');
            } else {
              this.mostrarMensaje('Cupón no válido');
            }
          },
        },
      ],
    });
    await alert.present();
  }

  async agregarPropina() {
    const alert = await this.alertController.create({
      header: 'Agregar propina',
      inputs: [
        {
          name: 'propina',
          type: 'number',
          placeholder: 'Cantidad en $',
        },
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Agregar',
          handler: (data) => {
            this.propina = Number.parseFloat(data.propina) || 0;
          },
        },
      ],
    });
    await alert.present();
  }

  async realizarPedido() {
    if (this.itemsCarrito.length === 0) {
      this.mostrarMensaje('Tu carrito está vacío');
      return;
    }

    const alert = await this.alertController.create({
      header: 'Confirmar pedido',
      message: `Total a pagar: $${this.total.toFixed(2)}\nMétodo de pago: ${
        this.metodosPago.find((m) => m.id === this.metodoSeleccionado)?.nombre
      }`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Confirmar',
          handler: () => {
            this.procesarPedido();
          },
        },
      ],
    });
    await alert.present();
  }

  async procesarPedido() {
    if (this.itemsCarrito.length === 0) {
      this.mostrarMensaje('Tu carrito está vacío');
      return;
    }

    // Obtener los items originales del carrito con su información completa
    const cartItems = this.cartService.getItems();

    const items: OrderItemDto[] = cartItems.map((item) => {
      // Verificar si es una promoción o un producto
      if (item.type === 'PROMOTION') {
        return {
          type: 'PROMOTION',
          promotionId: item.promotionId || Number(item.id),
          productId: null,
          quantity: item.cantidad,
        } as OrderItemDto;
      } else {
        return {
          type: 'PRODUCT',
          productId: item.productId || Number(item.id),
          promotionId: null,
          quantity: item.cantidad,
        } as OrderItemDto;
      }
    });

    const payload: CreateOrderDto = {
      tip: this.propina || 0,
      items,
    };

    try {
      const activeKey = this.getActiveOrderStorageKey();
      const existingOrderId = localStorage.getItem(activeKey);

      if (existingOrderId) {
        // Client is not allowed to update orders; inform the user and suggest opening Pedidos
        console.warn(
          'Client-side updateOrder disabled; existing active_order_id: ' +
            existingOrderId +
            ' (storage key: ' +
            activeKey +
            ')'
        );
        this.mostrarMensaje(
          `Ya existe un pedido activo (id: ${existingOrderId}). Ve a Mis Pedidos para gestionarlo.`
        );
        return;
      } else {
        this.ordersService.createOrder(payload).subscribe({
          next: (res) => {
            console.debug('Order created', res);
            const returnedId =
              res?.id ||
              res?.orderId ||
              (res && res.data && res.data.id) ||
              null;
            if (returnedId) {
              const key = this.getActiveOrderStorageKey();
              localStorage.setItem(key, String(returnedId));
            }
            this.mostrarMensaje('¡Pedido realizado con éxito!');
            this.cartService.clear();
            this.descuentoAplicado = 0;
            this.propina = 0;
          },
          error: (err) => {
            console.error('Order creation failed', err);
            const msg =
              err?.error?.message || err?.message || 'Error al crear el pedido';

            const lower = String(msg).toLowerCase();
            const looksLikeActiveLimit =
              lower.includes('3') ||
              lower.includes('tres') ||
              lower.includes('activo') ||
              lower.includes('activos') ||
              lower.includes('active');

            if (looksLikeActiveLimit) {
              console.warn(
                'Server reported active-order limit; fetching my orders to inform the user.'
              );
              this.ordersService.getMyOrders().subscribe({
                next: (ordersRes) => {
                  console.log('Fallback getMyOrders response:', ordersRes);
                  const orders = Array.isArray(ordersRes)
                    ? ordersRes
                    : ordersRes?.data || ordersRes?.orders || [];
                  const candidate = orders.find((o: any) => {
                    const estado = (o.estado || o.status || '')
                      .toString()
                      .toLowerCase();
                    return (
                      !estado.includes('entregado') &&
                      !estado.includes('cancelado')
                    );
                  });

                  if (
                    candidate &&
                    (candidate.id || candidate.orderId || candidate.uuid)
                  ) {
                    const cid =
                      candidate.id || candidate.orderId || candidate.uuid;
                    console.debug(
                      'Found existing active order id (will store locally):',
                      cid
                    );
                    const key = this.getActiveOrderStorageKey();
                    localStorage.setItem(key, String(cid));
                    this.mostrarMensaje(
                      `Tienes un pedido activo (id: ${cid}). Ve a Mis Pedidos para gestionarlo.`
                    );
                    // Do not attempt to update the order from client-side (no permission)
                    return;
                  }

                  this.mostrarMensaje(`No se pudo crear el pedido: ${msg}`);
                },
                error: (fetchErr) => {
                  console.error('Failed to fetch my orders', fetchErr);
                  this.mostrarMensaje(`No se pudo crear el pedido: ${msg}`);
                },
              });
            } else {
              this.mostrarMensaje(`No se pudo crear el pedido: ${msg}`);
            }
          },
        });
      }
    } catch (e) {
      console.error('procesarPedido unexpected error', e);
      this.mostrarMensaje('Error inesperado al procesar el pedido');
    }
  }

  async limpiarCarrito() {
    const alert = await this.alertController.create({
      header: 'Limpiar carrito',
      message: '¿Estás seguro que quieres eliminar todos los productos?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Limpiar',
          handler: () => {
            this.cartService.clear();
            this.descuentoAplicado = 0;
            this.propina = 0;
            this.calcularTotales();
          },
        },
      ],
    });
    await alert.present();
  }

  private async mostrarMensaje(mensaje: string) {
    const alert = await this.alertController.create({
      header: 'Información',
      message: mensaje,
      buttons: ['OK'],
    });
    await alert.present();
  }
}
