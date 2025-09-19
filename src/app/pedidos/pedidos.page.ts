import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { BarraNavegacionComponent } from "../components/barra-navegacion/barra-navegacion.component";
import { HeaderWoBtnComponent } from "../components/header-wo-btn/header-wo-btn.component";

@Component({
  selector: 'app-pedidos',
  templateUrl: './pedidos.page.html',
  styleUrls: ['./pedidos.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, BarraNavegacionComponent, HeaderWoBtnComponent]
})
export class PedidosPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
