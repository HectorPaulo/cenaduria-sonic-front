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
  alertCircle,
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
    IonFooter,
  ],
})
export class PromotionDetailModalComponent implements OnInit {
  @Input() promotion!: PromotionDetailResponse;

  constructor(
    private modalController: ModalController,
    private cartService: CartService
  ) {
    addIcons({
      close,
      informationCircle,
      calendar,
      restaurant,
      cart,
      time,
      alertCircle,
    });
  }

  isValid: boolean = true;
  validityMessage: string = '';

  ngOnInit() {
    this.checkValidity();
  }

  checkValidity() {
    const now = new Date();
    this.isValid = true;
    this.validityMessage = '';

    if (!this.promotion.active) {
      this.isValid = false;
      this.validityMessage = 'Esta promoción no está activa.';
      return;
    }

    if (this.promotion.type === 'TEMPORARY') {
      if (this.promotion.startsAt && this.promotion.endsAt) {
        const start = new Date(this.promotion.startsAt);
        // Ajustar start para que sea al inicio del día si viene solo fecha (YYYY-MM-DD)
        // Si viene con hora, se respeta. Asumimos YYYY-MM-DD por defecto en inputs date.
        // Pero mejor asegurarse.

        const end = new Date(this.promotion.endsAt);
        end.setHours(23, 59, 59, 999); // Final del día

        if (now < start) {
          this.isValid = false;
          this.validityMessage = `Esta promoción comienza el ${start.toLocaleDateString()}`;
        } else if (now > end) {
          this.isValid = false;
          this.validityMessage = `Esta promoción expiró el ${end.toLocaleDateString()}`;
        }
      }
    } else if (this.promotion.type === 'RECURRING') {
      if (this.promotion.weeklyRules && this.promotion.weeklyRules.length > 0) {
        const days = [
          'SUNDAY',
          'MONDAY',
          'TUESDAY',
          'WEDNESDAY',
          'THURSDAY',
          'FRIDAY',
          'SATURDAY',
        ];
        const currentDay = days[now.getDay()];

        const rule = this.promotion.weeklyRules.find(
          (r) => r.dayOfWeek === currentDay
        );

        if (!rule) {
          this.isValid = false;
          this.validityMessage = 'Esta promoción no está disponible hoy.';
          return;
        }

        // Validar hora
        const currentMinutes = now.getHours() * 60 + now.getMinutes();

        let startMinutes = 0;
        let endMinutes = 0;

        // Manejar si es objeto LocalTime o string
        const parseTime = (time: any) => {
          if (typeof time === 'object' && time !== null) {
            return time.hour * 60 + time.minute;
          } else if (typeof time === 'string') {
            const [h, m] = time.split(':').map(Number);
            return h * 60 + m;
          }
          return 0;
        };

        startMinutes = parseTime(rule.startTime);
        endMinutes = parseTime(rule.endTime);

        if (currentMinutes < startMinutes || currentMinutes > endMinutes) {
          this.isValid = false;
          // Formatear hora para mensaje
          const formatTime = (mins: number) => {
            const h = Math.floor(mins / 60);
            const m = mins % 60;
            return `${h.toString().padStart(2, '0')}:${m
              .toString()
              .padStart(2, '0')}`;
          };
          this.validityMessage = `Disponible hoy de ${formatTime(
            startMinutes
          )} a ${formatTime(endMinutes)}`;
        }
      }
    }
  }

  dismiss() {
    this.modalController.dismiss();
  }

  addToCart() {
    if (!this.isValid) return;
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
