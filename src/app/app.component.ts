import { Component } from '@angular/core';
import {
  Router,
  NavigationStart,
  NavigationEnd,
  NavigationCancel,
  NavigationError,
} from '@angular/router';
import { RouterLink, RouterLinkActive } from '@angular/router';
import {
  IonApp,
  IonSplitPane,
  IonMenu,
  IonContent,
  IonList,
  IonListHeader,
  IonNote,
  IonMenuToggle,
  IonItem,
  IonIcon,
  IonLabel,
  IonRouterOutlet,
  IonRouterLink,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { person, cart, document } from 'ionicons/icons';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  imports: [
    RouterLink,
    RouterLinkActive,
    IonApp,
    IonSplitPane,
    IonMenu,
    IonContent,
    IonList,
    IonListHeader,
    IonNote,
    IonMenuToggle,
    IonItem,
    IonIcon,
    IonLabel,
    IonRouterLink,
    IonRouterOutlet
],
})
export class AppComponent {

  public appPages = [
    { 
      title: 'Menu', 
      url: '/menu', 
      icon: 'document' 
    },
    { 
      title: 'Mis pedidos', 
      url: '/pedidos', 
      icon: 'cart' 
    },
    { 
      title: 'Perfil', 
      url: '/perfil', 
      icon: 'person' 
    },
  ];

  public labels = [
    'Family', 
    'Friends', 
    'Notes', 
    'Work', 
    'Travel', 
    'Reminders'
  ];

  public loading = false;
  constructor(private router: Router) {
    addIcons({ document, cart, person });
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        this.loading = true;
      }
      if (
        event instanceof NavigationEnd ||
        event instanceof NavigationCancel ||
        event instanceof NavigationError
      ) {
        setTimeout(() => {
          this.loading = false;
        }, 400); 
      }
    });
  }
}
