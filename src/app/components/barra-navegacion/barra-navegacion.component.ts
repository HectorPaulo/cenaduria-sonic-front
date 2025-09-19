import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { IonButton, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { cart, home, menu, person } from 'ionicons/icons';

@Component({
  selector: 'app-barra-navegacion',
  templateUrl: './barra-navegacion.component.html',
  styleUrls: ['./barra-navegacion.component.scss'],
  imports: [IonIcon, IonButton],
})
export class BarraNavegacionComponent implements OnInit {
  private router = inject(Router);
  constructor() {}

  ngOnInit() {
    addIcons({home, cart, menu, person});
  }

  navigateToHome() {
    this.router.navigateByUrl('/home');
  }

  navigateToPedidos() {
    this.router.navigateByUrl('/pedidos');
  }

  navigateToMenu() {
    this.router.navigateByUrl('/menu');
  }

  navigateToPerfil() {
    this.router.navigateByUrl('/perfil');
  }

}
