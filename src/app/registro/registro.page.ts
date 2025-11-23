import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router } from '@angular/router';
import { HttpAuthService } from '../services/http-auth.service';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonItem,
  IonCardContent,
  IonIcon,
  IonInput,
  IonButton,
  IonText,
  ToastController,
  AlertController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { person, mail, key, personAdd, logIn } from 'ionicons/icons';
import { PasswordValidator } from '../validators/password.validator';

@Component({
  selector: 'app-registro',
  templateUrl: './registro.page.html',
  styleUrls: ['./registro.page.scss'],
  standalone: true,
  imports: [
    IonText,
    IonButton,
    IonInput,
    IonIcon,
    IonCardContent,
    IonItem,
    IonCardSubtitle,
    IonCardTitle,
    IonCardHeader,
    IonCard,
    IonContent,
    CommonModule,
    ReactiveFormsModule,
  ],
})
export class RegistroPage implements OnInit {
  registroForm: FormGroup;
  private router = inject(Router);

  constructor(
    private formBuilder: FormBuilder,
    private toastController: ToastController,
    private httpAuth: HttpAuthService,
    private alertCtrl: AlertController
  ) {
    addIcons({ person, mail, key, personAdd, logIn });

    this.registroForm = this.formBuilder.group({
      username: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.pattern(/^[A-Za-z0-9_]+$/),
        ],
      ],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, PasswordValidator.strongPassword()]],
      confirmPassword: [
        '',
        [
          Validators.required,
          PasswordValidator.passwordsMatch('password', 'confirmPassword'),
        ],
      ],
    });
  }

  getUsernameErrorMessage(): string {
    const ctrl = this.registroForm.get('username');
    if (!ctrl) return '';
    if (ctrl.hasError('required')) return 'El nombre de usuario es obligatorio';
    if (ctrl.hasError('minlength'))
      return 'El nombre de usuario debe tener al menos 3 caracteres';
    if (ctrl.hasError('pattern'))
      return 'El username solo puede contener letras, números y guiones bajos';
    return '';
  }

  ngOnInit() {}

  getEmailErrorMessage(): string {
    const emailControl = this.registroForm.get('email');
    if (emailControl?.hasError('required')) {
      return 'El correo electrónico es obligatorio';
    }
    if (emailControl?.hasError('email')) {
      return 'Ingresa un correo electrónico válido';
    }
    return '';
  }

  getPasswordErrorMessage(): string {
    const passwordControl = this.registroForm.get('password');
    if (passwordControl?.hasError('required')) {
      return 'La contraseña es obligatoria';
    }
    if (passwordControl?.hasError('minLength')) {
      return 'La contraseña debe tener al menos 8 caracteres';
    }
    if (passwordControl?.hasError('requiresUppercase')) {
      return 'La contraseña debe contener al menos una letra mayúscula';
    }
    if (passwordControl?.hasError('requiresSpecialChar')) {
      return 'La contraseña debe contener al menos un carácter especial (!@#$%^&*...)';
    }
    return '';
  }

  getConfirmPasswordErrorMessage(): string {
    const confirmPasswordControl = this.registroForm.get('confirmPassword');
    if (confirmPasswordControl?.hasError('required')) {
      return 'Debes confirmar la contraseña';
    }
    if (confirmPasswordControl?.hasError('passwordMismatch')) {
      return 'Las contraseñas no coinciden';
    }
    return '';
  }

  // Verificar si un campo es inválido y ha sido tocado
  isFieldInvalid(fieldName: string): boolean {
    const field = this.registroForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  // Verificar si el formulario es válido para habilitar el botón
  isFormValid(): boolean {
    return this.registroForm.valid;
  }

  // Método para navegar al login
  goToLogin() {
    this.router.navigate(['/login']);
  }

  // Método para mostrar toast
  private async showToast(message: string, color: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 3000,
      color: color,
      position: 'top',
    });
    toast.present();
  }

  // Método para manejar el envío del formulario
  async onSubmit() {
    if (!this.registroForm.valid) {
      // Mark fields touched and show error
      Object.keys(this.registroForm.controls).forEach((key) => {
        this.registroForm.get(key)?.markAsTouched();
      });
      await this.showToast(
        'Por favor, corrige los errores en el formulario',
        'danger'
      );
      return;
    }

    // Build payload for public user registration (ROLE_USER)
    const vals = this.registroForm.value;
    // Derive a username from email prefix and sanitize
    const email = String(vals.email || '').trim();
    const usernameRaw = email.split('@')[0] || `user${Date.now()}`;
    const username = String(usernameRaw).replace(/[^A-Za-z0-9_]/g, '_');
    const payload = {
      username,
      name: username,
      email,
      password: vals.password,
      roles: ['ROLE_USER'],
    };

    try {
      this.showToast('Registrando usuario...', 'medium');
      this.httpAuth.register(payload).subscribe({
        next: async (res: any) => {
          console.log('[Registro] success', res);
          await this.showToast('¡Cuenta creada exitosamente!', 'success');
          this.router.navigate(['/login']);
        },
        error: async (err: any) => {
          console.error('[Registro] failed', err);
          // extract validation details when present
          let msg = 'Error registrando usuario';
          if (err?.error) {
            if (err.error?.message) msg = err.error.message;
            else msg = JSON.stringify(err.error);
          } else if (err?.message) msg = err.message;

          await this.showToast(msg, 'danger');
          try {
            const alert = await this.alertCtrl.create({
              header: 'Registro falló',
              subHeader: err?.status ? 'HTTP ' + err.status : undefined,
              message: `<pre style="white-space:pre-wrap">${JSON.stringify(
                err?.error || err,
                null,
                2
              )}</pre>`,
              buttons: ['OK'],
            });
            await alert.present();
          } catch (e) {
            console.warn('Failed to show alert', e);
          }
        },
      });
    } catch (e) {
      console.error('Unexpected error registering', e);
      await this.showToast('Error inesperado', 'danger');
    }
  }
}
