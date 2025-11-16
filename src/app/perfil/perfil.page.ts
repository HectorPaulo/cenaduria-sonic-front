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
  IonRefresher,
  IonRefresherContent,
} from '@ionic/angular/standalone';
import { HeaderComponent } from '../components/header/header.component';
import { addIcons } from 'ionicons';
import {
  personOutline,
  heartOutline,
  settingsOutline,
  chevronForwardOutline,
  createOutline,
  logOutOutline,
  image,
  cube,
} from 'ionicons/icons';
import User from '../Types/User';
import { Capacitor } from '@capacitor/core';
import { RefresherCustomEvent } from '@ionic/core';
import { FabbtnComponent } from '../components/fabbtn/fabbtn.component';
import { Usuarios } from '../services/usuarios.service';
import { ElementRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService, UserRole } from '../services/auth.service';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.page.html',
  styleUrls: ['./perfil.page.scss'],
  standalone: true,
  imports: [
    IonRefresherContent,
    IonRefresher,
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
export class PerfilPage implements OnInit {
  isEmpleado: boolean = false;
  doRefresh(event: RefresherCustomEvent) {
    setTimeout(() => {
      // TODO: Implementar la lógica para mandar a llamar a los datos actualizacos
      event.target.complete();
    }, 2000);
  }
  usuario: User = {
    nombre: 'Sonic el erizo',
    email: 'sonic.erizo@email.com',
    telefono: '+502 1234-5678',
    avatar: 'assets/sonic.png',
    fechaRegistro: 'Enero 2024',
    pedidosRecientes: ['tacos', 'hamburguesa', 'pizza'],
  };

  constructor(
    private alertController: AlertController,
    private router: Router,
    private authService: AuthService,
    private usuarios: Usuarios
  ) {
    addIcons({
      image,
      personOutline,
      heartOutline,
      chevronForwardOutline,
      settingsOutline,
      cube,
      createOutline,
      logOutOutline,
    });
  }

  ngOnInit() {
    // TODO: Cargar datos de los usuarios aquí, desde el back
    this.cargarDatosUsuario();
    // Determinar si el usuario actual es empleado o admin para mostrar opciones de gestión
    this.isEmpleado = this.authService.hasAnyRole([
      UserRole.EMPLEADO,
      UserRole.SYSADMIN,
    ]);
  }

  // * Métodos para cargar datos
  cargarDatosUsuario() {
    // Cargar datos reales desde el backend
    console.log('Cargando datos del usuario...');
    this.usuarios.getProfile().subscribe({
      next: (res) => {
        this.usuario = {
          nombre: res.name || res.username || this.usuario.nombre,
          email: res.email || this.usuario.email,
          telefono: this.usuario.telefono,
          avatar: res.avatarUrl || this.usuario.avatar,
          fechaRegistro: res.registerDate
            ? new Date(res.registerDate).toLocaleDateString()
            : this.usuario.fechaRegistro,
          pedidosRecientes: this.usuario.pedidosRecientes,
        } as any;
      },
      error: (err) => {
        console.error('Error cargando perfil:', err);
      },
    });
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
    // Abrir selector de archivos oculto
    try {
      this.fileInput?.nativeElement.click();
    } catch (e) {
      console.error('Error abriendo selector de archivos', e);
      this.mostrarError('No se pudo abrir la galería');
    }
  }

  @ViewChild('fileInput') fileInput?: ElementRef<HTMLInputElement>;

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files && input.files[0];
    if (!file) return;

    const form = new FormData();
    form.append('avatar', file, file.name);
    this.usuarios.updateAvatar(form).subscribe({
      next: (res) => {
        console.log('Avatar actualizado:', res);
        // Backend may return the new avatar URL
        const newUrl =
          res?.avatarUrl || res?.data?.avatarUrl || res?.url || null;
        if (newUrl) {
          this.usuario.avatar = newUrl;
        }
        this.mostrarExito('Foto de perfil actualizada correctamente');
      },
      error: (err) => {
        console.error('Error subiendo avatar', err);
        this.mostrarError('No se pudo actualizar la foto de perfil');
      },
    });
    // limpiar el input
    input.value = '';
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

  // async editarDireccion() {
  //   const alert = await this.alertController.create({
  //     header: 'Editar dirección',
  //     inputs: [
  //       {
  //         name: 'direccion',
  //         type: 'text',
  //         placeholder: 'Dirección completa',
  //         value: this.usuario.direccion || '',
  //       },
  //     ],
  //     buttons: [
  //       {
  //         text: 'Cancelar',
  //         role: 'cancel',
  //       },
  //       {
  //         text: 'Guardar',
  //         handler: (data) => {
  //           this.usuario.direccion = data.direccion;
  //           console.log('Dirección actualizada:', this.usuario.direccion);
  //         },
  //       },
  //     ],
  //   });
  //   await alert.present();
  // }

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
            if (data.passwordNueva !== data.passwordConfirmar) {
              this.mostrarError('Las contraseñas no coinciden');
              return false; // keep the alert open
            }
            const payload = {
              currentPassword: data.passwordActual || '',
              newPassword: data.passwordNueva || '',
              confirmNewPassword: data.passwordConfirmar || '',
            };
            this.usuarios.updatePassword(payload).subscribe({
              next: (res) => {
                console.log('Contraseña cambiada', res);
                this.mostrarExito('Contraseña actualizada correctamente');
              },
              error: (err) => {
                console.error('Error cambiando contraseña', err);
                const msg =
                  err?.error?.message || 'No se pudo cambiar la contraseña';
                this.mostrarError(msg);
              },
            });
            return true;
          },
        },
      ],
    });
    await alert.present();
  }

  acercaDe() {
    console.log('Navegando a Acerca de...');
    this.router.navigate(['/about']);
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

  editarMenu() {
    this.router.navigate(['/empleado/editar-menu']);
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
