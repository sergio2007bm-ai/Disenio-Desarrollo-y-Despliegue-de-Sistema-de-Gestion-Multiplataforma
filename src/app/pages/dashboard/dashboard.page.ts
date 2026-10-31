import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import {IonButton, IonButtons, IonContent, IonHeader, IonLabel, IonMenuButton, IonSegment,IonSegmentButton, IonSpinner, IonTitle, IonToolbar,} from '@ionic/angular';
import {checkmarkDoneOutline, hourglassOutline, listOutline, pulseOutline,} from 'ionicons/icons';
import { finalize, forkJoin } from 'rxjs';
import { Profile, Task, TaskPriority } from '../../core/models/models';
import { TasksApiService } from '../../core/services/tasks-api.service';
import { UsersApiService } from '../../core/services/users-api.service';
import { ChartComponent } from '../../shared/components/chart/chart.component';
import { StatCardComponent } from '../../shared/components/stat-card/stat-card.component';
 

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  imports: [
    FormsModule, ChartComponent, StatCardComponent, IonHeader, IonToolbar,
    IonButtons, IonMenuButton, IonTitle, IonContent, IonButton, IonSegment, IonSegmentButton,
    IonLabel, IonSpinner,
  ],
})



/** La página del dashboard lo que contiene es un resumen de las tareas, separadas por tipo y las totales,
y dos gráficos que muestran el reparto de tareas entre todos los usuarios */
export class DashboardPage {
  private readonly tasksApi = inject(TasksApiService);
  private readonly usersApi = inject(UsersApiService);
  private readonly destroyRef = inject(DestroyRef);
 
  readonly icons = {
    total: listOutline,
    todo: hourglassOutline,
    progress: pulseOutline,
    done: checkmarkDoneOutline,
  };
 
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly tasks = signal<Task[]>([]);
  readonly profiles = signal<Profile[]>([]);
  readonly priority = signal<'all' | TaskPriority>('all');
 
  /* Las tareas que se van a mostrar tras aplicar el filtro de prioridad */
  readonly filtered = computed(() => {
    const p = this.priority();
    return p === 'all' ? this.tasks() : this.tasks().filter((t) => t.priority === p);
  });
 



  readonly total = computed(() => this.filtered().length);
  readonly todo = computed(() => this.filtered().filter((t) => t.status === 'todo').length);
  readonly inProgress = computed(
    () => this.filtered().filter((t) => t.status === 'in_progress').length,
  );



  readonly done = computed(() => this.filtered().filter((t) => t.status === 'done').length);
 


  readonly statusChart = computed(() => ({
    labels: ['Pendientes', 'En curso', 'Completadas'],
    data: [this.todo(), this.inProgress(), this.done()],
  }));
 



  /* Para el gráfico de las tareas por persona, para que no estuviese incompleto también he añadido a las personas que no tienen ninguna */
  readonly userChart = computed(() => {
    const counts = new Map<string, number>();
    this.profiles().forEach((p) => counts.set(p.full_name || p.email, 0));
    this.filtered().forEach((t) => {
      const name = t.profiles?.full_name ?? 'Sin asignar';
      counts.set(name, (counts.get(name) ?? 0) + 1);
    });
    return { labels: [...counts.keys()], data: [...counts.values()] };
  });


 
  ionViewWillEnter(): void {
    this.load();
  }
 


  /* Carga las dos fuentes a la vez mediante la API REST de Supabase */
  load(): void {
    this.loading.set(true);
    this.error.set(null);
 
    forkJoin({
      tasks: this.tasksApi.list(),
      profiles: this.usersApi.list(),
    })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.loading.set(false)),
      )
      .subscribe({
        next: (result) => {
          this.tasks.set(result.tasks);
          this.profiles.set(result.profiles);
        },
        error: () => this.error.set('No se han podido cargar los datos del dashboard.'),
      });

  }
  
}
