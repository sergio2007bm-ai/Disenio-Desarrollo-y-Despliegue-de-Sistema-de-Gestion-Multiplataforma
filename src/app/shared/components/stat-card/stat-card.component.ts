import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { IonIcon } from '@ionic/angular';
import { statsChartOutline } from 'ionicons/icons';
 
/** stat-card es una tarjeta que muestra una métrica (con valor y etiqueta) y avisa al padre cuando se pulsa
Tan solo es un botón con un icono, un valor y una etiqueta */
@Component({
  selector: 'app-stat-card',
  imports: [IonIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,

  template: `
    <button

      type="button"
      class="stat"
      [style.--accent]="'var(--ion-color-' + color + ')'"
      (click)="cardClick.emit()"

    >

      <ion-icon aria-hidden="true" [icon]="icon"></ion-icon>
      <span class="value">{{ value }}</span>
      <span class="label">{{ label }}</span>

    </button>
  `,
  styleUrls: ['./stat-card.component.scss'],
})




export class StatCardComponent {
  
  @Input({ required: true }) label!: string; /* Descripción de la métrica */
  
  @Input({ required: true }) value!: number | string; /* Valor numérico o de texto a destacar */
  
  @Input() icon: string = statsChartOutline; /* Icono de ionicons (el icono se recibe como un valor importado de ionicons/icons) */
  
  @Input() color: 'primary' | 'success' | 'warning' | 'danger' | 'medium' = 'primary'; /* Color de Ionic (el color de ionic es el azul) */
 
  
  @Output() cardClick = new EventEmitter<void>(); /* Se emite al pulsar la tarjeta */
}
