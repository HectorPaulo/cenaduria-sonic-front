import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export class PasswordValidator {
  /**
   * Validador que requiere:
   * - Mínimo 8 caracteres
   * - Al menos una letra mayúscula
   * - Al menos un carácter especial
   */
  static strongPassword(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null; // Deja que 'required' maneje este caso
      }

      const password = control.value;
      const errors: ValidationErrors = {};

      // Verificar longitud mínima
      if (password.length < 8) {
        errors['minLength'] = {
          requiredLength: 8,
          actualLength: password.length,
        };
      }

      // Verificar mayúscula
      if (!/[A-Z]/.test(password)) {
        errors['requiresUppercase'] = true;
      }

      // Verificar carácter especial
      if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
        errors['requiresSpecialChar'] = true;
      }

      return Object.keys(errors).length === 0 ? null : errors;
    };
  }

  /**
   * Validador para confirmar que las contraseñas coincidan
   */
  static passwordsMatch(
    passwordField: string,
    confirmPasswordField: string
  ): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.parent) {
        return null;
      }

      const password = control.parent.get(passwordField)?.value;
      const confirmPassword = control.parent.get(confirmPasswordField)?.value;

      if (password && confirmPassword && password !== confirmPassword) {
        return { passwordMismatch: true };
      }

      return null;
    };
  }
}
