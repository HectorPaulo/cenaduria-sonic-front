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
  IonText,
  IonBadge,
} from '@ionic/angular/standalone';
import { AuthService } from '../../services/auth.service';
import { addIcons } from 'ionicons';
import {
  people,
  receipt,
  statsChart,
  settings,
  logOut,
  trendingUp,
  cube,
  cash,
  person,
} from 'ionicons/icons';
import { HeaderComponent } from "src/app/components/header/header.component";
import { FabbtnComponent } from "src/app/components/fabbtn/fabbtn.component";
import { RefresherCustomEvent } from '@ionic/core';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone: true,
  imports: [
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
    HeaderComponent,
    FabbtnComponent
],
})
export class AdminDashboardPage implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);

  user = this.authService.getCurrentUser();

  // Estadísticas generales del sistema
  stats = {
    usuariosActivos: 145,
    pedidosHoy: 87,
    ventasHoy: 3456.75,
    inventarioBajo: 5,
    empleadosActivos: 8,
    clientesNuevos: 12,
  };

  ventasSemana = [
    { dia: 'Lun', ventas: 2800 },
    { dia: 'Mar', ventas: 3200 },
    { dia: 'Mié', ventas: 2950 },
    { dia: 'Jue', ventas: 3800 },
    { dia: 'Vie', ventas: 4200 },
    { dia: 'Sáb', ventas: 5100 },
    { dia: 'Dom', ventas: 3456 },
  ];

  constructor() {
    addIcons({
      logOut,
      people,
      receipt,
      cash,
      cube,
      trendingUp,
      statsChart,
      settings,
      person,
    });
  }

  ngOnInit() {
    if (!this.user) {
      this.router.navigate(['/login']);
    }
  }

  doRefresh(event: RefresherCustomEvent) {
      setTimeout(() => {
        // TODO: Implementar la lógica para mandar a llamar a los datos actualizacos
        event.target.complete();
      }, 2000);
    }

  navigateTo(route: string) {
    this.router.navigate([`/admin/${route}`]);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
