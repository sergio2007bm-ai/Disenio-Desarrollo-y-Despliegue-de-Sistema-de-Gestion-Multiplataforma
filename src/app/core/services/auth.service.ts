/** El auth.service es el que lelva a cabo todo lo del control de acceso
Usa signals para exponer el estado de forma reactiva y de solo lectura, es decir, los componentes pueden leer la sesión y el perfil, pero no modificarlos
Aquí es exactamente donde hago toda a gestión de estado predecible */
import { Injectable, computed, inject, signal } from '@angular/core';
import { Session } from '@supabase/supabase-js';
import { Profile } from '../models/models';
import { SupabaseService } from './supabase.service';
 
/** Gestiona la sesión del usuario y su perfil (incluido el rol)
El estado se expone como signals de solo lectura */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly supabase = inject(SupabaseService).client;
 
  private readonly _session = signal<Session | null>(null);
  private readonly _profile = signal<Profile | null>(null);
 
  readonly session = this._session.asReadonly();
  readonly profile = this._profile.asReadonly();
  readonly isLoggedIn = computed(() => this._session() !== null);
  readonly isAdmin = computed(() => this._profile()?.role === 'admin');
  readonly accessToken = computed(() => this._session()?.access_token ?? null);
 
  private readonly ready: Promise<void>;
 




  constructor() {
    this.ready = this.init();
  }
 
  /* Los guards esperan a esta promesa para no decidir antes de restaurar la sesión */
  waitUntilReady(): Promise<void> {
    return this.ready;
  }
 
  private async init(): Promise<void> {
    const { data } = await this.supabase.auth.getSession();
    this._session.set(data.session);


    if (data.session) {
      await this.loadProfile(data.session.user.id).catch(() => this._session.set(null));
    }


    /* Mantiene sincronizados el token renovado y el cierre de sesión */
    this.supabase.auth.onAuthStateChange((_event, session) => {
      this._session.set(session);
      if (!session) this._profile.set(null);
    });

  }
 



  /* Inicia sesión con email y contraseña. Lanza un error si las credenciales no son válidas */
  async login(email: string, password: string): Promise<void> {

    const { data, error } = await this.supabase.auth.signInWithPassword({ email, password });

    if (error) throw error;
    this._session.set(data.session);
    await this.loadProfile(data.user.id);

  }
 
  /* Registra un usuario nuevo y su perfil se crea por trigger en la base de datos de Supabase */
  async register(email: string, password: string, fullName: string): Promise<void> {
    const { data, error } = await this.supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });


    if (error) throw error;
    if (data.session && data.user) {
      this._session.set(data.session);
      await this.loadProfile(data.user.id);
    }

  }
 



  async logout(): Promise<void> {
    await this.supabase.auth.signOut();
    this._session.set(null);
    this._profile.set(null);
  }
 



  private async loadProfile(userId: string): Promise<void> {

    const { data, error } = await this.supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    if (error) throw error;
    this._profile.set(data as Profile);

  }
  
}
