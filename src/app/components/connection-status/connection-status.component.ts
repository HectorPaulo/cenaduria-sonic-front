import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonBadge, IonIcon } from '@ionic/angular/standalone';
import { WebSocketService } from 'src/app/services/websocket.service';
import { AuthService } from 'src/app/services/auth.service';
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
  isUserLoggedIn = false;
  private subscription?: Subscription;
  private authSubscription?: Subscription;

  constructor(
    private wsService: WebSocketService,
    private authService: AuthService
  ) {
    addIcons({ wifi, wifiOutline });
  }

  ngOnInit() {
    // Subscribe to authentication state
    this.authSubscription = this.authService.currentUser$.subscribe((user) => {
      this.isUserLoggedIn = user !== null;
      console.log(
        '[ConnectionStatus Component] User logged in:',
        this.isUserLoggedIn
      );
    });

    // Subscribe to connection status
    this.subscription = this.wsService
      .getConnectionStatus()
      .subscribe((status) => {
        console.log('[ConnectionStatus Component] Status changed to:', status);
        this.connectionStatus = status;
      });
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
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
    // Only show when user is logged in AND there are connection issues
    return (
      this.isUserLoggedIn &&
      this.connectionStatus !== WebSocketConnectionStatus.CONNECTED
    );
  }
}
