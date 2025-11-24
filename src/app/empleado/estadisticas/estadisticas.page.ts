import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonSpinner,
  IonRefresher,
  IonRefresherContent,
  IonList,
  IonItem,
  IonLabel,
  IonBadge,
  IonIcon,
} from '@ionic/angular/standalone';
import { HeaderComponent } from 'src/app/components/header/header.component';
import { FabbtnComponent } from 'src/app/components/fabbtn/fabbtn.component';
import {
  PedidosService,
  OrderStatisticsResponse,
  TopSellingItem,
} from 'src/app/services/empleados/pedidos-service';
import { RefresherCustomEvent } from '@ionic/core';
import { addIcons } from 'ionicons';
import { statsChart, trendingUp, cash, cart, star } from 'ionicons/icons';

@Component({
  selector: 'app-estadisticas',
  templateUrl: './estadisticas.page.html',
  styleUrls: ['./estadisticas.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonContent,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonSpinner,
    IonRefresher,
    IonRefresherContent,
    IonList,
    IonItem,
    IonLabel,
    IonBadge,
    IonIcon,
    HeaderComponent,
    FabbtnComponent,
  ],
})
export class EstadisticasPage implements OnInit {
  loading = false;
  statistics: OrderStatisticsResponse | null = null;
  topProducts: TopSellingItem[] = [];
  topPromotions: TopSellingItem[] = [];

  constructor(private readonly pedidosService: PedidosService) {
    addIcons({ statsChart, trendingUp, cash, cart, star });
  }

  ngOnInit() {
    this.loadStatistics();
  }

  doRefresh(event: RefresherCustomEvent) {
    this.loadStatistics(() => event.target.complete());
  }

  loadStatistics(cb?: () => void) {
    this.loading = true;

    // Load general statistics
    this.pedidosService.getOrderStatistics().subscribe({
      next: (stats) => {
        this.statistics = stats;
        console.log('[Estadisticas] Statistics loaded', stats);
      },
      error: (err) => {
        console.error('[Estadisticas] Failed to load statistics', err);
      },
    });

    // Load top selling products
    this.pedidosService.getTopSellingProducts().subscribe({
      next: (products) => {
        this.topProducts = products;
        console.log('[Estadisticas] Top products loaded', products);
      },
      error: (err) => {
        console.error('[Estadisticas] Failed to load top products', err);
      },
    });

    // Load top selling promotions
    this.pedidosService.getTopSellingPromotions().subscribe({
      next: (promotions) => {
        this.topPromotions = promotions;
        console.log('[Estadisticas] Top promotions loaded', promotions);
        this.loading = false;
        if (cb) cb();
      },
      error: (err) => {
        console.error('[Estadisticas] Failed to load top promotions', err);
        this.loading = false;
        if (cb) cb();
      },
    });
  }

  getStatusKeys(): string[] {
    return this.statistics?.ordersByStatus
      ? Object.keys(this.statistics.ordersByStatus)
      : [];
  }

  getStatusCount(status: string): number {
    return this.statistics?.ordersByStatus?.[status] || 0;
  }

  getStatusColor(status: string): string {
    switch (status.toUpperCase()) {
      case 'PENDIENTE':
        return 'warning';
      case 'EN_PREPARACION':
        return 'primary';
      case 'LISTO':
        return 'success';
      case 'ENTREGADO':
        return 'medium';
      case 'CANCELADO':
        return 'danger';
      default:
        return 'medium';
    }
  }

  getStatusLabel(status: string): string {
    switch (status.toUpperCase()) {
      case 'PENDIENTE':
        return 'Pendientes';
      case 'EN_PREPARACION':
        return 'En Preparación';
      case 'LISTO':
        return 'Listos';
      case 'ENTREGADO':
        return 'Entregados';
      case 'CANCELADO':
        return 'Cancelados';
      default:
        return status;
    }
  }
}
