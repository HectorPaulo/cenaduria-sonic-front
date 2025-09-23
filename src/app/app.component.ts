import { Component, OnInit } from '@angular/core';
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
import { person, cart, document, home } from 'ionicons/icons';
import { ThemeToggleComponent } from './components/theme-toggle/theme-toggle.component';
import { ThemeService } from './services/theme.service';

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
    IonRouterOutlet,
    ThemeToggleComponent,
  ],
})
export class AppComponent implements OnInit {
  public appPages = [
    {
      title: 'Inicio',
      url: '/home',
      icon: 'home',
    },
    {
      title: 'Menu',
      url: '/menu',
      icon: 'document',
    },
    {
      title: 'Mis pedidos',
      url: '/pedidos',
      icon: 'cart',
    },
    {
      title: 'Perfil',
      url: '/perfil',
      icon: 'person',
    },
  ];

  public loading = false;

  constructor(private router: Router, private themeService: ThemeService) {
    addIcons({ document, cart, person, home });
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

  ngOnInit() { }
}
