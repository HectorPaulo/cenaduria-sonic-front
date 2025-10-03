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
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-usuarios',
  templateUrl: './usuarios.page.html',
  styleUrls: ['./usuarios.page.scss'],
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
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
  ],
})
export class UsuariosPage {
  usuarios = [
    {
      id: 1,
      nombre: 'Juan Cliente',
      email: 'cliente@example.com',
      role: 'cliente',
      activo: true,
    },
    {
      id: 2,
      nombre: 'María',
      email: 'empleado@example.com',
      role: 'empleado',
      activo: true,
    },
    {
      id: 3,
      nombre: 'Admin Sistema',
      email: 'admin@example.com',
      role: 'sysadmin',
      activo: true,
    },
    {
      id: 4,
      nombre: 'Carlos Pérez',
      email: 'carlos@example.com',
      role: 'cliente',
      activo: false,
    },
  ];

  getRoleColor(role: string): string {
    switch (role) {
      case 'cliente':
        return 'success';
      case 'empleado':
        return 'warning';
      case 'sysadmin':
        return 'danger';
      default:
        return 'medium';
    }
  }

  getRoleText(role: string): string {
    switch (role) {
      case 'cliente':
        return 'Cliente';
      case 'empleado':
        return 'Empleado';
      case 'sysadmin':
        return 'Administrador';
      default:
        return 'Desconocido';
    }
  }
}
