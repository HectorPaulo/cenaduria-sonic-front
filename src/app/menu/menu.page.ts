import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { HeaderComponent } from "../components/header/header.component";
import { HeaderWoBtnComponent } from "../components/header-wo-btn/header-wo-btn.component";
import { BarraNavegacionComponent } from "../components/barra-navegacion/barra-navegacion.component";

@Component({
  selector: 'app-menu',
  templateUrl: './menu.page.html',
  styleUrls: ['./menu.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, HeaderComponent, HeaderWoBtnComponent, BarraNavegacionComponent]
})
export class MenuPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
