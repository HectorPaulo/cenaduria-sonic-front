import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router } from '@angular/router';
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
    private toastController: ToastController
  ) {
    addIcons({ person, mail, key, personAdd, logIn });

    this.registroForm = this.formBuilder.group({
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
    if (this.registroForm.valid) {
      console.log('Formulario válido:', this.registroForm.value);
      await this.showToast('¡Cuenta creada exitosamente!', 'success');
      // Redirigir al login después del registro exitoso
      this.router.navigate(['/login']);
    } else {
      // Marcar todos los campos como tocados para mostrar errores
      Object.keys(this.registroForm.controls).forEach((key) => {
        this.registroForm.get(key)?.markAsTouched();
      });
      await this.showToast(
        'Por favor, corrige los errores en el formulario',
        'danger'
      );
    }
  }
}
