/** Los guards son funciones que se ejecutan antes de activar una ruta y deciden si se permite el paso o se redirige
Pero hay una diferencia importante en cuanto a seguridad, porque los guards solo le mejoran la experiencia al usuario,
la seguridad real son las políticas RLS
Los tres guards tienen el mismo propósito: esperan a que el AuthService haya restaurado la sesión. Sin esa espera,
al recargar la página el guard vería la sesión vacía y te expulsaría al login aunque estuvieras autenticado */
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
 
/** El auth.guard comprueba que hay una sesión activa
Es como si preguntara "¿has iniciado sesión?"
Se aplica a la rutas privadas: : /tasks, /tasks/new, /tasks/:id/edit, /help y /dashboard
Por ejemplo, si alguien escribe /tasks en el navegador sin haber iniciado sesión, acaba en el login */
export const authGuard: CanActivateFn = async () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  await auth.waitUntilReady(); /* Espera a que el AuthService haya restaurado la sesión */
  return auth.isLoggedIn() ? true : router.createUrlTree(['/login']); /* Si no tienes sesión iniciada te redirige a /login */
};
