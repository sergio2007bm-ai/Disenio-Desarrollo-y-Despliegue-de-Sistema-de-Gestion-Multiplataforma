/* Como estoy utilizando SupaBase, según internet creando un archivo supabase schema.sql, la creación de las tablas también se puede ver aquí y puedo poner comentarios */
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade, /* La clave primaria también es la foránea hacia auth.users (1:1) */
  email text not null unique,
  full_name text not null default '',
  role text not null default 'user' check (role in ('admin', 'user')), /* Los roles, estados y prioridades se controlan con restricciones check en la propia base de datos, no solo en el fronted */
  created_at timestamptz not null default now()
);
 
create table public.tasks (
  id bigint generated always as identity primary key,
  title text not null,
  description text,
  status text not null default 'todo'
    check (status in ('todo', 'in_progress', 'done')),
  priority text not null default 'medium'
    check (priority in ('low', 'medium', 'high')),
  assigned_to uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now()
);




/* Supabase guarda las credenciales en auth.users, una tabla intermedia que no podemos consultar desde el cliente */
/* Para eso creo un trigger, para que cada vez que se inserta un usuario en auth.users, se crea su fila en profiles con el rol user por defecto */
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer /* Hace que la función se ejecute con los permisos de quien la creó (el propietario). Esque si no se ejecutaría con los del usuario que se registra, porque el usuario recién registrado aún no tiene permiso para escribir en profiles */
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', '')
  );
  return new;
end;
$$;
 
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();








/* Para que la cosa funcionase me hacían falta poner estas funcioncitas auxiliares */
/* La primera se utiliza dentro de las políticas RLS */
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer /* Las dos funciones tienen también el security definer para poder consultar profiles sin disparar recursivamente las políticas */
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin' /* Comprueba si un usuario es admin */
  );
$$;
 

/* La otra función sirve de validador asíncrono del formulario de registro */
create or replace function public.email_exists(p_email text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where lower(email) = lower(p_email) /* Comprueba si un email existe */
  );
$$;
 
grant execute on function public.email_exists(text) to anon, authenticated;
/* Aunque ya lo había pensado pero no se me ocurrió una forma de hacerlo, tener una función que dice si un email existe o no puede servirle a un atacante para comprobar */
/* qué correos existen. Se me ocurrió que por ejemplo podría solucionarse con un límite de peticiones */






/* Los permisos son importantes, porque con el RLS activado y sin políticas, nadie puede leer ni escribir nada */
alter table public.profiles enable row level security;
alter table public.tasks enable row level security;
 
/* Número uno: Perfiles: cada usuario ve el suyo; el admin ve todos y puede cambiar roles */
create policy "profiles_select" on public.profiles
  for select to authenticated
  using (id = auth.uid() or public.is_admin());
 
create policy "profiles_update_admin" on public.profiles
  for update to authenticated
  using (public.is_admin());
/* No he creado ninguna para la inserción en profiles porque solo el trigger (con security definer) puede crear perfiles, */
/* así que nadie puede asignarse el rol admin por su cuenta */
 


/* Número dos: Tareas: cada usuario gestiona las suyas; el admin gestiona todas */
create policy "tasks_select" on public.tasks
  for select to authenticated
  using (assigned_to = auth.uid() or public.is_admin());
 
create policy "tasks_insert" on public.tasks
  for insert to authenticated
  with check (assigned_to = auth.uid() or public.is_admin());
 
create policy "tasks_update" on public.tasks
  for update to authenticated
  using (assigned_to = auth.uid() or public.is_admin())
  with check (assigned_to = auth.uid() or public.is_admin());
 
create policy "tasks_delete" on public.tasks
  for delete to authenticated
  using (public.is_admin());
