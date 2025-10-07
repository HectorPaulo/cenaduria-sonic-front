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
  IonButton,
  AlertController,
} from '@ionic/angular/standalone';
import { BarraNavegacionComponent } from '../components/barra-navegacion/barra-navegacion.component';
import { HeaderComponent } from '../components/header/header.component';
import { ThemeToggleComponent } from '../components/theme-toggle/theme-toggle.component';
import { addIcons } from 'ionicons';
import {
  personOutline,
  camera,
  heartOutline,
  settingsOutline,
  chevronForwardOutline,
  createOutline,
  logOutOutline,
} from 'ionicons/icons';
import User from '../Types/User';
import { Capacitor } from '@capacitor/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.page.html',
  styleUrls: ['./perfil.page.scss'],
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
    ThemeToggleComponent,
  ],
})
export class PerfilPage implements OnInit {
  usuario: User = {
    nombre: 'Sonic el erizo',
    email: 'sonic.erizo@email.com',
    telefono: '+502 1234-5678',
    direccion: 'Zona 10, Ciudad de Guatemala',
    avatar: 'assets/sonic.png',
    fechaRegistro: 'Enero 2024',
    totalPedidos: 47,
    puntos: 1250,
    nivel: 'Gold',
    favoritos: ['tacos', 'hamburguesa', 'pizza'],
  };

  constructor(private alertController: AlertController) {
    addIcons({
      personOutline,
      camera,
      heartOutline,
      settingsOutline,
      chevronForwardOutline,
      createOutline,
      logOutOutline,
    });
  }

  ngOnInit() {
    // TODO: Cargar datos de los usuarios aquí, desde el back
    this.cargarDatosUsuario();
  }

  // * Métodos para cargar datos
  cargarDatosUsuario() {
    // ? Simulación de carga de datos
    console.log('Cargando datos del usuario...');
    // ! En el futuro: this.userService.getUserProfile().subscribe(...)
  }

  // * Métodos de edición para datos de usuario
  async cambiarFoto() {
    const alert = await this.alertController.create({
      header: 'Cambiar foto',
      message: 'Selecciona una opción para cambiar tu foto de perfil',
      buttons: [
        // {
        //   text: 'Cámara',
        //   handler: () => {
        //     this.tomarFotoConCamara();
        //   },
        // },
        {
          text: 'Galería',
          handler: () => {
            this.seleccionarDeGaleria();
          },
        },
        {
          text: 'Cancelar',
          role: 'cancel',
        },
      ],
    });
    await alert.present();
  }

  // TODO: Desimplementar la funcionalidad para abrir la camara.
  // Da problemas con el emulador
  // async tomarFotoConCamara() {
  //   try {
  //     // Verificar si estamos en un dispositivo con cámara
  //     if (!Capacitor.isPluginAvailable('Camera')) {
  //       this.mostrarError('La cámara no está disponible en este dispositivo');
  //       return;
  //     }

  //     const image = await Camera.getPhoto({
  //       quality: 90,
  //       allowEditing: true,
  //       resultType: CameraResultType.DataUrl,
  //       source: CameraSource.Camera,
  //       width: 300,
  //       height: 300,
  //     });

  //     if (image.dataUrl) {
  //       // Actualizar la foto del usuario
  //       this.usuario.avatar = image.dataUrl;

  //       // Aquí guardarías la imagen en el servidor
  //       console.log('Nueva foto capturada y establecida');
  //       this.mostrarExito('Foto de perfil actualizada correctamente');
  //     }
  //   } catch (error) {
  //     console.error('Error al tomar foto:', error);
  //     this.mostrarError('Error al acceder a la cámara');
  //   }
  // }

  async seleccionarDeGaleria() {
    try {
      // Verificar si estamos en un dispositivo con galería
      if (!Capacitor.isPluginAvailable('Camera')) {
        this.mostrarError('La galería no está disponible en este dispositivo');
        return;
      }

      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: true,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Photos,
        width: 300,
        height: 300,
      });

