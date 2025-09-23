import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonGrid,
  IonRow,
  IonCard,
  IonCardContent,
  IonCardTitle,
  IonCardHeader,
  IonChip,
  IonLabel,
  IonButton,
  IonLoading,
  IonRefresher,
  IonRefresherContent,
  IonFab,
  IonFabButton,
  IonIcon,
  IonFabList,
  IonItem,
  IonToggle,
} from '@ionic/angular/standalone';
import { HeaderComponent } from '../components/header/header.component';
import { Router, RouterLink } from '@angular/router';
import Promocion from '../Types/Promocion';
import MenuDestacado from '../Types/MenuDestacado';
import { addIcons } from 'ionicons';
import { RefresherCustomEvent } from '@ionic/core/components';
import {
  chevronUpCircle,
  person,
  colorPalette,
  chevronDownCircle,
  chevronForwardCircle,
  globe,
  moon,
  sunny,
} from 'ionicons/icons';
import { ThemeService } from '../services/theme.service';
import { FabbtnComponent } from "../components/fabbtn/fabbtn.component";

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [
    IonToggle,
    IonItem,
    IonFabList,
    IonIcon,
    IonFabButton,
    IonFab,
    IonRefresherContent,
    IonRefresher,
    IonLoading,
    IonButton,
    IonLabel,
    IonChip,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonCard,
    IonRow,
    IonGrid,
    IonContent,
    CommonModule,
    FormsModule,
    HeaderComponent,
    RouterLink,
    FabbtnComponent
],
})
export class HomePage implements OnInit {
  doRefresh(event: RefresherCustomEvent) {
    setTimeout(() => {
      // TODO: Implementar la lógica para mandar a llamar a los datos actualizacos
      event.target.complete();
    }, 2000);
  }
  navigateToTop() {
    this.content.scrollToTop(500);
  }

  navigateToBottom() {
    this.content.scrollToBottom(500);
  }

  @ViewChild(IonContent) content!: IonContent;

  menuDestacado: MenuDestacado[] = [
    {
      name: 'Papas cripto',
      description: 'Papas fritas con queso y tocino',
      icon: '🍟',
      price: 49,
    },
    {
      name: 'Hamburguesa cripto',
      description: 'Hamburguesa con queso, tocino y huevo',
      icon: '🍔',
      price: 89,
    },
  ];
  promociones: Promocion[] = [
    {
      name: '2x1 en Tacos',
      description: 'Solo hoy de 6pm a 9pm',
      image: 'assets/tacos.png',
    },
    {
      name: 'Combo Familiar',
      description: '4 hamburguesas + 4 papas + 4 refrescos por $150',
      image: 'assets/burgers.png',
    },
  ];

  constructor() { }
  ngOnInit() {}
}
