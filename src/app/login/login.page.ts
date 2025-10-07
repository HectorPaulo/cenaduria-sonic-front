import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonButton,
  IonIcon,
  IonText,
  IonRefresher,
  RefresherEventDetail,
  IonRefresherContent,
  ToastController,
  IonCardSubtitle,
  IonItem,
  IonInput,
  LoadingController,
} from '@ionic/angular/standalone';
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
} from 'ionicons/icons';
import { IonRefresherCustomEvent } from '@ionic/core';
import { FabbtnComponent } from '../components/fabbtn/fabbtn.component';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  imports: [
    IonInput,
    IonItem,
    IonCardSubtitle,
    IonRefresherContent,
    IonRefresher,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonIcon,
    IonText,
    FabbtnComponent,
    IonButton,
    ReactiveFormsModule,
  ],
})
export class LoginPage {
  loginForm: FormGroup;

  doRefresh($event: IonRefresherCustomEvent<RefresherEventDetail>) {
    throw new Error('Method not implemented.');
  }
  private authService = inject(AuthService);
  private router = inject(Router);

  // Exponer enum para uso en template
  UserRole = UserRole;

  constructor(
    private formBuilder: FormBuilder,
    private toastController: ToastController,
    private loadingController: LoadingController
  ) {
    addIcons({ mail, key, logIn, personAdd, person, briefcase, settings });

    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
    });
  }

  getEmailErrorMessage(): string {
    const emailControl = this.loginForm.get('email');
    if (emailControl?.hasError('required')) {
      return 'El correo electrónico es obligatorio';
    }
    if (emailControl?.hasError('email')) {
      return 'Ingresa un correo electrónico válido';
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

  async loginAs(role: UserRole) {
    try {
      await this.authService.login(role);

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
    } catch (error) {
      console.error('Error during login:', error);
    }
  }
}