      if (image.dataUrl) {
        // Actualizar la foto del usuario
        this.usuario.avatar = image.dataUrl;

        // Aquí guardarías la imagen en el servidor
        console.log('Nueva foto seleccionada de galería');
        this.mostrarExito('Foto de perfil actualizada correctamente');
      }
    } catch (error) {
      console.error('Error al seleccionar foto:', error);
      this.mostrarError('Error al acceder a la galería');
    }
  }

  async editarNombre() {
    const alert = await this.alertController.create({
      header: 'Editar nombre',
      inputs: [
        {
          name: 'nombre',
          type: 'text',
          placeholder: 'Nombre completo',
          value: this.usuario.nombre,
        },
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Guardar',
          handler: (data) => {
            if (data.nombre && data.nombre.trim()) {
              this.usuario.nombre = data.nombre.trim();
              console.log('Nombre actualizado:', this.usuario.nombre);
            }
          },
        },
      ],
    });
    await alert.present();
  }

  async editarTelefono() {
    const alert = await this.alertController.create({
      header: 'Editar teléfono',
      inputs: [
        {
          name: 'telefono',
          type: 'tel',
          placeholder: 'Número de teléfono',
          value: this.usuario.telefono || '',
        },
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Guardar',
          handler: (data) => {
            this.usuario.telefono = data.telefono;
            console.log('Teléfono actualizado:', this.usuario.telefono);
          },
        },
      ],
    });
    await alert.present();
  }

  async editarDireccion() {
    const alert = await this.alertController.create({
      header: 'Editar dirección',
      inputs: [
        {
          name: 'direccion',
          type: 'text',
          placeholder: 'Dirección completa',
          value: this.usuario.direccion || '',
        },
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Guardar',
          handler: (data) => {
            this.usuario.direccion = data.direccion;
            console.log('Dirección actualizada:', this.usuario.direccion);
          },
        },
      ],
    });
    await alert.present();
  }

  // * Métodos de navegación
  verFavoritos() {
    console.log('Navegando a favoritos...');
    // TODO: Implementar navegación a página de favoritos
  }

  configurarNotificaciones() {
    console.log('Configurando notificaciones...');
    // TODO: Implementar configuración de notificaciones
  }

  async cambiarPassword() {
    const alert = await this.alertController.create({
      header: 'Cambiar contraseña',
      inputs: [
        {
          name: 'passwordActual',
          type: 'password',
          placeholder: 'Contraseña actual',
        },
        {
          name: 'passwordNueva',
          type: 'password',
          placeholder: 'Nueva contraseña',
        },
        {
          name: 'passwordConfirmar',
          type: 'password',
          placeholder: 'Confirmar nueva contraseña',
        },
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Cambiar',
          handler: (data) => {
            if (data.passwordNueva === data.passwordConfirmar) {
              console.log('Cambiando contraseña...');
              // TODO: Implementar cambio de contraseña
            } else {
              this.mostrarError('Las contraseñas no coinciden');
            }
          },
        },
      ],
    });
    await alert.present();
  }

  acercaDe() {
    console.log('Mostrando información de la app...');
    // TODO: Implementar página de "Acerca de"
  }

  editarPerfil() {
    console.log('Navegando a edición completa del perfil...');
    // TODO: Implementar navegación a formulario completo de perfil
  }

  async cerrarSesion() {
    const alert = await this.alertController.create({
      header: 'Cerrar sesión',
      message: '¿Estás seguro que quieres cerrar sesión?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Cerrar sesión',
          handler: () => {
            console.log('Cerrando sesión...');
            // TODO: Implementar logout
            // * this.authService.logout();
            // * this.router.navigate(['/login']);
          },
        },
      ],
    });
    await alert.present();
  }

  // * Métodos auxiliares para mostrar mensajes
  private async mostrarError(mensaje: string) {
    const alert = await this.alertController.create({
      header: 'Error',
      message: mensaje,
      buttons: ['OK'],
    });
    await alert.present();
  }

  private async mostrarExito(mensaje: string) {
    const alert = await this.alertController.create({
      header: 'Éxito',
      message: mensaje,
      buttons: ['OK'],
    });
    await alert.present();
  }
}
