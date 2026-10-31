/** Los validadores asíncronos reciben el servicio y devuelven la función validadora
Los validadores asíncronos solo se ejecutan cuando los validadores síncronos del mismo control pasan
Por eso, mientras el email no tenga un formato válido, no se hace ninguna petición */
import { AbstractControl, AsyncValidatorFn, ValidationErrors } from '@angular/forms';
import { Observable, catchError, map, of, switchMap, timer } from 'rxjs';
import { UsersApiService } from '../services/users-api.service';
 
/** Validador asíncrono: marca el control con el error `emailTaken` si el correo ya existe en la base de datos
@param api Servicio que consulta la función RPC `email_exists`
@param debounceMs Espera antes de lanzar la petición (por defecto 400 ms) */
export function emailNotTakenValidator(api: UsersApiService, debounceMs = 400): AsyncValidatorFn {
  return (control: AbstractControl): Observable<ValidationErrors | null> => {
    const value = (control.value ?? '').toString().trim();
    if (!value) {
      return of(null);
    }
    return timer(debounceMs).pipe(
      switchMap(() => api.emailExists(value)),
      map((exists) => (exists ? { emailTaken: true } : null)),
      /* Si falla la consulta no bloqueamos el formulario: la base de datos lo impedirá igualmente */
      catchError(() => of(null)),
    );
  };
}
