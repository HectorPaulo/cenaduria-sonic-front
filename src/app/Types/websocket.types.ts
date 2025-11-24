/**
 * WebSocket Notification Types
 * Based on the API documentation from websocket-api.json
 */

export enum NotificationType {
  ORDER_CREATED = 'ORDER_CREATED',
  ORDER_UPDATED = 'ORDER_UPDATED',
  ORDER_STATUS_CHANGED = 'ORDER_STATUS_CHANGED',
  ORDER_ESTIMATED_TIME_CHANGED = 'ORDER_ESTIMATED_TIME_CHANGED',
  ORDER_CANCELLED = 'ORDER_CANCELLED',
}

export enum OrderStatus {
  PENDIENTE = 'PENDIENTE',
  EN_PREPARACION = 'EN_PREPARACION',
  LISTO = 'LISTO',
  ENTREGADO = 'ENTREGADO',
  CANCELADO = 'CANCELADO',
}

export enum WebSocketConnectionStatus {
  CONNECTED = 'CONNECTED',
  DISCONNECTED = 'DISCONNECTED',
  CONNECTING = 'CONNECTING',
  ERROR = 'ERROR',
}

export interface OrderNotification {
  orderId: number;
  userId: number;
  userName: string;
  status: OrderStatus;
  total: number;
  estimatedTime: string | null;
  createdAt: string;
  updatedAt: string;
  notificationType: NotificationType;
  message: string;
}

export interface NotificationWithMetadata extends OrderNotification {
  id: string;
  timestamp: Date;
  read: boolean;
}
