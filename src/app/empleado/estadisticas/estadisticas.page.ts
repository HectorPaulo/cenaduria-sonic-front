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
import {
  statsChart,
  trendingUp,
  cash,
  cart,
  star,
  cubeOutline,
  cube,
  checkmarkCircle,
  gift,
  folderOpenOutline,
  statsChartOutline,
} from 'ionicons/icons';
import { MenuService } from 'src/app/services/menu.service';
import { forkJoin } from 'rxjs';

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

  // Category statistics
  categories: any[] = [];
  categoryTotalCounts: { [key: number]: number } = {};
  categoryActiveCounts: { [key: number]: number } = {};
  loadingCategories = false;

  constructor(
    private readonly pedidosService: PedidosService,
    private readonly menuService: MenuService
  ) {
    addIcons({
      cart,
      cash,
      trendingUp,
      statsChart,
      star,
      cubeOutline,
      cube,
      gift,
      folderOpenOutline,
      checkmarkCircle,
      statsChartOutline,
    });
  }

  ngOnInit() {
    this.loadStatistics();
    this.loadCategoryStatistics();
  }

  doRefresh(event: RefresherCustomEvent) {
    this.loadStatistics(() => {
      this.loadCategoryStatistics(() => event.target.complete());
    });
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

  // Category statistics methods
  loadCategoryStatistics(cb?: () => void) {
    this.loadingCategories = true;

    this.menuService.getCategories().subscribe({
      next: (cats) => {
        this.categories = cats;
        if (cats && cats.length > 0) {
          this.loadCategoryCounts(cats, cb);
        } else {
          this.loadingCategories = false;
          if (cb) cb();
        }
      },
      error: (err) => {
        console.error('[Estadisticas] Failed to load categories', err);
        this.loadingCategories = false;
        if (cb) cb();
      },
    });
  }

  private loadCategoryCounts(categories: any[], cb?: () => void) {
    const requests = categories.flatMap((cat) => [
      this.menuService.countProductsByCategory(cat.id),
      this.menuService.countActiveProductsByCategory(cat.id),
    ]);

    forkJoin(requests).subscribe({
      next: (results) => {
        categories.forEach((cat, index) => {
          this.categoryTotalCounts[cat.id] = results[index * 2] as number;
          this.categoryActiveCounts[cat.id] = results[index * 2 + 1] as number;
        });
        this.loadingCategories = false;
        if (cb) cb();
      },
      error: (err) => {
        console.error('[Estadisticas] Failed to load category counts', err);
        this.loadingCategories = false;
        if (cb) cb();
      },
    });
  }

  getAvailabilityRatio(categoryId: number): number {
    const total = this.categoryTotalCounts[categoryId] || 0;
    const active = this.categoryActiveCounts[categoryId] || 0;
    return total > 0 ? active / total : 0;
  }

  getProgressColor(categoryId: number): string {
    const ratio = this.getAvailabilityRatio(categoryId);
    if (ratio >= 0.8) return 'success';
    if (ratio >= 0.5) return 'warning';
    return 'danger';
  }
}
