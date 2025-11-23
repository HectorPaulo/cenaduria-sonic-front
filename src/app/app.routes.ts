import { Routes } from '@angular/router';
import { RoleGuard } from './guards/role.guard';
import { UserRole } from './services/auth.service';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () => import('./login/login.page').then((m) => m.LoginPage),
  },
  {
    path: 'registro',
    loadComponent: () =>
      import('./registro/registro.page').then((m) => m.RegistroPage),
  },

  // ? Rutas para CLIENTES
  {
    path: 'cliente',
    canActivate: [RoleGuard],
    data: { roles: [UserRole.CLIENTE, UserRole.SYSADMIN] },
    children: [
      {
        path: 'home',
        loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
      },
      {
        path: 'menu',
        loadComponent: () => import('./menu/menu.page').then((m) => m.MenuPage),
      },
      {
        path: 'carrito',
        loadComponent: () =>
          import('./carrito/carrito.page').then((m) => m.CarritoPage),
      },
      {
        path: 'perfil',
        loadComponent: () =>
          import('./perfil/perfil.page').then((m) => m.PerfilPage),
      },
      {
        path: 'pedidos',
        loadComponent: () =>
          import('./pedidos/pedidos.page').then((m) => m.PedidosPage),
      },
    ],
  },

  // ? Rutas para EMPLEADOS
  {
    path: 'empleado',
    canActivate: [RoleGuard],
    data: { roles: [UserRole.EMPLEADO, UserRole.SYSADMIN] },
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./empleado/dashboard/dashboard.page').then(
            (m) => m.DashboardPage
          ),
      },
      {
        path: 'pedidos',
        loadComponent: () =>
          import('./empleado/pedidos/pedidos.page').then(
            (m) => m.PedidosEmpleadoPage
          ),
      },
      {
        path: 'inventario',
        loadComponent: () =>
          import('./empleado/inventario/inventario.page').then(
            (m) => m.InventarioPage
          ),
      },
      {
        path: 'editar-menu',
        loadComponent: () =>
          import('./empleado/editar-menu/editar-menu.page').then(
            (m) => m.EditarMenuPage
          ),
      },
      {
        path: 'perfil',
        loadComponent: () =>
          import('./perfil/perfil.page').then((m) => m.PerfilPage),
      },
      {
        path: 'registro-empleado',
        loadComponent: () =>
          import('./empleado/registro-empleado/registro-empleado.page').then(
            (m) => m.RegistroEmpleadoPage
          ),
      },
    ],
  },

  // ! Rutas para SYSADMIN
  {
    path: 'admin',
    canActivate: [RoleGuard],
    data: { roles: [UserRole.SYSADMIN] },
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./admin/dashboard/dashboard.page').then(
            (m) => m.AdminDashboardPage
          ),
      },
      {
        path: 'usuarios',
        loadComponent: () =>
          import('./admin/usuarios/usuarios.page').then((m) => m.UsuariosPage),
      },
      {
        path: 'reportes',
        loadComponent: () =>
          import('./admin/reportes/reportes.page').then((m) => m.ReportesPage),
      },
      {
        path: 'perfil',
        loadComponent: () =>
          import('./perfil/perfil.page').then((m) => m.PerfilPage),
      }
    ],
  },

  // Rutas de compatibilidad (redirigen según el rol)
  {
    path: 'home',
    redirectTo: 'cliente/home',
    pathMatch: 'full',
  },
  {
    path: 'menu',
    redirectTo: 'cliente/menu',
    pathMatch: 'full',
  },
  {
    path: 'pedidos',
    redirectTo: 'cliente/pedidos',
    pathMatch: 'full',
  },
  {
    path: 'perfil',
    redirectTo: 'cliente/perfil',
    pathMatch: 'full',
  },
  {
    path: 'carrito',
    redirectTo: 'cliente/carrito',
    pathMatch: 'full',
  },
  {
    path: 'registro',
    loadComponent: () =>
      import('./registro/registro.page').then((m) => m.RegistroPage),
  },
  {
    path: 'about',
    loadComponent: () => import('./about/about.page').then((m) => m.AboutPage),
  },
  {
    path: 'registro-empleado',
    loadComponent: () =>
      import('./empleado/registro-empleado/registro-empleado.page').then(
        (m) => m.RegistroEmpleadoPage
      ),
  },
];
