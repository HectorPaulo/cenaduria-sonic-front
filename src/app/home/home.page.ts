import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonRefresher,
  IonRefresherContent,
  IonIcon,
  LoadingController,
  ToastController,
  ModalController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  restaurant,
  receipt,
  pricetag,
  add,
  cart,
  addCircle,
} from 'ionicons/icons';
import { HeaderComponent } from '../components/header/header.component';
import { RouterLink } from '@angular/router';
import { RefresherCustomEvent } from '@ionic/core/components';
import { FabbtnComponent } from '../components/fabbtn/fabbtn.component';
import { Subscription } from 'rxjs';
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
    IonIcon,
    CommonModule,
    FormsModule,
    HeaderComponent,
    RouterLink,
    FabbtnComponent,
  ],
})
export class HomePage implements OnInit, OnDestroy {
  private promosSub?: Subscription;

  @ViewChild(IonContent) content!: IonContent;

  promociones: PromotionSummaryResponse[] = [];

  constructor(
    private promotionsService: PromotionsService,
    private cartService: CartService,
    private loadingController: LoadingController,
    private toastController: ToastController,
    private modalController: ModalController
  ) {
    addIcons({ restaurant, receipt, pricetag, addCircle, add, cart });
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
  }

  ngOnDestroy() {
    this.promosSub?.unsubscribe();
  }

  doRefresh(event: RefresherCustomEvent) {
    setTimeout(() => {
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
            cssClass: 'cart-toast',
            position: 'bottom',
            icon: 'checkmark-circle',
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
