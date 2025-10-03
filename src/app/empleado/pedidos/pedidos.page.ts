import { Component } from '@angular/core';
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
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { checkmark, time, restaurant } from 'ionicons/icons';

@Component({
  selector: 'app-pedidos-empleado',
  templateUrl: './pedidos.page.html',
  styleUrls: ['./pedidos.page.scss'],
  standalone: true,
  imports: [
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
  ],
})
export class PedidosEmpleadoPage {
  pedidos = [
    {
      id: '#001',
      cliente: 'Juan Pérez',
      items: ['Hamburguesa Clásica', 'Papas'],
      estado: 'pendiente',
      total: 125.5,
      tiempo: '10:30 AM',
    },
    {
      id: '#002',
      cliente: 'María García',
      items: ['Pizza Margherita', 'Refresco'],
      estado: 'preparando',
      total: 89.0,
      tiempo: '10:25 AM',
    },
    {
      id: '#003',
      cliente: 'Carlos López',
      items: ['Tacos x3', 'Agua'],
      estado: 'listo',
      total: 156.75,
      tiempo: '10:15 AM',
    },
    {
      id: '#004',
      cliente: 'Ana Rodríguez',
      items: ['Ensalada César', 'Jugo'],
      estado: 'pendiente',
      total: 78.0,
      tiempo: '10:35 AM',
    },
  ];

  constructor() {
    addIcons({ checkmark, time, restaurant });
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
