import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonBadge, IonIcon } from '@ionic/angular/standalone';
import { WebSocketService } from 'src/app/services/websocket.service';
import { WebSocketConnectionStatus } from 'src/app/Types/websocket.types';
import { Subscription } from 'rxjs';
import { addIcons } from 'ionicons';
import { wifi, wifiOutline } from 'ionicons/icons';

@Component({
  selector: 'app-connection-status',
  templateUrl: './connection-status.component.html',
  styleUrls: ['./connection-status.component.scss'],
  standalone: true,
  imports: [CommonModule, IonBadge, IonIcon],
})
export class ConnectionStatusComponent implements OnInit, OnDestroy {
  connectionStatus: WebSocketConnectionStatus =
    WebSocketConnectionStatus.DISCONNECTED;
  private subscription?: Subscription;

  constructor(private wsService: WebSocketService) {
    addIcons({ wifi, wifiOutline });
  }

  ngOnInit() {
    this.subscription = this.wsService
      .getConnectionStatus()
      .subscribe((status) => {
        this.connectionStatus = status;
      });
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  get statusColor(): string {
    switch (this.connectionStatus) {
      case WebSocketConnectionStatus.CONNECTED:
        return 'success';
      case WebSocketConnectionStatus.CONNECTING:
        return 'warning';
      case WebSocketConnectionStatus.ERROR:
      case WebSocketConnectionStatus.DISCONNECTED:
        return 'danger';
      default:
        return 'medium';
    }
  }

  get statusText(): string {
    switch (this.connectionStatus) {
      case WebSocketConnectionStatus.CONNECTED:
        return 'Conectado';
      case WebSocketConnectionStatus.CONNECTING:
        return 'Conectando...';
      case WebSocketConnectionStatus.ERROR:
        return 'Error';
      case WebSocketConnectionStatus.DISCONNECTED:
        return 'Desconectado';
      default:
        return 'Desconocido';
    }
  }

  get shouldShow(): boolean {
    // Only show when there are connection issues
    return this.connectionStatus !== WebSocketConnectionStatus.CONNECTED;
  }
}
