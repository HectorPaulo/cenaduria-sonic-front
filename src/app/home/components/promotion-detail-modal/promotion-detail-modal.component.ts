import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButtons,
  IonButton,
  IonIcon,
  IonImg,
  IonList,
  IonItem,
  IonLabel,
  IonThumbnail,
  IonFooter,
  ModalController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  close,
  cart,
  calendar,
  time,
  informationCircle,
  restaurant,
} from 'ionicons/icons';
import { PromotionDetailResponse } from '../../../services/promotions.service';
import { CartService } from '../../../services/cart.service';

@Component({
  selector: 'app-promotion-detail-modal',
  templateUrl: './promotion-detail-modal.component.html',
  styleUrls: ['./promotion-detail-modal.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonButtons,
    IonButton,
    IonIcon,
    IonImg,
    IonList,
    IonItem,
    IonLabel,
    IonThumbnail,
    IonFooter,
  ],
})
export class PromotionDetailModalComponent implements OnInit {
  @Input() promotion!: PromotionDetailResponse;

  constructor(
    private modalController: ModalController,
    private cartService: CartService
  ) {
    addIcons({ close, informationCircle, calendar, restaurant, cart, time });
  }

  ngOnInit() {}

  dismiss() {
    this.modalController.dismiss();
  }

  addToCart() {
    this.cartService.addPromotion(this.promotion as any, 1);
    this.modalController.dismiss({ added: true });
  }

  getDaysLabel(day: string): string {
    const days: { [key: string]: string } = {
      MONDAY: 'Lunes',
      TUESDAY: 'Martes',
      WEDNESDAY: 'Miércoles',
      THURSDAY: 'Jueves',
      FRIDAY: 'Viernes',
      SATURDAY: 'Sábado',
      SUNDAY: 'Domingo',
    };
    return days[day] || day;
  }
}
