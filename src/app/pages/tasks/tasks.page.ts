import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonLabel, IonMenuButton, IonSegment,IonSegmentButton, IonSpinner, IonTitle, IonToolbar,} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { addOutline, documentTextOutline, downloadOutline } from 'ionicons/icons';
import {PRIORITY_LABEL, STATUS_LABEL, Task, TaskStatus,} from '../../core/models/models';
import { AuthService } from '../../core/services/auth.service';
import { TasksApiService } from '../../core/services/tasks-api.service';
import {DataTableComponent, TableColumn,} from '../../shared/components/data-table/data-table.component';
import { ExportService } from '../../core/services/export.service';
 


/** En la página de tareas, se muestran las tareas de cada usuario registrado
Si entras como admin podrás ver las tareas de todos los usuarios
Además se puede descargar la página actual de tareas que se está viendo como un PDF y un CSV,
pero solo de la página que estás viendo, si hay tantas tareas que no caben en una sola página
tendrás que irte a la siguiente página y volver a descargar el PDF y el CSV
Esque si por ejemplo hay más de mil tareas y solo te interesan las de unas páginas en concreto, 
sería demasiado grande un CSV con mil filas */
export interface TaskRow {
  id: number;
  title: string;
  status: string;
  priority: string;
  assignee: string;
  created: string;
}
 


@Component({
  selector: 'app-tasks',
  templateUrl: './tasks.page.html',
  styleUrls: ['./tasks.page.scss'],
  imports: [FormsModule, DataTableComponent, IonHeader, IonToolbar, IonButtons, IonMenuButton, IonTitle,IonContent, IonButton, IonIcon, IonSegment, IonSegmentButton, IonLabel, IonSpinner,],
})




export class TasksPage {
  private readonly api = inject(TasksApiService);
  private readonly router = inject(Router);
  readonly auth = inject(AuthService);
 
  readonly tasks = signal<Task[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly statusFilter = signal<'all' | TaskStatus>('all');
 



  /* Las tareas tras haber aplicado el filtro de estado */
  readonly visible = computed(() => {
    const filter = this.statusFilter();
    return filter === 'all' ? this.tasks() : this.tasks().filter((t) => t.status === filter);
  });
 



  /* Filas formateadas que utiliza la tabla (tienen id, título, estado, prioridad, etc) */
  readonly rows = computed<TaskRow[]>(() =>
    this.visible().map((t) => ({
      id: t.id,
      title: t.title,
      status: STATUS_LABEL[t.status],
      priority: PRIORITY_LABEL[t.priority],
      assignee: t.profiles?.full_name ?? '—',
      created: t.created_at.slice(0, 10),
    })),
  );
 



  readonly columns: TableColumn<TaskRow>[] = [
    { key: 'title', label: 'Título' },
    { key: 'status', label: 'Estado' },
    { key: 'priority', label: 'Prioridad' },
    { key: 'assignee', label: 'Asignada a' },
    { key: 'created', label: 'Creada' },
  ];


 
  constructor() {addIcons({ addOutline, downloadOutline, documentTextOutline });}
 
  /* Se va a ejecutar cada vez que la página se muestra, y también al volver atrás desde otra */
  ionViewWillEnter(): void {this.load();}
 


  load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.api.list().subscribe({

      next: (tasks) => {
        this.tasks.set(tasks);
        this.loading.set(false);
      },

      error: () => {
        this.error.set('No se han podido cargar las tareas.'); /* Me va a avisar si las tareas no se han podido cargar */
        this.loading.set(false);
      },
    });
  }
 


  edit(row: TaskRow): void {
    void this.router.navigate(['/tareas', row.id, 'editar']);
  }
 
  

  create(): void {
    void this.router.navigateByUrl('/tareas/nueva');
  }



  /* Estos dos métodos sirven junto con el servicio de exportación para convertir un un informe PDF y CSV lo que se está viendo en la página */
  private readonly exporter = inject(ExportService);
 
  exportCsv(): void {
    this.exporter.exportCsv(this.visible());
  }
  
  async exportPdf(): Promise<void> {
    await this.exporter.exportPdf(this.visible(), this.auth.profile()?.full_name);
  }

}