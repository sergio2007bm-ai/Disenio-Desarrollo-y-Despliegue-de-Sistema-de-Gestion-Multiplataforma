/* La carpeta models siempre me toca crearla a mano, pero es importante porque en ella tengo que definir los tipos ts que reflejan las tablas */
export type Role = 'admin' | 'user';
export type TaskStatus = 'todo' | 'in_progress' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high';
 



export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: Role;
}
 


export interface Task {
  id: number;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  assigned_to: string;
  created_at: string;
  profiles?: { full_name: string } | null;
}
 



/* Datos necesarios para crear o modificar una tarea */
export interface TaskInput {
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assigned_to: string;
}
 


export const STATUS_LABEL: Record<TaskStatus, string> = {
  todo: 'Pendiente',
  in_progress: 'En curso',
  done: 'Completada',
};
 


export const PRIORITY_LABEL: Record<TaskPriority, string> = {
  low: 'Baja',
  medium: 'Media',
  high: 'Alta',
};
 

export const STATUS_OPTIONS = (Object.keys(STATUS_LABEL) as TaskStatus[]).map((value) => ({
  value,
  label: STATUS_LABEL[value],
}));
 



export const PRIORITY_OPTIONS = (Object.keys(PRIORITY_LABEL) as TaskPriority[]).map((value) => ({
  value,
  label: PRIORITY_LABEL[value],
}));
