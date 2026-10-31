import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import {
  IonApp, IonButtons, IonContent, IonHeader, IonIcon, IonItem, IonLabel, IonList,
  IonMenu, IonMenuButton, IonMenuToggle, IonRouterOutlet, IonSplitPane, IonTitle, IonToolbar,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  helpCircleOutline, listOutline, logOutOutline, statsChartOutline,
} from 'ionicons/icons';
import { AuthService } from './core/services/auth.service';
 
@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  imports: [
    RouterLink, RouterLinkActive, IonApp, IonSplitPane, IonMenu, IonContent, IonHeader,
    IonToolbar, IonTitle, IonList, IonItem, IonIcon, IonLabel, IonMenuToggle, IonRouterOutlet, IonButtons, IonMenuButton,
  ],
})
export class AppComponent {
  readonly auth = inject(AuthService);
  private readonly router = inject(Router);
 
  constructor() {
    addIcons({ listOutline, statsChartOutline, helpCircleOutline, logOutOutline });
  }
 
  async logout(): Promise<void> {
    await this.auth.logout();
    await this.router.navigateByUrl('/login');
  }
}