import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonIcon,
  IonItem,
  IonList,
  IonGrid,
  IonRow,
  IonCol,
  IonCard,
  IonCardContent,
  IonCardTitle,
  IonCardHeader,
  IonChip,
  IonLabel,
  IonButton,
} from '@ionic/angular/standalone';
import { HeaderComponent } from '../components/header/header.component';
import { Router, RouterLink } from '@angular/router';
import Promocion from '../Types/Promocion';
import MenuDestacado from '../Types/MenuDestacado';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [
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
  ],
})
export class HomePage implements OnInit {
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
      cardColor: 'bg-orange-100',
    },
    {
      name: 'Combo Familiar',
      description: '4 hamburguesas + 4 papas + 4 refrescos por $150',
      image: 'assets/burgers.png',
      cardColor: 'bg-blue-100',
    },
  ];

  private router = inject(Router);

  constructor() {}

  ngOnInit() {}
}
