import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonRefresher,
  IonRefresherContent,
  IonButton,
  IonIcon,
  IonSpinner,
  LoadingController,
  ToastController,
  ModalController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { restaurant, receipt, pricetag, add, cart } from 'ionicons/icons';
import { HeaderComponent } from '../components/header/header.component';
import { RouterLink } from '@angular/router';
import { RefresherCustomEvent } from '@ionic/core/components';
import { FabbtnComponent } from '../components/fabbtn/fabbtn.component';
import { Subscription } from 'rxjs';
import { Alimento } from '../Types/Alimento';
import { ComidasService } from '../services/comidas.service';
import Recomendacion from '../Types/Recomendacion';
import {
  PromotionsService,
  PromotionSummaryResponse,
} from '../services/promotions.service';
import { CartService } from '../services/cart.service';
import { PromotionDetailModalComponent } from './components/promotion-detail-modal/promotion-detail-modal.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [
    IonRefresherContent,
    IonRefresher,
    IonContent,
    IonButton,
    IonIcon,
    IonSpinner,
    CommonModule,
    FormsModule,
    HeaderComponent,
    RouterLink,
    FabbtnComponent,
  ],
})
export class HomePage implements OnInit, OnDestroy {
  private promosSub?: Subscription;
  private itemsSub?: Subscription;
  private categoriesSub?: Subscription;
  filtroActivo: string = '';
  menuDestacadoFiltrado: Alimento[] = [];
  todasCategorias: Recomendacion[] = [];
  generarCategorias: any;

  @ViewChild(IonContent) content!: IonContent;

  menuDestacado: Alimento[] = [];
  promociones: PromotionSummaryResponse[] = [];

  constructor(
    private comidasService: ComidasService,
    private promotionsService: PromotionsService,
    private cartService: CartService,
    private loadingController: LoadingController,
    private toastController: ToastController,
    private modalController: ModalController
  ) {
    addIcons({ restaurant, receipt, pricetag, add, cart });
  }

  ngOnInit() {
    // Load promotions from API
    this.promosSub = this.promotionsService.getActivePromotions().subscribe({
      next: (promos) => {
        this.promociones = promos || [];
      },
      error: (err) => {
        console.error('Error loading promotions from API:', err);
      },
    });

    this.itemsSub = this.comidasService.items$.subscribe((items) => {
      this.menuDestacado = items;
      this.applyFeaturedFilter();
    });

    this.categoriesSub = this.comidasService.categories$.subscribe((cats) => {
      if (cats && cats.length > 0) {
        this.todasCategorias = [{ name: 'Todos' }, ...cats];
      } else {
        // this.generarCategorias(); // Removed as it seems undefined or not needed if logic is handled here
      }
      this.applyFeaturedFilter();
    });

    this.cargarDesdeApi();
    this.cargarCategoriasDesdeApi();
  }

  ngOnDestroy() {
    this.itemsSub?.unsubscribe();
    this.categoriesSub?.unsubscribe();
    this.promosSub?.unsubscribe();
  }

  doRefresh(event: RefresherCustomEvent) {
    setTimeout(() => {
      this.cargarDesdeApi();
      this.cargarCategoriasDesdeApi();
      this.promotionsService.getActivePromotions().subscribe({
        next: (promos) => {
          this.promociones = promos || [];
          event.target.complete();
        },
        error: () => event.target.complete(),
      });
    }, 1000);
  }

  navigateToTop() {
    this.content.scrollToTop(500);
  }

  navigateToBottom() {
    this.content.scrollToBottom(500);
  }

  cargarDesdeApi() {
    console.debug('Intentando cargar comidas desde API...');
    this.comidasService.loadFromApi().subscribe({
      next: (items) => {
        console.debug('Respuesta API comidas:', items);
        this.comidasService.setItems(items);
      },
      error: (err) => {
        console.error('Error al cargar comidas desde API:', err);
      },
    });
  }

  cargarCategoriasDesdeApi() {
    this.comidasService.loadCategories().subscribe({
      next: (res) => {
        try {
          const cats: Recomendacion[] = (res || []).map((c: any) => ({
            name: c.name || c.title || String(c),
            icon: c.icon || '🍽️',
            id: c.id,
          }));
          this.comidasService.setCategories(cats);
        } catch (e) {
          console.error('Error mapeando categories response', e);
        }
      },
      error: (err) => {
        console.error('Error al cargar categorías desde API:', err);
      },
    });
  }

  private applyFeaturedFilter() {
    const targetId = 5;

    this.comidasService.loadProductsByCategory(targetId).subscribe({
      next: (items) => {
        this.menuDestacadoFiltrado = items || [];
      },
      error: (err) => {
        console.error(
          `Error cargando productos de categoría ${targetId} desde backend:`,
          err
        );
        this.menuDestacadoFiltrado = this.menuDestacado.filter(
          (it) => Number(it.category?.id) === targetId
        );
      },
    });
  }

  async openPromoDetail(promocionSummary: PromotionSummaryResponse) {
    const loading = await this.loadingController.create({
      message: 'Cargando detalles...',
      duration: 3000,
    });
    await loading.present();

    this.promotionsService.getPromotionById(promocionSummary.id).subscribe({
      next: async (fullPromo) => {
        await loading.dismiss();
        const modal = await this.modalController.create({
          component: PromotionDetailModalComponent,
          componentProps: {
            promotion: fullPromo,
          },
        });

        await modal.present();

        const { data } = await modal.onWillDismiss();
        if (data?.added) {
          const toast = await this.toastController.create({
            message: `¡${fullPromo.name} agregada al carrito!`,
            duration: 2000,
            color: 'success',
            position: 'bottom',
            icon: 'cart',
          });
          await toast.present();
        }
      },
      error: async (err) => {
        console.error(err);
        await loading.dismiss();
        const toast = await this.toastController.create({
          message: 'Error al cargar los detalles.',
          duration: 2000,
          color: 'danger',
          position: 'bottom',
        });
        await toast.present();
      },
    });
  }

  // Deprecated direct add, kept for reference or direct action if needed
  async addPromoToCart(promocionSummary: PromotionSummaryResponse) {
    // ... existing logic ...
    this.openPromoDetail(promocionSummary); // Redirect to modal for now as per request
  }
}
