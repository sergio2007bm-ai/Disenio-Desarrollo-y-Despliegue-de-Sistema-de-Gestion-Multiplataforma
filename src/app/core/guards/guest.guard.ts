import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
 
/** El guest.guard hace lo contrario que authGuard, sin sesión deja pasar y con sesión te redirige a /tareas
Es como si preguntara "¿todavía no has iniciado sesión?"
Se aplica a /login y /registro, que no tienen sentido para quién ya está dentro
Por ejemplo, un usuario con sesión pulsa <<back>> hasta llegar al login. En lugar d ever el formulario (otra vez), vuelve a sus tareas */
export const guestGuard: CanActivateFn = async () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  await auth.waitUntilReady();
  return auth.isLoggedIn() ? router.createUrlTree(['/tareas']) : true;
};
