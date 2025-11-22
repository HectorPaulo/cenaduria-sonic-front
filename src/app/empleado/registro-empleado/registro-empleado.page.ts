import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  AbstractControl,
} from '@angular/forms';
import { Router } from '@angular/router';
import { HttpAuthService } from 'src/app/services/http-auth.service';
import { AuthService } from 'src/app/services/auth.service';
import {
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  IonText,
  ToastController,
  AlertController,
} from '@ionic/angular/standalone';
import { HeaderComponent } from 'src/app/components/header/header.component';

@Component({
  selector: 'app-registro-empleado',
  templateUrl: './registro-empleado.page.html',
  styleUrls: ['./registro-empleado.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonContent,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonCardContent,
    IonItem,
    IonLabel,
    IonInput,
    IonButton,
    IonText,
    HeaderComponent,
  ],
})
export class RegistroEmpleadoPage {
  empleadoForm: FormGroup;
  submitting = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private toastCtrl: ToastController,
    private httpAuth: HttpAuthService,
    private authService: AuthService,
    private alertCtrl: AlertController
  ) {
    this.empleadoForm = this.fb.group(
      {
        username: [
          '',
          [
            Validators.required,
            Validators.minLength(3),
            Validators.pattern(/^[A-Za-z0-9_]+$/),
          ],
        ],
        email: ['', [Validators.required, Validators.email]],
        password: [
          '',
          [
            Validators.required,
            Validators.minLength(8),
            this.hasUppercase,
            this.hasSpecialChar,
          ],
        ],
        confirmPassword: ['', [Validators.required]],
      },
      { validators: this.passwordsMatch }
    );
  }

  hasUppercase(control: AbstractControl) {
    const value = control.value || '';
    return /[A-Z]/.test(value) ? null : { requiresUppercase: true };
  }

  hasSpecialChar(control: AbstractControl) {
    const value = control.value || '';
    return /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(value)
      ? null
      : { requiresSpecialChar: true };
  }

  passwordsMatch(group: AbstractControl) {
    const pw = group.get('password')?.value;
    const cpw = group.get('confirmPassword')?.value;
    return pw && cpw && pw === cpw ? null : { passwordMismatch: true };
  }

  isFieldInvalid(name: string) {
    const ctrl = this.empleadoForm.get(name);
    return !!(ctrl && ctrl.invalid && (ctrl.dirty || ctrl.touched));
  }

  getError(name: string): string {
    const ctrl = this.empleadoForm.get(name);
    if (!ctrl) return '';

    if (ctrl.hasError('required')) return 'Este campo es obligatorio';
    if (ctrl.hasError('minlength')) return 'Valor demasiado corto';
    if (ctrl.hasError('email')) return 'Email inválido';
    if (ctrl.hasError('pattern')) {
      if (name === 'username')
        return 'El username solo puede contener letras, números y guiones bajos';
      return 'Formato inválido';
    }
    if (ctrl.hasError('requiresUppercase'))
      return 'Debe contener al menos una mayúscula';
    if (ctrl.hasError('requiresSpecialChar'))
      return 'Debe contener al menos un carácter especial';
    if (this.empleadoForm.hasError('passwordMismatch')) {
      if (name === 'confirmPassword') return 'Las contraseñas no coinciden';
    }
    return '';
  }

  async onSubmit() {
    if (this.empleadoForm.invalid) {
      Object.keys(this.empleadoForm.controls).forEach((k) =>
        this.empleadoForm.get(k)?.markAsTouched()
      );
      return;
    }

    this.submitting = true;
    const values = this.empleadoForm.value;
    const rawUsername = String(values.username || '').trim();
    const sanitizedUsername = rawUsername.replace(/[^A-Za-z0-9_]/g, '_');

    const payload = {
      username: sanitizedUsername,
      name: sanitizedUsername, 
      email: values.email,
      password: values.password,
      roles: ['ROLE_EMPLOYEE'],
    };
    console.debug('[RegistroEmpleado] register payload:', {
      username: payload.username,
      name: payload.name,
      email: payload.email,
    });

    const token =
      this.authService.getCurrentToken() ||
      localStorage.getItem('access_token') ||
      null;

    if (!token) {
      const toast = await this.toastCtrl.create({
        message:
          'Se requiere un token de administrador para registrar empleados. Inicia sesión como administrador o pega el token en localStorage.',
        color: 'danger',
        duration: 4000,
      });
      await toast.present();
      this.submitting = false;
      return;
    }

    let triedFallback = false;

    const doRegister = (payloadToSend: any) => {
      this.httpAuth.register(payloadToSend, token).subscribe({
        next: async (res: any) => {
          console.log('[RegistroEmpleado] register success', res);
          this.submitting = false;
          const toast = await this.toastCtrl.create({
            message: 'Empleado registrado correctamente',
            color: 'success',
            duration: 2000,
          });
          await toast.present();
          this.router.navigate(['/empleado/dashboard']);
        },
        error: async (err: any) => {
          console.error('[RegistroEmpleado] register failed', err);
          this.submitting = false;

          // Extract detailed info
          const validation = err?.error?.validationErrors;
          let msg = err?.error?.message || 'Error registrando empleado';
          if (validation) {
            msg += '\n' + JSON.stringify(validation, null, 2);
          } else if (err?.error && typeof err.error !== 'string') {
            msg += '\n' + JSON.stringify(err.error, null, 2);
          }

          const toast = await this.toastCtrl.create({
            message: msg.split('\n')[0],
            color: 'danger',
            duration: 6000,
          });
          await toast.present();

          try {
            const alert = await this.alertCtrl.create({
              header: 'Registro falló',
              subHeader: err?.status ? 'HTTP ' + err.status : undefined,
              message: `<pre style="white-space:pre-wrap">${msg}</pre>`,
              buttons: ['OK'],
            });
            await alert.present();
          } catch (e) {
            console.warn('[RegistroEmpleado] failed to present alert', e);
          }

          const validationText = JSON.stringify(validation || err?.error || '');
          const mentionsRoles = /role|roles|ROL|ROLE|roles/i.test(
            validationText
          );
          if (!triedFallback && mentionsRoles) {
            triedFallback = true;
            const fallback = { ...payloadToSend, roles: ['ROLE_USER'] };
            console.info(
              '[RegistroEmpleado] retrying with fallback roles:',
              fallback.roles
            );
            this.submitting = true;
            doRegister(fallback);
          }
        },
      });
    };

    doRegister(payload);
  }

  cancel() {
    this.router.navigate(['/empleado/dashboard']);
  }
}
