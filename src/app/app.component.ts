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
  documentOutline,
} from 'ionicons/icons';
import { ThemeToggleComponent } from './components/theme-toggle/theme-toggle.component';
import { ThemeService } from './services/theme.service';
import { AuthService, UserRole } from './services/auth.service';
import { Icon } from 'ionicons/dist/types/components/icon/icon';

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
    ThemeToggleComponent,
  ],
})
export class AppComponent implements OnInit {
  private authService = inject(AuthService);

  public loading = false;
  public currentUser: any = null;
  public currentRole: UserRole | null = null;

  // Menús por rol
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
      title: 'Pedidos Pendientes',
      url: '/empleado/pedidos',
      icon: 'clipboard',
    },
    {
      title: 'Registro de Empleado',
      url: '/empleado/registro-empleado',
      icon: 'cube',
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
      title: 'Usuarios',
      url: '/admin/usuarios',
      icon: 'people',
    },
    {
      title: 'Reportes',
      url: '/admin/reportes',
      icon: 'pieChart'
    },
    {
      title: 'Perfil',
      url: '/admin/perfil',
      icon: 'person',
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
    // Suscribirse a cambios en el estado de autenticación
    this.authService.currentUser$.subscribe((user) => {
      this.currentUser = user;
      this.currentRole = user ? user.role : null;
    });
  }

  // Obtener las páginas del menú según el rol actual
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

  // Obtener el nombre del rol para mostrar
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

  // Método para cerrar sesión
  async logout() {
    await this.authService.logout();
    this.router.navigate(['/login']);
  }

  // Verificar si el usuario está logueado
  get isLoggedIn() {
    return this.currentUser !== null;
  }
}
