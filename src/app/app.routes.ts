/** El app.routes.ts me va a importar  los archivos y las clases por sus nombres
Es el mapa de mi aplicación, ya que dice qué página se abre en cada dirección y qué guards la protegen */
import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';
import { roleGuard } from './core/guards/role.guard';

/** Cada ruta usa loadComponent con un import() dinámico, lo que es la carga diferida (Lazy Loading)
La ruta dashboard encadena dos guards: primero compureba la sesión y después el rol */
export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'tareas' },
  
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () => import('./pages/login/login.page').then((m) => m.LoginPage),
  },

  {
    path: 'registro',
    canActivate: [guestGuard],
    loadComponent: () => import('./pages/register/register.page').then((m) => m.RegisterPage),
  },

  {
    path: 'tareas',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/tasks/tasks.page').then((m) => m.TasksPage),
  },

  {
    path: 'tareas/nueva',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/task-form/task-form.page').then((m) => m.TaskFormPage),
  },

  {
    path: 'tareas/:id/editar',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/task-form/task-form.page').then((m) => m.TaskFormPage),
  },

  {
    path: 'dashboard',
    canActivate: [authGuard, roleGuard('admin')],
    loadComponent: () => import('./pages/dashboard/dashboard.page').then((m) => m.DashboardPage),
  },

  {
    path: 'ayuda',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/help/help.page').then((m) => m.HelpPage),
  },

  { path: '**', redirectTo: 'tareas' },

  {
    path: 'register',
    loadComponent: () => import('./pages/register/register.page').then((m) => m.RegisterPage),
  },

  {
    path: 'task-form',
    loadComponent: () => import('./pages/task-form/task-form.page').then((m) => m.TaskFormPage),
  },

];
