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
  camera,
  shieldCheckmarkOutline,
  keyOutline,
  imageOutline,
  helpCircleOutline,
  calendarOutline,
  informationCircleOutline,
} from 'ionicons/icons';
import User from '../Types/User';
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
      camera,
      shieldCheckmarkOutline,
      keyOutline,
      imageOutline,
      helpCircleOutline,
      calendarOutline,
      informationCircleOutline,
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
    const file = input.files?.[0];
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
          // Update local UI
          this.usuario.avatar = newUrl;
          // Update globally in AuthService so it persists across the app
          this.authService.updateUserAvatar(newUrl);
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
