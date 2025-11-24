import { Injectable } from '@angular/core';
import { Client, StompSubscription, IMessage } from '@stomp/stompjs';
import { BehaviorSubject, Observable } from 'rxjs';
import {
  OrderNotification,
  WebSocketConnectionStatus,
} from '../Types/websocket.types';
import { environment } from '../../environments/environment';
import SockJS from 'sockjs-client';

@Injectable({
  providedIn: 'root',
})
export class WebSocketService {
  private client: Client;
  private connected = new BehaviorSubject<WebSocketConnectionStatus>(
    WebSocketConnectionStatus.DISCONNECTED
  );
  private employeeNotifications = new BehaviorSubject<OrderNotification | null>(
    null
  );
  private userNotifications = new BehaviorSubject<OrderNotification | null>(
    null
  );
  private subscriptions: StompSubscription[] = [];

  constructor() {
    this.client = new Client();
    this.setupClient();
  }

  private setupClient(): void {
    // Configure WebSocket factory with SockJS
    this.client.webSocketFactory = () => new SockJS(environment.WS_URL);

    // Connection successful
    this.client.onConnect = (frame) => {
      console.log('[WebSocket] Connected:', frame);
      this.connected.next(WebSocketConnectionStatus.CONNECTED);
    };

    // Connection error
    this.client.onStompError = (frame) => {
      console.error('[WebSocket] STOMP Error:', frame);
      this.connected.next(WebSocketConnectionStatus.ERROR);
    };

    // WebSocket closed
    this.client.onWebSocketClose = () => {
      console.log('[WebSocket] Connection closed');
      this.connected.next(WebSocketConnectionStatus.DISCONNECTED);
    };

    // Auto-reconnect every 5 seconds
    this.client.reconnectDelay = 5000;

    // Debug mode (disable in production)
    this.client.debug = (str) => {
      if (!environment.production) {
        console.log('[WebSocket Debug]', str);
      }
    };
  }

  /**
   * Connect to WebSocket server
   */
  connect(): void {
    if (this.client.active) {
      console.warn('[WebSocket] Already connected or connecting');
      return;
    }

    console.log('[WebSocket] Connecting to:', environment.WS_URL);
    this.connected.next(WebSocketConnectionStatus.CONNECTING);
    this.client.activate();
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect(): void {
    console.log('[WebSocket] Disconnecting...');
    this.unsubscribeAll();
    this.client.deactivate();
    this.connected.next(WebSocketConnectionStatus.DISCONNECTED);
  }

  /**
   * Subscribe to employee notifications channel
   * Employees receive notifications about orders created/updated by users
   */
  subscribeToEmployeeNotifications(): Observable<OrderNotification | null> {
    if (!this.client.connected) {
      console.warn(
        '[WebSocket] Cannot subscribe to employees channel - not connected'
      );
      return this.employeeNotifications.asObservable();
    }

    const topic = '/topic/orders/employees';
    console.log('[WebSocket] Subscribing to:', topic);

    const subscription = this.client.subscribe(topic, (message: IMessage) => {
      try {
        const notification: OrderNotification = JSON.parse(message.body);
        console.log(
          '[WebSocket] Employee notification received:',
          notification
        );
        this.employeeNotifications.next(notification);
      } catch (error) {
        console.error(
          '[WebSocket] Error parsing employee notification:',
          error
        );
      }
    });

    this.subscriptions.push(subscription);
    return this.employeeNotifications.asObservable();
  }

  /**
   * Subscribe to user-specific notifications channel
   * Users receive notifications about their orders being updated by employees
   * @param userId - The ID of the user to subscribe to
   */
  subscribeToUserNotifications(
    userId: number
  ): Observable<OrderNotification | null> {
    if (!this.client.connected) {
      console.warn(
        '[WebSocket] Cannot subscribe to user channel - not connected'
      );
      return this.userNotifications.asObservable();
    }

    const topic = `/topic/orders/user/${userId}`;
    console.log('[WebSocket] Subscribing to:', topic);

    const subscription = this.client.subscribe(topic, (message: IMessage) => {
      try {
        const notification: OrderNotification = JSON.parse(message.body);
        console.log('[WebSocket] User notification received:', notification);
        this.userNotifications.next(notification);
      } catch (error) {
        console.error('[WebSocket] Error parsing user notification:', error);
      }
    });

    this.subscriptions.push(subscription);
    return this.userNotifications.asObservable();
  }

  /**
   * Get connection status as observable
   */
  getConnectionStatus(): Observable<WebSocketConnectionStatus> {
    return this.connected.asObservable();
  }

  /**
   * Check if currently connected
   */
  isConnected(): boolean {
    return this.client.connected;
  }

  /**
   * Unsubscribe from all active subscriptions
   */
  private unsubscribeAll(): void {
    console.log(
      `[WebSocket] Unsubscribing from ${this.subscriptions.length} subscriptions`
    );
    this.subscriptions.forEach((sub) => sub.unsubscribe());
    this.subscriptions = [];
  }
}
