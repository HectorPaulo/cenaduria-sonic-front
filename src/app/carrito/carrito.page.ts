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
import { RouterLink } from '@angular/router';
import { addIcons } from 'ionicons';
import { add, remove, trash, card, cash, wallet } from 'ionicons/icons';

// Interfaces
interface ItemCarrito {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  imagen: string;
  cantidad: number;
  categoria: 'comida' | 'bebida';
  extras?: string[];
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
  // Items en el carrito (temporal - vendrán de un servicio)
  itemsCarrito: ItemCarrito[] = [
    {
      id: '1',
      nombre: 'Albóndigas Clásicas',
      descripcion: 'Jugosas albóndigas de res con salsa de tomate y especias.',
      precio: 8.99,
      imagen: 'assets/comida.png',
      cantidad: 2,
      categoria: 'comida',
      extras: ['Queso extra', 'Pan adicional'],
    },
    {
      id: '2',
      nombre: 'Hamburguesa con Queso',
      descripcion:
        'Hamburguesa de res con queso cheddar, lechuga, tomate y cebolla.',
      precio: 7.99,
      imagen: 'assets/burgers.png',
      cantidad: 1,
      categoria: 'comida',
    },
    {
      id: '3',
      nombre: 'Refresco de Cola',
      descripcion: 'Bebida carbonatada con sabor a cola, refrescante y dulce.',
      precio: 1.99,
      imagen: 'assets/sonic.png',
      cantidad: 3,
      categoria: 'bebida',
    },
  ];

  // Métodos de pago disponibles
  metodosPago: MetodoPago[] = [
    { id: 'efectivo', nombre: 'Efectivo', icono: 'cash', disponible: true },
  ];

  metodoSeleccionado: string = 'efectivo';
  descuentoAplicado: number = 0;
  propina: number = 0;

  constructor(private alertController: AlertController) {
    addIcons({ add, remove, trash, card, cash, wallet });
  }

  ngOnInit() {
    this.calcularTotales();
  }

  // Métodos para manejar cantidades
  aumentarCantidad(item: ItemCarrito) {
    item.cantidad++;
    this.calcularTotales();
  }

  disminuirCantidad(item: ItemCarrito) {
    if (item.cantidad > 1) {
      item.cantidad--;
      this.calcularTotales();
    }
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
            const index = this.itemsCarrito.findIndex((i) => i.id === item.id);
            if (index > -1) {
              this.itemsCarrito.splice(index, 1);
              this.calcularTotales();
            }
          },
        },
      ],
    });
    await alert.present();
  }

  // Métodos de cálculo
  get subtotal(): number {
    return this.itemsCarrito.reduce(
      (total, item) => total + item.precio * item.cantidad,
      0
    );
  }

  get impuestos(): number {
    return this.subtotal * 0.12; // 12% de impuestos
  }

  get totalConDescuento(): number {
    return this.subtotal - this.descuentoAplicado;
  }

  get total(): number {
    return this.totalConDescuento + this.impuestos + this.propina;
  }

  get cantidadItems(): number {
    return this.itemsCarrito.reduce((total, item) => total + item.cantidad, 0);
  }

  calcularTotales() {
    // Método para recalcular totales cuando cambian los items
    console.log('Recalculando totales...');
  }

  // Métodos de pago
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
            this.propina = parseFloat(data.propina) || 0;
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
    // Aquí se procesaría el pedido con el backend
    console.log('Procesando pedido...', {
      items: this.itemsCarrito,
      metodo: this.metodoSeleccionado,
      total: this.total,
    });

    this.mostrarMensaje('¡Pedido realizado con éxito!');
    // Limpiar carrito
    this.itemsCarrito = [];
    this.descuentoAplicado = 0;
    this.propina = 0;
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
            this.itemsCarrito = [];
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
