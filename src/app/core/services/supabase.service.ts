/* El supabase.service me va a crear el cliente de Supabase una sola vez para toda la aplicación */
import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';
 
/* Proporciona el cliente de Supabase compartido por toda la aplicación */
@Injectable({ providedIn: 'root' })
export class SupabaseService {
  readonly client: SupabaseClient = createClient(
    environment.supabaseUrl,
    environment.supabaseAnonKey,
  );
}
