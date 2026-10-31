import { Component, OnInit, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {AlertController, IonBackButton, IonButton, IonButtons, IonContent, IonHeader, IonInput, IonSelect, IonSelectOption, IonSpinner, IonTextarea, IonTitle, IonToolbar,} from '@ionic/angular';
import { firstValueFrom } from 'rxjs';
import {PRIORITY_OPTIONS, Profile, STATUS_OPTIONS, TaskPriority, TaskStatus,} from '../../core/models/models';
import { AuthService } from '../../core/services/auth.service';
import { TasksApiService } from '../../core/services/tasks-api.service';
import { UsersApiService } from '../../core/services/users-api.service';
 



@Component({
  selector: 'app-task-form',
  templateUrl: './task-form.page.html',
  styleUrls: ['./task-form.page.scss'],
  imports: [ReactiveFormsModule, IonHeader, IonToolbar, IonButtons, IonBackButton, IonTitle, IonContent, IonInput, IonTextarea, IonSelect, IonSelectOption, IonButton, IonSpinner,],
})




export class TaskFormPage implements OnInit {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly tasksApi = inject(TasksApiService);
  private readonly usersApi = inject(UsersApiService);
  private readonly alertCtrl = inject(AlertController);
  readonly auth = inject(AuthService);
 
  readonly statuses = STATUS_OPTIONS;
  readonly priorities = PRIORITY_OPTIONS;
  readonly profiles = signal<Profile[]>([]);
  readonly saving = signal(false);
  readonly errorMsg = signal<string | null>(null);
 
  taskId: number | null = null;
 
  readonly form = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(80)]],
    description: [''],
    status: ['todo' as TaskStatus],
    priority: ['medium' as TaskPriority],
    assigned_to: ['', [Validators.required]],
  });
 

  
  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
 
    if (this.auth.isAdmin()) {
      this.usersApi.list().subscribe((list) => this.profiles.set(list));
    } else {
      this.form.controls.assigned_to.setValue(this.auth.profile()?.id ?? '');
    }
 
    if (idParam) {
      this.taskId = Number(idParam);
      this.tasksApi.getById(this.taskId).subscribe((task) => {
        if (!task) {
          void this.router.navigateByUrl('/tareas');
          return;
        }

        
        this.form.patchValue({
          title: task.title,
          description: task.description ?? '',
          status: task.status,
          priority: task.priority,
          assigned_to: task.assigned_to,
        });

      });

    }

  }
 


  errorOf(name: 'title' | 'assigned_to'): string {
    const c = this.form.controls[name];
    if (c.hasError('required')) return 'Este campo es obligatorio.';
    if (c.hasError('minlength')) return 'Escribe al menos 3 caracteres.';
    if (c.hasError('maxlength')) return 'El máximo es de 80 caracteres.';
    return '';
  }
 


  async save(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    this.errorMsg.set(null);
    const value = this.form.getRawValue();


    try {
      if (this.taskId) {
        await firstValueFrom(this.tasksApi.update(this.taskId, value));
      } else {
        await firstValueFrom(this.tasksApi.create(value));
      }
      await this.router.navigateByUrl('/tareas');


    } catch {
      this.errorMsg.set('No se pudo guardar la tarea. Inténtalo de nuevo.');
    } finally {
      this.saving.set(false);
    }
  }
 


  async confirmDelete(): Promise<void> {
    const alert = await this.alertCtrl.create({
      header: 'Eliminar tarea',
      message: 'Esta acción no se puede deshacer. ¿Quieres continuar?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: () => void this.delete(),
        },
      ],
    });
    await alert.present();
  }
 


  private async delete(): Promise<void> {
    if (!this.taskId) return;
    try {
      await firstValueFrom(this.tasksApi.remove(this.taskId));
      await this.router.navigateByUrl('/tareas');
    } catch {
      this.errorMsg.set('No se pudo eliminar la tarea.');
    }
  }
}
