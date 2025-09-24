import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonGrid,
  IonRow,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonButton,
  IonIcon,
  IonLabel,
  IonCol,
  IonText,
  IonRefresher,
  IonRefresherContent,
} from '@ionic/angular/standalone';
import Comida from '../Types/Comida';
import { addIcons } from 'ionicons';
import { add, cart, search } from 'ionicons/icons';
import Pedido from '../Types/Pedido';
import Lista from '../Types/Lista';
import Bebida from '../Types/Bebida';
import Recomendacion from '../Types/Recomendacion';
import { RefresherCustomEvent } from '@ionic/core';
import { HeaderComponent } from "../components/header/header.component";
import { FabbtnComponent } from "../components/fabbtn/fabbtn.component";

@Component({
  selector: 'app-menu',
  templateUrl: './menu.page.html',
  styleUrls: ['./menu.page.scss'],
  standalone: true,
  imports: [
    IonRefresherContent,
    IonRefresher,
    IonText,
    IonCol,
    IonLabel,
    IonIcon,
    IonButton,
    IonCardContent,
    IonCardTitle,
    IonCardHeader,
    IonCard,
    IonRow,
    IonGrid,
    IonContent,
    CommonModule,
    FormsModule,
    HeaderComponent,
    FabbtnComponent
],
})
export class MenuPage implements OnInit {
doRefresh(event: RefresherCustomEvent) {
  setTimeout(() => {
    // TODO: Implementar lógica para mandar a llamar la información actualizada
    event.target.complete();
  }, 2000);
}
  comidas: Comida[] = [
    {
      name: 'Albóndigas Clásicas',
      description: 'Jugosas albóndigas de res con salsa de tomate y especias.',
      price: 8.99,
      image: 'assets/comida.png',
      tag: 'Platos fuertes',
      icon: '🍽️',
    },
    {
      name: 'Hamburguesa con Queso',
      description:
        'Hamburguesa de res con queso cheddar, lechuga, tomate y cebolla.',
      price: 7.99,
      image: 'assets/burgers.png',
      tag: 'Hamburguesas',
      icon: '🍔',
    },
    {
      name: 'Tacos',
      description: 'Tacos de carne asada con cebolla, cilantro y salsa.',
      price: 7.99,
      image: 'assets/tacos.png',
      tag: 'Tacos',
      icon: '🌮',
    },
  ];
  recomendaciones: Recomendacion[] = this.comidas.map((comida) => ({
    name: comida.tag,
    icon: comida.icon,
  }));
  pedidos: Pedido[] = [];
  listaComidas: Lista[] = [];
  bebidas: Bebida[] = [
    {
      name: 'Refresco de Cola',
      description: 'Bebida carbonatada con sabor a cola, refrescante y dulce.',
      price: 1.99,
      image: 'assets/bebida.png',
      tag: 'soda',
      icon: '🥤',
    },
    {
      name: 'Agua Mineral',
      description: 'Agua con gas, ligera y burbujeante.',
      price: 1.49,
      image: 'assets/agua.png',
      tag: 'water',
      icon: '💧',
    }
  ];

  addToList(listaItem: Lista) {
    this.listaComidas.push(listaItem);
  }

  addToCart(pedido: Pedido) {
    this.pedidos.push(pedido);
  }

  constructor() {
    addIcons({ search, cart, add });
  }

  ngOnInit() {}
}
