import {ChangeDetectionStrategy, Component, EventEmitter, Input, Output, computed, signal,} from '@angular/core';
import { FormsModule } from '@angular/forms';
 
/* Define una columna de la siguiente manera: la clave de la propiedad de la fila y junto con su cabecera */
export interface TableColumn<T> {
  key: keyof T & string;
  label: string;
}
 
/** Desde data-table.component es donde se crea una tabla de datos, reutilizable, con buscador y con una paginación
La tabla recibe los datos por `rows` y `columns`, y notifica las interacciones con `rowAction` y `searchChange` */
@Component({
  selector: 'app-data-table',
  templateUrl: './data-table.component.html',
  styleUrls: ['./data-table.component.scss'],
  imports: [FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})




export class DataTableComponent<T extends object> {

  @Input() caption = 'Tabla de datos'; /* Título de la tabla */
  
  @Input() searchLabel = 'Buscar'; /* Texto del buscador */
  
  @Input() actionLabel = 'Editar'; /* Texto del botón que tiene cada fila */
  

  @Input() rowLabelKey?: keyof T & string; /* Propiedad de la fila (se usa para describir el botón de acción a los lectores de pantalla) */
 

  @Input({ required: true }) set rows(value: T[]) {this.allRows.set(value ?? []);} /* Filas que se van a mostrar */
  
  @Input({ required: true }) set columns(value: TableColumn<T>[]) {this.cols.set(value ?? []);} /* Columnas a mostrar */
  
  @Input() set pageSize(value: number) {this.size.set(value > 0 ? value : 10);} /* Filas que hay por cada página */
 
  


  @Output() rowAction = new EventEmitter<T>(); /* Se emite al pulsar el botoncito de acción que hay en una fila */
  @Output() searchChange = new EventEmitter<string>();/* Se emite cada vez que cambia el texto de búsqueda */
 





  private readonly allRows = signal<T[]>([]);
  readonly cols = signal<TableColumn<T>[]>([]);
  private readonly size = signal(10);
 
  
  readonly search = signal(''); /* El texto del buscador, que está enlazado en ambos sentidos con ngModel */
  private readonly page = signal(1);



 
  readonly filtered = computed(() => {
    const query = this.search().trim().toLowerCase();
    const rows = this.allRows();
    if (!query) return rows;
    const cols = this.cols();
    return rows.filter((row) =>cols.some((c) => String(row[c.key] ?? '').toLowerCase().includes(query)),);
  });
 


  readonly totalPages = computed(() => Math.max(1, Math.ceil(this.filtered().length / this.size())));
  readonly currentPage = computed(() => Math.min(this.page(), this.totalPages()));
  readonly pageRows = computed(() => {
    const start = (this.currentPage() - 1) * this.size();
    return this.filtered().slice(start, start + this.size());
  });
 



  onSearch(text: string): void {
    this.page.set(1);
    this.searchChange.emit(text);
  }
 

  previous(): void {
    this.page.set(Math.max(1, this.currentPage() - 1));
  }
 

  next(): void {
    this.page.set(Math.min(this.totalPages(), this.currentPage() + 1));
  }
 

  /* Descripción de la fila para el botón de acción (accesibilidad) */
  rowTitle(row: T): string {
    return this.rowLabelKey ? String(row[this.rowLabelKey] ?? '') : '';
  }
}
