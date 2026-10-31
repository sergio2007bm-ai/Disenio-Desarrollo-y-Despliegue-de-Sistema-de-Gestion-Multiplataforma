import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Role } from '../models/models';
import { AuthService } from '../services/auth.service';
 
/** El role.guard comprueba que el rol del perfil es el que exige la ruta
Es una función que recibe el rol y devuleve el guard roleGuard('admin')
Es como si preguntara "¿tienes el rol necesario?"
Se usa en /dashboard, junto con authGuard, de forma que primero se comprueba la sesión y luego el rol
Por ejemplo, Ana (usuario estándar) escribe /dashboard a mano. Tiene sesión, pero no es admin, así que vuelve a tasks */
export const roleGuard =
  (role: Role): CanActivateFn =>
  async () => {
    const auth = inject(AuthService);
    const router = inject(Router);
    await auth.waitUntilReady();
    return auth.profile()?.role === role ? true : router.createUrlTree(['/tareas']); /* Si no tienes el rol exigido te redirige a /tareas */
  };
