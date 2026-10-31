import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from '../services/auth.service';
 
/** Lo que consigo con esto es interceptar cada petición de HttpClient antes de que salga:
- Si la URL no es de mi proyecto de Supabase, la deja pasar sin tocarla
- Si lo es, le añade la cabecera apikey con la clave pública
- Si hay sesión, añade también Authorization: Bearer <token>. Con ese token, Supabase sabe quién eres y aplica las políticas RLS
- Si el servidor responde 401 (token caducado o inválido), cierra la sesión y te manda al login */
export const authInterceptor: HttpInterceptorFn = (req, next) => {

  if (!req.url.startsWith(environment.supabaseUrl)) {
    return next(req);
  }
 
  
  const auth = inject(AuthService);
  const router = inject(Router);
 
  let headers = req.headers.set('apikey', environment.supabaseAnonKey);
  const token = auth.accessToken();


  if (token) {
    headers = headers.set('Authorization', `Bearer ${token}`); /* Añade cabeceras de autorificación */
  }
 

  /** Por seguridad, aplicando la regla del peor caso posible, si una persona no cumple los requisitos (en este caso que los tokens no sirvan)
  lo que se hace es denegarle el acceso
  Es como con un semáforo, si hay un fallo no puede quedarse en verde, porque entonces sería un caos, lo que tiene que hacer es ponerse en rojo para
  evitar que ningún coche pase y así evitar cualquier posible accidente */
  return next(req.clone({ headers })).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && token) {
        void auth.logout().then(() => router.navigateByUrl('/login'));
      }
      return throwError(() => error);
    }),

  );

};
