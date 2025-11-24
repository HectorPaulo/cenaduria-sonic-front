import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ToastController } from '@ionic/angular';
import {
  OrderNotification,
  NotificationWithMetadata,
  NotificationType,
} from '../Types/websocket.types';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private notifications = new BehaviorSubject<NotificationWithMetadata[]>([]);
  private readonly MAX_NOTIFICATIONS = 50;

  constructor(private toastController: ToastController) {}

  /**
   * Get all notifications as observable
   */
  get notifications$(): Observable<NotificationWithMetadata[]> {
    return this.notifications.asObservable();
  }

  /**
   * Add a new notification
   */
  async addNotification(notification: OrderNotification): Promise<void> {
    const notificationWithMetadata: NotificationWithMetadata = {
      ...notification,
      id: `${notification.orderId}-${Date.now()}`,
      timestamp: new Date(),
      read: false,
    };

    const current = this.notifications.value;
    const updated = [notificationWithMetadata, ...current].slice(
      0,
      this.MAX_NOTIFICATIONS
    );
    this.notifications.next(updated);

    // Show toast notification
    await this.showToast(notification);
  }

  /**
   * Mark notification as read
   */
  markAsRead(notificationId: string): void {
    const current = this.notifications.value;
    const updated = current.map((n) =>
      n.id === notificationId ? { ...n, read: true } : n
    );
    this.notifications.next(updated);
  }

  /**
   * Mark all notifications as read
   */
  markAllAsRead(): void {
    const current = this.notifications.value;
    const updated = current.map((n) => ({ ...n, read: true }));
    this.notifications.next(updated);
  }

  /**
   * Get unread notification count
   */
  getUnreadCount(): number {
    return this.notifications.value.filter((n) => !n.read).length;
  }

  /**
   * Clear all notifications
   */
  clearNotifications(): void {
    this.notifications.next([]);
  }

  /**
   * Show toast notification
   */
  private async showToast(notification: OrderNotification): Promise<void> {
    const color = this.getToastColor(notification.notificationType);
    const icon = this.getToastIcon(notification.notificationType);

    const toast = await this.toastController.create({
      message: notification.message,
      duration: 5000,
      position: 'top',
      color: color,
      icon: icon,
      buttons: [
        {
          text: 'Cerrar',
          role: 'cancel',
        },
      ],
      cssClass: 'notification-toast',
    });

    await toast.present();
  }

  /**
   * Get toast color based on notification type
   */
  private getToastColor(type: NotificationType): string {
    switch (type) {
      case NotificationType.ORDER_CREATED:
        return 'success';
      case NotificationType.ORDER_UPDATED:
        return 'primary';
      case NotificationType.ORDER_STATUS_CHANGED:
        return 'tertiary';
      case NotificationType.ORDER_ESTIMATED_TIME_CHANGED:
        return 'warning';
      case NotificationType.ORDER_CANCELLED:
        return 'danger';
      default:
        return 'medium';
    }
  }

  /**
   * Get toast icon based on notification type
   */
  private getToastIcon(type: NotificationType): string {
    switch (type) {
      case NotificationType.ORDER_CREATED:
        return 'add-circle';
      case NotificationType.ORDER_UPDATED:
        return 'create';
      case NotificationType.ORDER_STATUS_CHANGED:
        return 'swap-horizontal';
      case NotificationType.ORDER_ESTIMATED_TIME_CHANGED:
        return 'time';
      case NotificationType.ORDER_CANCELLED:
        return 'close-circle';
      default:
        return 'notifications';
    }
  }
}
