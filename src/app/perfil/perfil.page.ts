import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent } from '@ionic/angular/standalone';
import { BarraNavegacionComponent } from "../components/barra-navegacion/barra-navegacion.component";

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.page.html',
  styleUrls: ['./perfil.page.scss'],
  standalone: true,
  imports: [IonContent, CommonModule, FormsModule, BarraNavegacionComponent]
})
export class PerfilPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
