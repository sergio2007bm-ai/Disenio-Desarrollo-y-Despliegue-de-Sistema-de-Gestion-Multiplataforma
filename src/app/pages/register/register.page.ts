/** El formulario de la página de registro tiene cuatro campos, dos validadores síncronos por campo,
el validador asíncrono del email y un validador a nivel de grupo para la confirmación de contraseña */
import { Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { IonButton, IonContent, IonInput, IonSpinner } from '@ionic/angular';
import { AuthService } from '../../core/services/auth.service';
import { UsersApiService } from '../../core/services/users-api.service';
import { emailNotTakenValidator } from '../../core/validators/email-not-taken.validator';
import { passwordsMatch } from '../../core/validators/passwords-match.validator';
 



@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  imports: [ReactiveFormsModule, RouterLink, IonContent, IonInput, IonButton, IonSpinner],
})



export class RegisterPage {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly auth = inject(AuthService);
  private readonly usersApi = inject(UsersApiService);
  private readonly router = inject(Router);
 
  readonly loading = signal(false);
  readonly errorMsg = signal<string | null>(null);
 


  readonly form = this.fb.group(
    {
      fullName: ['', [Validators.required, Validators.minLength(3)]],
      email: [
        '',
        {
          validators: [Validators.required, Validators.email],
          asyncValidators: [emailNotTakenValidator(this.usersApi)],
        },

      ],

      password: ['', [Validators.required, Validators.minLength(6)]],
      confirm: ['', [Validators.required]],
    },

    { validators: [passwordsMatch] },

  );
 



  errorOf(name: 'fullName' | 'email' | 'password' | 'confirm'): string {
    const c = this.form.controls[name];
    if (c.hasError('required')) return 'Este campo es obligatorio.';

    if (c.hasError('minlength')) {
      const min = c.getError('minlength').requiredLength;
      return `Debe tener al menos ${min} caracteres.`;
    }


    if (c.hasError('email')) return 'Introduce un correo electrónico válido.';

    if (c.hasError('emailTaken')) return 'Este correo ya está registrado.';

    return '';
  }
 
  async submit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.errorMsg.set(null);

    try {

      const { fullName, email, password } = this.form.getRawValue();
      await this.auth.register(email, password, fullName);
      await this.router.navigateByUrl('/tareas');

    } catch {
      this.errorMsg.set('No se pudo completar el registro. Inténtalo de nuevo.');

    } finally {
      this.loading.set(false);
    }

  }
  
}
