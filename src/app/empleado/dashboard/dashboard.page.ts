import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonButton,
  IonIcon,
  IonGrid,
  IonRow,
  IonCol,
  IonBadge,
  IonItem,
  IonLabel, IonCardSubtitle, IonRefresher, IonRefresherContent, 
RefresherEventDetail} from '@ionic/angular/standalone';
import { AuthService } from '../../services/auth.service';
import { addIcons } from 'ionicons';
import {
  receipt,
  cube,
  people,
  statsChart,
  logOut,
  notifications,
} from 'ionicons/icons';
import { HeaderComponent } from "src/app/components/header/header.component";
import { IonRefresherCustomEvent } from '@ionic/core';
import { FabbtnComponent } from "src/app/components/fabbtn/fabbtn.component";

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone: true,
  imports: [IonRefresherContent, IonRefresher, IonCardSubtitle,
    CommonModule,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonButton,
    IonIcon,
    IonGrid,
    IonRow,
    IonCol,
    IonBadge,
    IonItem,
    IonLabel,
    HeaderComponent, FabbtnComponent],
})
export class DashboardPage implements OnInit {
doRefresh($event: IonRefresherCustomEvent<RefresherEventDetail>) {
throw new Error('Method not implemented.');
}
  private authService = inject(AuthService);
  private router = inject(Router);

  user = this.authService.getCurrentUser();

  // Datos simulados para el dashboard
  stats = {
    pedidosPendientes: 8,
    pedidosCompletados: 24,
    inventarioBajo: 3,
    ventasHoy: 1250,
  };

  pedidosRecientes = [
    { id: '001', cliente: 'Juan Pérez', estado: 'Pendiente', total: 125.5 },
    {
      id: '002',
      cliente: 'María García',
      estado: 'En preparación',
      total: 89.0,
    },
    { id: '003', cliente: 'Carlos López', estado: 'Listo', total: 156.75 },
    { id: '004', cliente: 'Daniel Santiago', estado: 'Listo', total: 125.5 },
  ];

  constructor() {
    addIcons({ receipt, cube, people, statsChart, logOut, notifications });
  }

  ngOnInit() {
    if (!this.user) {
      this.router.navigate(['/login']);
    }
  }

  navigateTo(route: string) {
    this.router.navigate([`/empleado/${route}`]);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  getEstadoColor(estado: string): string {
    switch (estado) {
      case 'Pendiente':
        return 'warning';
      case 'En preparación':
        return 'primary';
      case 'Listo':
        return 'success';
      default:
        return 'medium';
    }
  }
}
