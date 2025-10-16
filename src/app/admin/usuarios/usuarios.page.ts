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
  IonRefresher,
  IonRefresherContent,
  RefresherEventDetail,
  IonCardSubtitle,
} from '@ionic/angular/standalone';
import { HeaderComponent } from 'src/app/components/header/header.component';
import { IonRefresherCustomEvent, RefresherCustomEvent } from '@ionic/core';
import { FabbtnComponent } from 'src/app/components/fabbtn/fabbtn.component';

@Component({
  selector: 'app-usuarios',
  templateUrl: './usuarios.page.html',
  styleUrls: ['./usuarios.page.scss'],
  standalone: true,
  imports: [
    IonCardSubtitle,
    IonRefresherContent,
    IonRefresher,
    CommonModule,
    IonContent,
    IonList,
    IonItem,
    IonLabel,
    IonBadge,
    IonCard,
    IonCardContent,
    IonCardHeader,

    HeaderComponent,
    FabbtnComponent,
  ],
})
export class UsuariosPage {
  doRefresh(event: RefresherCustomEvent) {
    setTimeout(() => {
      // TODO: Implementar la lógica para mandar a llamar a los datos actualizacos
      event.target.complete();
    }, 2000);
  }
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
