import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonItem, IonCardContent, IonIcon, IonInput, IonButton, IonText } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { person, mail, key, personAdd, logIn} from 'ionicons/icons';

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
    IonHeader,
    IonTitle,
    IonToolbar,
    CommonModule,
    ReactiveFormsModule
  ]
})
export class RegistroPage implements OnInit {
  registroForm: FormGroup;

  constructor(private formBuilder: FormBuilder) {
    addIcons({person, mail, key, personAdd, logIn});
    
    this.registroForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit() {
  }

  // Validador personalizado para confirmar que las contraseñas coincidan
  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    
    if (password && confirmPassword && password !== confirmPassword) {
      form.get('confirmPassword')?.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    
    return null;
  }

  // Método para obtener mensaje de error del email
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

  // Método para obtener mensaje de error de la contraseña
  getPasswordErrorMessage(): string {
    const passwordControl = this.registroForm.get('password');
    if (passwordControl?.hasError('required')) {
      return 'La contraseña es obligatoria';
    }
    if (passwordControl?.hasError('minlength')) {
      return 'La contraseña debe tener al menos 8 caracteres';
    }
    return '';
  }

  // Método para obtener mensaje de error de confirmar contraseña
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

  // Método para manejar el envío del formulario
  onSubmit() {
    if (this.registroForm.valid) {
      console.log('Formulario válido:', this.registroForm.value);
      // Aquí implementarías la lógica de registro
    } else {
      // Marcar todos los campos como tocados para mostrar errores
      Object.keys(this.registroForm.controls).forEach(key => {
        this.registroForm.get(key)?.markAsTouched();
      });
    }
  }
}