import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {
  IonContent,
  IonIcon,
  RefresherEventDetail,
  ToastController,
  LoadingController,
} from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { AuthService, UserRole } from '../services/auth.service';
import { addIcons } from 'ionicons';
import {
  person,
  briefcase,
  settings,
  logIn,
  mail,
  key,
  personAdd,
  informationCircle,
} from 'ionicons/icons';
import { IonRefresherCustomEvent } from '@ionic/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Usuarios } from '../services/usuarios.service';
import { HttpAuthService } from '../services/http-auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  imports: [CommonModule, IonContent, IonIcon, ReactiveFormsModule],
})
export class LoginPage implements OnInit {
  loginForm: FormGroup;

  doRefresh($event: IonRefresherCustomEvent<RefresherEventDetail>) {
    throw new Error('Method not implemented.');
  }
  private authService = inject(AuthService);
  private router = inject(Router);
  private usuarios = inject(Usuarios);
  private httpAuth = inject(HttpAuthService);

  UserRole = UserRole;

  constructor(
    private formBuilder: FormBuilder,
    private toastController: ToastController,
    private loadingController: LoadingController
  ) {
    try {
      console.debug('[LoginPage] diagnostics', this.httpAuth.getDiagnostics());
    } catch (e) {
      console.debug('[LoginPage] diagnostics unavailable', e);
    }
    addIcons({
      mail,
      key,
      logIn,
      personAdd,
      person,
      briefcase,
      settings,
      informationCircle,
    });

    this.loginForm = this.formBuilder.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      password: [
        '',
        [
          Validators.required,
          Validators.minLength(8),
          Validators.pattern(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/),
        ],
      ],
    });
  }

  getUsernameErrorMessage(): string {
    const usernameControl = this.loginForm.get('username');
    if (usernameControl?.hasError('required')) {
      return 'El nombre de usuario es obligatorio';
    }
    if (usernameControl?.hasError('minlength')) {
      return 'El nombre de usuario debe tener al menos 3 caracteres';
    }
    return '';
  }

  getPasswordErrorMessage(): string {
    const passwordControl = this.loginForm.get('password');
    if (passwordControl?.hasError('required')) {
      return 'La contraseña es obligatoria';
    }
    if (passwordControl?.hasError('minlength')) {
      return 'La contraseña debe tener al menos 8 caracteres';
    }
    return '';
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.loginForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  isFormValid(): boolean {
    return this.loginForm.valid;
  }

  goToRegister() {
    this.showToast('Redirigiendo a registro', 'primary');
    this.router.navigate(['/registro']);
  }

  onForgotPassword() {
    this.showToast('Función de recuperación de contraseña', 'warning');
  }

  private async showToast(message: string, color: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 3000,
      color: color,
      position: 'top',
    });
    toast.present();
  }

  private validCredentials = {
    cliente: { password: 'Cliente123!', role: UserRole.CLIENTE },
    customer: { password: 'Customer1!', role: UserRole.CLIENTE },

    empleado: { password: 'Empleado123!', role: UserRole.EMPLEADO },
    worker: { password: 'Worker123!', role: UserRole.EMPLEADO },

    admin: { password: 'Admin123!', role: UserRole.SYSADMIN },
    sysadmin: { password: 'SysAdmin1!', role: UserRole.SYSADMIN },
  };

  async onLogin() {
    if (!this.loginForm.valid) {
      await this.showToast(
        'Por favor, completa todos los campos correctamente',
        'danger'
      );
      return;
    }

    const username = this.loginForm.get('username')?.value;
    const password = this.loginForm.get('password')?.value;

    const loading = await this.loadingController.create({
      message: 'Iniciando sesión...',
      duration: 1500,
    });
    await loading.present();

    this.authService.loginRemote(username, password).subscribe({
      next: async (user) => {
        await loading.dismiss();

        if (!user) {
          await this.showToast('Credenciales incorrectas', 'danger');
          return;
        }

        const role = user.role as unknown as string;
        if (role === UserRole.CLIENTE || role === 'cliente') {
          this.navigateToRole(UserRole.CLIENTE);
        } else if (role === UserRole.EMPLEADO || role === 'empleado') {
          this.navigateToRole(UserRole.EMPLEADO);
        } else if (role === UserRole.SYSADMIN || role === 'sysadmin') {
          this.navigateToRole(UserRole.SYSADMIN);
        } else {
          this.navigateToRole(UserRole.CLIENTE);
        }
      },
      error: async (err) => {
        await loading.dismiss();
        console.error('[LoginPage] login error', err);
        let message = 'Credenciales incorrectas';
        if (
          err instanceof ProgressEvent ||
          err?.message === 'Failed to fetch' ||
          err?.status === 0
        ) {
          message =
            'Error de red: no se pudo conectar al backend. Revisa que el servidor esté arriba y la URL en environment.BASE_URL.';
        } else if (err?.error?.message) {
          message = err.error.message;
        } else if (err?.status) {
          message = `Error ${err.status}: ${
            err.statusText || 'Unexpected error'
          }`;
        }

        await this.showToast(message, 'danger');
      },
    });
  }

  private getRoleName(role: UserRole): string {
    switch (role) {
      case UserRole.CLIENTE:
        return 'Cliente';
      case UserRole.EMPLEADO:
        return 'Empleado';
      case UserRole.SYSADMIN:
        return 'Administrador';
      default:
        return 'Usuario';
    }
  }

  private navigateToRole(role: UserRole) {
    switch (role) {
      case UserRole.CLIENTE:
        this.router.navigate(['/cliente/home']);
        break;
      case UserRole.EMPLEADO:
        this.router.navigate(['/empleado/dashboard']);
        break;
      case UserRole.SYSADMIN:
        this.router.navigate(['/admin/dashboard']);
        break;
    }
  }

  async loginAs(role: UserRole) {
    try {
      await this.authService.login(role);
      this.navigateToRole(role);
    } catch (error) {
      console.error('Error during login:', error);
    }
  }

  ngOnInit(): void {
    try {
      const token = localStorage.getItem('access_token');
      const logged = this.authService.isLoggedIn();
      console.debug(
        '[LoginPage] ngOnInit auto-login check, token?',
        !!token,
        'logged?',
        logged
      );
      if (token && logged) {
        const role = this.authService.getUserRole();
        if (role) {
          this.navigateToRole(role);
        }
      }
    } catch (e) {
      console.error('[LoginPage] auto-login check failed', e);
    }
  }
}
