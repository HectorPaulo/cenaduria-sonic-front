import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonIcon,
  IonButton, IonHeader, IonToolbar } from '@ionic/angular/standalone';
import { HeaderComponent } from '../components/header/header.component';
import { FabbtnComponent } from '../components/fabbtn/fabbtn.component';
import { addIcons } from 'ionicons';
import {
  informationCircleOutline,
  mailOutline,
  callOutline,
  logoGithub,
  logoInstagram,
  logoFacebook,
  shieldCheckmarkOutline,
  documentTextOutline, chevronForwardOutline } from 'ionicons/icons';
import { Router } from '@angular/router';

@Component({
  selector: 'app-about',
  templateUrl: './about.page.html',
  styleUrls: ['./about.page.scss'],
  standalone: true,
  imports: [ 
    IonContent,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonIcon,
    IonButton,
    CommonModule,
    FormsModule,
    HeaderComponent,
    FabbtnComponent,
  ],
})
export class AboutPage implements OnInit {
  appInfo = {
    nombre: 'Cenaduria Sonic',
    version: '1.0.0',
    descripcion:
      'Tu app favorita para ordenar las mejores cenas de la ciudad. Rápido, fácil y delicioso.',
    desarrollador: 'Equipo Sonic Dev',
    email: 'soporte@cenaduriasonic.com',
    telefono: '+502 1234-5678',
  };

  redesSociales = [
    { nombre: 'Facebook', icon: 'logo-facebook', url: '#' },
    { nombre: 'Instagram', icon: 'logo-instagram', url: '#' },
    { nombre: 'GitHub', icon: 'logo-github', url: '#' },
  ];

  caracteristicas = [
    {
      titulo: 'Pedidos Rápidos',
      descripcion: 'Ordena tu comida favorita en segundos',
      icon: 'information-circle-outline',
    },
    {
      titulo: 'Seguimiento en Tiempo Real',
      descripcion: 'Sigue tu pedido desde la cocina hasta tu puerta',
      icon: 'information-circle-outline',
    },
    {
      titulo: 'Pagos Seguros',
      descripcion: 'Transacciones protegidas con encriptación de datos',
      icon: 'shield-checkmark-outline',
    },
  ];

  constructor(private router: Router) {
    addIcons({
      informationCircleOutline,
      mailOutline,
      callOutline,
      documentTextOutline,
      chevronForwardOutline,
      shieldCheckmarkOutline,
      logoGithub,
      logoInstagram,
      logoFacebook
    });
  }

  ngOnInit() {}

  abrirRedSocial(url: string) {
    console.log('Abriendo red social:', url);
    // TODO: Implementar apertura de URL externa
    // window.open(url, '_blank');
  }

  contactarSoporte() {
    console.log('Contactando soporte...');
    // TODO: Implementar contacto con soporte
  }

  verTerminos() {
    console.log('Mostrando términos y condiciones...');
    // TODO: Implementar página de términos
  }

  verPrivacidad() {
    console.log('Mostrando política de privacidad...');
    // TODO: Implementar página de privacidad
  }

  volverAlPerfil() {
    this.router.navigate(['/perfil']);
  }
}