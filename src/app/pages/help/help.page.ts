import { Component, inject } from '@angular/core';
import {IonAccordion, IonAccordionGroup, IonButtons, IonContent, IonHeader, IonItem, IonLabel,IonMenuButton, IonTitle, IonToolbar,} from '@ionic/angular';
import { AuthService } from '../../core/services/auth.service';
 
interface HelpTopic {
  title: string;
  body: string;
  adminOnly?: boolean;
}
 
@Component({
  selector: 'app-help',
  templateUrl: './help.page.html',
  styleUrls: ['./help.page.scss'],
  imports: [
    IonHeader, IonToolbar, IonButtons, IonMenuButton, IonTitle, IonContent, IonAccordionGroup,
    IonAccordion, IonItem, IonLabel,
  ],
})



/* En verdad esto ha sido lo más simple de todo, porque solo son instrucciones de texto */
export class HelpPage {
  readonly auth = inject(AuthService);
 
  readonly topics: HelpTopic[] = [
    {
      title: 'Para iniciar y cerrar sesión',
      body: 'Introduces tu correo y tu contraseña en la pantalla de acceso. Para salir, abres el menú lateral y eliges «Cerrar sesión».',
    },
    {
      title: 'Para crear una tarea',
      body: 'En «Mis tareas» pulsas «Nueva tarea», rellenas el título (obligatorio), el estado y la prioridad, y pulsas «Guardar».',
    },
    {
      title: 'Para buscar y filtrar las tareas',
      body: 'Usas los botones superiores para filtrar por estado y el cuadro de búsqueda para encontrar texto en cualquier columna.',
    },
    {
      title: 'Para editar una tarea',
      body: 'Pulsas «Editar» en la fila de la tarea. Al guardar, los cambios se almacenan en la base de datos.',
    },
    {
      title: 'Para exportar los informes como PDF y CSV',
      body: 'Pulsas «Exportar CSV» o «Exportar PDF». El informe contiene las tareas que estás viendo con el filtro actual.',
    },
    {
      title: 'Para asignar y eliminar tareas',
      body: 'Los administradores pueden asignar una tarea a cualquier persona y eliminarla desde la pantalla de edición.',
      adminOnly: true,
    },
    {
      title: 'Para usar el dashboard',
      body: 'El dashboard muestra el resumen de tareas, y los gráficos. Cambia la prioridad para filtrar todos los datos.',
      adminOnly: true,
    },
  ];
 
  get visibleTopics(): HelpTopic[] {
    return this.topics.filter((t) => !t.adminOnly || this.auth.isAdmin());
  }
}
