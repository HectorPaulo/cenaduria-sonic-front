import { Component } from '@angular/core';
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
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { warning, checkmark, alert } from 'ionicons/icons';

@Component({
  selector: 'app-inventario',
  templateUrl: './inventario.page.html',
  styleUrls: ['./inventario.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonList,
    IonItem,
    IonLabel,
    IonBadge,
    IonIcon,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
  ],
})
export class InventarioPage {
  inventario = [
    { nombre: 'Hamburguesas', cantidad: 25, minimo: 10, categoria: 'Comida' },
    { nombre: 'Papas', cantidad: 8, minimo: 15, categoria: 'Comida' },
    { nombre: 'Refrescos', cantidad: 30, minimo: 20, categoria: 'Bebidas' },
    {
      nombre: 'Pan para hamburguesa',
      cantidad: 5,
      minimo: 12,
      categoria: 'Ingredientes',
    },
    { nombre: 'Queso', cantidad: 18, minimo: 10, categoria: 'Ingredientes' },
    { nombre: 'Agua', cantidad: 40, minimo: 25, categoria: 'Bebidas' },
  ];

  constructor() {
    addIcons({ warning, checkmark, alert });
  }

  getEstadoInventario(cantidad: number, minimo: number): string {
    if (cantidad <= minimo * 0.5) return 'critico';
    if (cantidad <= minimo) return 'bajo';
    return 'normal';
  }

  getEstadoColor(cantidad: number, minimo: number): string {
    const estado = this.getEstadoInventario(cantidad, minimo);
    switch (estado) {
      case 'critico':
        return 'danger';
      case 'bajo':
        return 'warning';
      case 'normal':
        return 'success';
      default:
        return 'medium';
    }
  }

  getEstadoTexto(cantidad: number, minimo: number): string {
    const estado = this.getEstadoInventario(cantidad, minimo);
    switch (estado) {
      case 'critico':
        return 'Crítico';
      case 'bajo':
        return 'Stock Bajo';
      case 'normal':
        return 'Normal';
      default:
        return 'Desconocido';
    }
  }

  getEstadoIcon(cantidad: number, minimo: number): string {
    const estado = this.getEstadoInventario(cantidad, minimo);
    switch (estado) {
      case 'critico':
        return 'alert';
      case 'bajo':
        return 'warning';
      case 'normal':
        return 'checkmark';
      default:
        return 'checkmark';
    }
  }

  get itemsCriticos() {
    return this.inventario.filter(
      (item) =>
        this.getEstadoInventario(item.cantidad, item.minimo) === 'critico'
    );
  }

  get itemsBajos() {
    return this.inventario.filter(
      (item) => this.getEstadoInventario(item.cantidad, item.minimo) === 'bajo'
    );
  }
}
