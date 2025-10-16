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
  ],
})
export class RegistroEmpleadoPage {
  empleadoForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private toastCtrl: ToastController
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

    // Aquí podrías enviar al backend; de momento sólo mostramos un toast
    const toast = await this.toastCtrl.create({
      message: 'Empleado creado (simulado)',
      color: 'success',
      duration: 2000,
    });
    await toast.present();
    this.router.navigate(['/empleado/dashboard']);
  }

  cancel() {
    this.router.navigate(['/empleado/dashboard']);
  }
}
