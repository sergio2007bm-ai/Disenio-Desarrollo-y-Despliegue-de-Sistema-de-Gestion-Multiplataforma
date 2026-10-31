import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Task, TaskInput } from '../models/models';
 


/* Operaciones CRUD sobre las tareas mediante la API REST de Supabase */
@Injectable({ providedIn: 'root' })
export class TasksApiService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.supabaseUrl}/rest/v1/tasks`;
  private readonly returnRow = { Prefer: 'return=representation' };
 

  /* Lista las tareas visibles para el usuario (RLS filtra por rol), con el nombre del asignado */
  list(): Observable<Task[]> {
    return this.http.get<Task[]>(this.url, {
      params: { select: '*,profiles(full_name)', order: 'created_at.desc' }, /* Con el select le dice a PostgREST que incruste los datos de la tabla relacionada */
    });
  }
 

  getById(id: number): Observable<Task | null> {
    return this.http
      .get<Task[]>(this.url, { params: { select: '*', id: `eq.${id}` } })
      .pipe(map((rows) => rows[0] ?? null));
  }
 

  create(input: TaskInput): Observable<Task> {
    return this.http
      .post<Task[]>(this.url, input, { headers: this.returnRow })
      .pipe(map((rows) => rows[0]));
  }
 

  update(id: number, input: Partial<TaskInput>): Observable<Task> {
    return this.http
      .patch<Task[]>(this.url, input, { headers: this.returnRow, params: { id: `eq.${id}` } })
      .pipe(map((rows) => rows[0]));
  }
 
  
  remove(id: number): Observable<void> {
    return this.http.delete<void>(this.url, { params: { id: `eq.${id}` } });
  }
}
