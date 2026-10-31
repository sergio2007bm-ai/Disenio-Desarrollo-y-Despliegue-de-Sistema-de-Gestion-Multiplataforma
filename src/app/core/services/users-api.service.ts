import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Profile } from '../models/models';
 
/** users-api permite el acceso a los perfiles de usuario mediante la API REST de Supabase
Este servicio habla con PostgREST mediante HttpClient */
@Injectable({ providedIn: 'root' })
export class UsersApiService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.supabaseUrl}/rest/v1`;
 
  /* list() lo que hace es pedir los perfiles a Supabase por la API REST */
  /* Esto se usa en el desplegable <<Asignada a>> del formulario de tareas (solo para el administrador) y en el gráfico del dashboard */
  list(): Observable<Profile[]> {
    return this.http.get<Profile[]>(`${this.base}/profiles`, {
      params: { select: '*', order: 'full_name.asc' },
    });
  }
 
  /* emailExists() lo que hace es llamar a la función SQL email_exists mediante RPC */
  /* Esto lo uso en el validador asíncrono del registro */
  emailExists(email: string): Observable<boolean> {
    return this.http.post<boolean>(`${this.base}/rpc/email_exists`, { p_email: email });
  }
}
