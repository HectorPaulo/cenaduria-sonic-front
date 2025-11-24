import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  Router,
  NavigationStart,
  NavigationEnd,
  NavigationCancel,
  NavigationError,
} from '@angular/router';
import { RouterLink, RouterLinkActive } from '@angular/router';
import {
  IonApp,
  IonSplitPane,
  IonMenu,
  IonContent,
  IonList,
  IonListHeader,
  IonNote,
  IonMenuToggle,
  IonItem,
  IonIcon,
  IonLabel,
  IonRouterOutlet,
  IonRouterLink,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  person,
  cart,
  document,
  home,
  people,
  pieChart,
  settings,
  clipboard,
  cube,
  logOut,
  speedometer,
  restaurant,
} from 'ionicons/icons';
import { ThemeService } from './services/theme.service';
import { AuthService, UserRole } from './services/auth.service';
import { WebSocketService } from './services/websocket.service';
import { NotificationService } from './services/notification.service';
import { ConnectionStatusComponent } from './components/connection-status/connection-status.component';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    IonApp,
    IonSplitPane,
    IonMenu,
    IonContent,
    IonList,
    IonListHeader,
    IonNote,
    IonMenuToggle,
    IonItem,
    IonIcon,
    IonLabel,
    IonRouterLink,
    IonRouterOutlet,
    ConnectionStatusComponent,
  ],
})
export class AppComponent implements OnInit, OnDestroy {
  private authService = inject(AuthService);
  private wsService = inject(WebSocketService);
  private notificationService = inject(NotificationService);
  private subscriptions: Subscription[] = [];

  public loading = false;
  public currentUser: any = null;
  public currentRole: UserRole | null = null;

  public clientePages = [
    {
      title: 'Inicio',
      url: '/cliente/home',
      icon: 'home',
    },
    {
      title: 'Menú',
      url: '/cliente/menu',
      icon: 'restaurant',
    },
    {
      title: 'Mis Pedidos',
      url: '/cliente/mis-pedidos',
      icon: 'clipboard',
    },
    {
      title: 'Carrito',
      url: '/cliente/carrito',
      icon: 'cart',
    },
    {
      title: 'Perfil',
      url: '/cliente/perfil',
      icon: 'person',
    },
  ];

  public empleadoPages = [
    {
      title: 'Dashboard',
      url: '/empleado/dashboard',
      icon: 'speedometer',
    },
    {
      title: 'Menú',
      url: '/cliente/menu',
      icon: 'restaurant',
    },
    {
      title: 'Perfil',
      url: '/empleado/perfil',
      icon: 'person',
    },
  ];

  public adminPages = [
    {
      title: 'Dashboard',
      url: '/admin/dashboard',
      icon: 'speedometer',
    },
    {
      title: 'Perfil',
      url: '/admin/perfil',
      icon: 'person',
    },
    {
      title: 'Menu',
      url: '/admin/menu',
      icon: 'restaurant',
    },
  ];

  constructor(private router: Router, private themeService: ThemeService) {
    addIcons({
      document,
      cart,
      person,
      home,
      people,
      pieChart,
      settings,
      clipboard,
      cube,
      logOut,
      speedometer,
      restaurant,
    });

    this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        this.loading = true;
      }
      if (
        event instanceof NavigationEnd ||
        event instanceof NavigationCancel ||
        event instanceof NavigationError
      ) {
        setTimeout(() => {
          this.loading = false;
        }, 400);
      }
    });
  }

  ngOnInit() {
    const authSub = this.authService.currentUser$.subscribe((user) => {
      this.currentUser = user;
      this.currentRole = user ? user.role : null;

      if (user) {
        this.connectWebSocket(user);
      } else {
        this.disconnectWebSocket();
      }
    });
    this.subscriptions.push(authSub);
  }

  ngOnDestroy() {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
    this.disconnectWebSocket();
  }

  private connectWebSocket(user: any): void {
    console.log('[App] Connecting WebSocket for user:', user.nombre);
    this.wsService.connect();

    // Wait for connection to be established before subscribing
    const connectionCheck = setInterval(() => {
      if (this.wsService.isConnected()) {
        console.log('[App] WebSocket connected, subscribing to channels...');
        clearInterval(connectionCheck);
        this.subscribeToNotifications(user);
      }
    }, 100); // Check every 100ms

    // Timeout after 10 seconds
    setTimeout(() => {
      clearInterval(connectionCheck);
      if (!this.wsService.isConnected()) {
        console.error('[App] WebSocket connection timeout');
      }
    }, 10000);
  }

  private subscribeToNotifications(user: any): void {
    const role = user.role;
    console.log('[App] User role:', role, 'User ID:', user.id);

    if (role === UserRole.EMPLEADO || role === UserRole.SYSADMIN) {
      console.log('[App] Subscribing to employee notifications...');
      const empSub = this.wsService
        .subscribeToEmployeeNotifications()
        .subscribe((notification) => {
          if (notification) {
            console.log(
              '[App] ✅ Employee notification received:',
              notification
            );
            this.notificationService.addNotification(notification);
          }
        });
      this.subscriptions.push(empSub);
      console.log('[App] ✅ Employee subscription active');
    }

    if (user.id) {
      console.log('[App] Subscribing to user notifications for user:', user.id);
      const userSub = this.wsService
        .subscribeToUserNotifications(Number(user.id))
        .subscribe((notification) => {
          if (notification) {
            console.log('[App] ✅ User notification received:', notification);
            this.notificationService.addNotification(notification);
          }
        });
      this.subscriptions.push(userSub);
      console.log('[App] ✅ User subscription active');
    }
  }

  private disconnectWebSocket(): void {
    console.log('[App] Disconnecting WebSocket');
    this.wsService.disconnect();
  }

  get currentMenuPages() {
    switch (this.currentRole) {
      case UserRole.CLIENTE:
        return this.clientePages;
      case UserRole.EMPLEADO:
        return this.empleadoPages;
      case UserRole.SYSADMIN:
        return this.adminPages;
      default:
        return [];
    }
  }

  get roleName() {
    switch (this.currentRole) {
      case UserRole.CLIENTE:
        return 'Cliente';
      case UserRole.EMPLEADO:
        return 'Empleado';
      case UserRole.SYSADMIN:
        return 'Administrador';
      default:
        return 'Invitado';
    }
  }

  async logout() {
    this.disconnectWebSocket();
    await this.authService.logout();
    this.router.navigate(['/login']);
  }

  get isLoggedIn() {
    return this.currentUser !== null;
  }
}
