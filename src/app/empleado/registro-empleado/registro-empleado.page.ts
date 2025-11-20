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
  IonHeader,
  IonToolbar,
  IonTitle,
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
} from '@ionic/angular/standalone';
import { HeaderComponent } from "src/app/components/header/header.component";

@Component({
  selector: 'app-registro-empleado',
  templateUrl: './registro-empleado.page.html',
  styleUrls: ['./registro-empleado.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonContent,
    IonHeader,
    IonToolbar,
    IonTitle,
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
    HeaderComponent
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
    private authService: AuthService
  ) {
    this.empleadoForm = this.fb.group(
      {
        nombre: ['', [Validators.required, Validators.minLength(3)]],
        email: ['', [Validators.required, Validators.email]],
        telefono: ['', [Validators.pattern(/^[0-9()+\-\s]*$/)]],
        puesto: ['', [Validators.required]],
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

  // Custom validators
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
    if (ctrl.hasError('pattern')) return 'Formato inválido';
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
    const payload = {
      username: values.email || values.nombre,
      email: values.email,
      password: values.password,
      roles: ['ROLE_EMPLOYEE'],
      // additional metadata if backend accepts it
      puesto: values.puesto,
      telefono: values.telefono,
    };

    // Use admin token from AuthService/localStorage to authorize registration
    const token =
      this.authService.getCurrentToken() ||
      localStorage.getItem('access_token') ||
      null;

    this.httpAuth.register(payload, token).subscribe({
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
        const msg =
          err?.error?.message || err?.message || 'Error registrando empleado';
        const toast = await this.toastCtrl.create({
          message: msg,
          color: 'danger',
          duration: 3000,
        });
        await toast.present();
      },
    });
  }

  cancel() {
    this.router.navigate(['/empleado/dashboard']);
  }
}
