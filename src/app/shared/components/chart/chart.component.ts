import {AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, Input, OnChanges, OnDestroy, ViewChild,} from '@angular/core';
import { Chart, ChartConfiguration, ChartType, registerables } from 'chart.js';
 
Chart.register(...registerables);
 
/* Esta es una paletita de colores para el gráfico */
const PALETTE = ['#1d4ed8', '#15803d', '#c2410c', '#7e22ce', '#b91c1c', '#0f766e', '#a16207'];
 

/** Con chart.component lo que hago es crear un gráfico reutilizable
Este componente encapsula Chart.js
Lo que hace es primero crear el gráfico (ngAfterViewInit), luego lo actualiza (ngOnChanges) y lo destruye (ngOnDestroy) para liberar memoria y evitar fugas
Recibe etiquetas y valores, pero no conoce el origen de los datos */
@Component({
  selector: 'app-chart',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="box">
      <canvas #canvas role="img" [attr.aria-label]="summary"></canvas>
    </div>
    <table class="sr-only">
      <caption>
        {{ title }}
      </caption>
      <thead>
        <tr>
          <th scope="col">Categoría</th>
          <th scope="col">Valor</th>
        </tr>
      </thead>
      <tbody>
        @for (l of labels; track $index) {
          <tr>
            <th scope="row">{{ l }}</th>
            <td>{{ data[$index] }}</td>
          </tr>
        }
      </tbody>
    </table>
  `,
  styles: [
    `
      :host {
        display: block;
      }
      .box {
        position: relative;
        height: 280px;
      }
    `,
  ],
})




export class ChartComponent implements AfterViewInit, OnChanges, OnDestroy {
  
  @Input() type: 'bar' | 'doughnut' | 'pie' | 'line' = 'bar'; /* Tipo de gráfico */
  
  @Input() title = 'Gráfico'; /* Título accesible del gráfico */
  
  @Input({ required: true }) labels: string[] = []; /* Etiquetas del eje o de los sectores */
  
  @Input({ required: true }) data: number[] = []; /* Valores numéricos, uno por etiqueta */
 
  @ViewChild('canvas') private canvas!: ElementRef<HTMLCanvasElement>;
  private chart?: Chart;
 


  get summary(): string {
    const parts = this.labels.map((l, i) => `${l}: ${this.data[i]}`);
    return `${this.title}. ${parts.join(', ')}.`;
  }
 


  ngAfterViewInit(): void {
    this.chart = new Chart(this.canvas.nativeElement, this.buildConfig());
  }
 
  ngOnChanges(): void {
    if (!this.chart) return;
    this.chart.data.labels = this.labels;
    this.chart.data.datasets[0].data = this.data;
    this.chart.update();
  }
 
  ngOnDestroy(): void {
    this.chart?.destroy();
  }
 


  
  private buildConfig(): ChartConfiguration {
    const isRound = this.type === 'doughnut' || this.type === 'pie';
    return {
      type: this.type as ChartType,
      data: {
        labels: this.labels,
        datasets: [
          {
            label: this.title,
            data: this.data,
            backgroundColor: isRound ? PALETTE : PALETTE[0],
            borderColor: this.type === 'line' ? PALETTE[0] : undefined,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: isRound } },
        scales: isRound ? {} : { y: { beginAtZero: true, ticks: { precision: 0 } } },
      },
    };
  }
}
