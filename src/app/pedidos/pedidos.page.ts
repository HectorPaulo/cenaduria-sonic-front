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
  IonGrid,
  IonRow,
  IonButton,
  IonLoading,
} from '@ionic/angular/standalone';
import { HeaderComponent } from '../components/header/header.component';
import { FabbtnComponent } from "../components/fabbtn/fabbtn.component";

interface Review {
  avatar: string;
  comment: string;
  bgColor: string;
}

interface Pedido {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  imagen: string;
  estado: 'en-proceso' | 'listo' | 'entregado';
  tiempoEstimado?: string;
  fechaEntrega?: string;
  calificacion?: number;
  reviews: Review[];
}

@Component({
  selector: 'app-pedidos',
  templateUrl: './pedidos.page.html',
  styleUrls: ['./pedidos.page.scss'],
  standalone: true,
  imports: [
    IonLoading,
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
    FabbtnComponent
],
})
export class PedidosPage implements OnInit {
  pedidosActivos: Pedido[] = [
    {
      id: '#1023',
      nombre: 'Albóndigas Clásicas',
      descripcion: 'Jugosas albóndigas de res con salsa de tomate y especias.',
      precio: 8.99,
      imagen: 'assets/comida.png',
      estado: 'en-proceso',
      tiempoEstimado: '15 min',
      reviews: [
        {
          avatar: 'assets/sonic.png',
          comment: '¡Deliciosas!',
          bgColor: 'bg-blue-100',
        },
        {
          avatar: 'assets/goku.png',
          comment: '¡Qué tetas!',
          bgColor: 'bg-purple-100',
        },
      ],
    },
    {
      id: '#1024',
      nombre: 'Hamburguesa con Queso',
      descripcion:
        'Hamburguesa de res con queso cheddar, lechuga, tomate y cebolla.',
      precio: 7.99,
      imagen: 'assets/burgers.png',
      estado: 'listo',
      reviews: [
        {
          avatar: 'assets/sonic.png',
          comment: 'Jugosa',
          bgColor: 'bg-orange-100',
        },
        {
          avatar: 'assets/goku.png',
          comment: '¡Increíble!',
          bgColor: 'bg-red-100',
        },
      ],
    },
  ];

  pedidosHistorial: Pedido[] = [
    {
      id: '#1020',
      nombre: 'Tacos de Carne Asada',
      descripcion: 'Tacos de carne asada con cebolla, cilantro y salsa.',
      precio: 7.99,
      imagen: 'assets/tacos.png',
      estado: 'entregado',
      fechaEntrega: 'Hace 2 días',
      calificacion: 5.0,
      reviews: [],
    },
  ];

  constructor() {}

  ngOnInit() {}

  getEstadoChip(estado: string) {
    switch (estado) {
      case 'en-proceso':
        return {
          class: 'bg-yellow-100 text-yellow-800',
          label: 'En preparación',
        };
      case 'listo':
        return { class: 'bg-green-100 text-green-800', label: '¡Lista!' };
      case 'entregado':
        return { class: 'bg-blue-100 text-blue-800', label: 'Entregado' };
      default:
        return { class: 'bg-gray-100 text-gray-800', label: 'Desconocido' };
    }
  }

  getStars(calificacion: number): string {
    return '★'.repeat(calificacion) + '☆'.repeat(5 - calificacion);
  }

}
