import { Component, OnInit, inject } from '@angular/core';
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
import { ThemeToggleComponent } from './components/theme-toggle/theme-toggle.component';
import { ThemeService } from './services/theme.service';
import { AuthService, UserRole } from './services/auth.service';
import { Title } from '@angular/platform-browser';

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
  ],
})
export class AppComponent implements OnInit {
  private authService = inject(AuthService);

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
      url: '/cliente/pedidos',
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
      title: 'Menu',
      url: '/empleado/menu',
      icon: 'restaurant',
    },
    {
      title: 'Pedidos Pendientes',
      url: '/empleado/pedidos',
      icon: 'clipboard',
    },
    {
      title: 'Perfil',
      url: '/empleado/perfil',
      icon: 'person',
    },
    {
      title: 'Registro de Empleado',
      url: '/empleado/registro-empleado',
      icon: 'cube',
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
    this.authService.currentUser$.subscribe((user) => {
      this.currentUser = user;
      this.currentRole = user ? user.role : null;
    });
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
    await this.authService.logout();
    this.router.navigate(['/login']);
  }

  get isLoggedIn() {
    return this.currentUser !== null;
  }
}
