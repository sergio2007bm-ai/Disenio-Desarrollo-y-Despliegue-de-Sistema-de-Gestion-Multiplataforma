/** El login es un formulario reactivo con validación y gestión de errores
Si no rellenas todos los campos correctamente, no te permite entrar
También tiene un botón para ir a la página de registro si intentas entrar con un usuario que todavía no existe */
import { Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { IonButton, IonContent, IonInput, IonSpinner } from '@ionic/angular';
import { AuthService } from '../../core/services/auth.service';
 
@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  imports: [ReactiveFormsModule, RouterLink, IonContent, IonInput, IonButton, IonSpinner],
})



export class LoginPage {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
 
  readonly loading = signal(false);
  readonly errorMsg = signal<string | null>(null);
 
  readonly form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });
 


  /* Hay que avisar con un mensaje de error de un campo, o cadena vacía si es válido */
  errorOf(name: 'email' | 'password'): string {
    const control = this.form.controls[name];
    if (control.hasError('required')) return 'Este campo es obligatorio.';
    if (control.hasError('email')) return 'Introduce un correo electrónico válido.';
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
      const { email, password } = this.form.getRawValue();
      await this.auth.login(email, password);
      await this.router.navigateByUrl('/tareas');
    } catch {
      this.errorMsg.set('Correo o contraseña incorrectos.');
    } finally {
      this.loading.set(false);
    }
  }
}
