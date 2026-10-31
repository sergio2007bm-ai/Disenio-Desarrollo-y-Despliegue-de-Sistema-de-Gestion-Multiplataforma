# TaskHub

Gestor de tareas de equipo con roles (administrador y usuario estándar), dashboard y exportación.

## Demo
- Aplicación: https://vercel.com/sergio-ea22/disenio-desarrollo-y-despliegue-de-sistema-de-gestion-multiplataforma
- Documentación técnica: carpeta `documentation/`

## Tecnologías
Ionic 9, Angular, Supabase (PostgreSQL), Chart.js, jsPDF, Compodoc, Vercel.

## Instalación local
1. `npm install`
2. Rellena las claves públicas de Supabase en `src/environments/`.
3. `ionic serve`

## Base de datos
Esquema en `supabase/schema.sql` (tablas, trigger, funciones y políticas RLS).

## Scripts
`npm run build`, `npm test`, `npm run lint`, `npm run docs`

## Manual de usuario
(Pasos con capturas: iniciar sesión, crear tarea, filtrar, editar, exportar y dashboard.)

## Roles
- Usuario estándar: ve y gestiona sus tareas.
- Administrador: ve todas, asigna, elimina y accede al dashboard.

## Flujo de trabajo
Ramas main, develop y feature/*, con Pull Requests.
