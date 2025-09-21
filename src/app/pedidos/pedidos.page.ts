import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonChip,
  IonLabel,
  IonCard,
  IonCardContent,
  IonCardTitle,
  IonCardHeader,
  IonAvatar,
  IonGrid,
  IonRow,
} from '@ionic/angular/standalone';
import { HeaderComponent } from '../components/header/header.component';

@Component({
  selector: 'app-pedidos',
  templateUrl: './pedidos.page.html',
  styleUrls: ['./pedidos.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonChip,
    IonLabel,
    IonCard,
    IonCardContent,
    IonCardTitle,
    IonCardHeader,
    IonAvatar,
    IonGrid,
    IonRow,
    CommonModule,
    FormsModule,
    HeaderComponent,
  ],
})
export class PedidosPage implements OnInit {
  constructor() {}

  ngOnInit() {}
}
