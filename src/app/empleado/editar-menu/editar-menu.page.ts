import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService, UserRole } from '../../services/auth.service';
import { AlertController } from '@ionic/angular/standalone';
import { firstValueFrom } from 'rxjs';
import {
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonToggle,
  ToastController,
} from '@ionic/angular/standalone';
import { MenuService, MenuItem } from '../../services/menu.service';

@Component({
  selector: 'app-editar-menu',
  templateUrl: './editar-menu.page.html',
  styleUrls: ['./editar-menu.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonContent,
    IonList,
    IonItem,
    IonLabel,
    IonInput,
    IonButton,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonToggle,
  ],
})
export class EditarMenuPage implements OnInit, OnDestroy {
  items: MenuItem[] = [];
  form: FormGroup;
  editingId: string | null = null;
  sub: Subscription | null = null;
  selectedFile: File | null = null;

  constructor(
    private fb: FormBuilder,
    private menuService: MenuService,
    private toastCtrl: ToastController,
    private router: Router,
    private auth: AuthService,
    private alertCtrl: AlertController
  ) {
    this.form = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      descripcion: [''],
      precio: [0, [Validators.required, Validators.min(0.01)]],
      disponible: [true],
      categoria: [1, [Validators.required]],
    });
  }

  ngOnInit() {
    if (!this.auth.hasAnyRole([UserRole.EMPLEADO, UserRole.SYSADMIN])) {
      this.router.navigate(['/login']);
      return;
    }

    this.sub = this.menuService.items$.subscribe((list) => (this.items = list));
    this.menuService
      .loadAll()
      .subscribe({ next: () => {}, error: (e) => console.error(e) });
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }

  async save() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const val = this.form.value;
    try {
      if (this.editingId) {
        await firstValueFrom(
          this.menuService.updateRemote(this.editingId, {
            nombre: val.nombre,
            descripcion: val.descripcion,
            precio: val.precio,
            disponible: val.disponible,
            categoria: val.categoria,
          })
        );
        this.editingId = null;
        const t = await this.toastCtrl.create({
          message: 'Plato actualizado',
          duration: 1500,
          color: 'success',
        });
        await t.present();
      } else {
        await firstValueFrom(
          this.menuService.addRemote({
            nombre: val.nombre,
            descripcion: val.descripcion,
            precio: val.precio,
            disponible: val.disponible,
            categoria: val.categoria,
            file: this.selectedFile,
          })
        );
        const t = await this.toastCtrl.create({
          message: 'Plato añadido',
          duration: 1500,
          color: 'success',
        });
        await t.present();
      }
    } catch (err) {
      console.error('[EditarMenu] save failed', err);
      const t = await this.toastCtrl.create({
        message: 'Error al guardar. Revisa la consola.',
        duration: 2500,
        color: 'danger',
      });
      await t.present();
    }
    this.form.reset({
      nombre: '',
      descripcion: '',
      precio: 0,
      disponible: true,
      categoria: 1,
    });
    this.selectedFile = null;
  }

  edit(item: MenuItem) {
    this.editingId = item.id;
    this.form.setValue({
      nombre: item.nombre || '',
      descripcion: item.descripcion || '',
      precio: item.precio || 0,
      disponible: !!item.disponible,
      categoria: Number(item.categoria) || 1,
    });
  }

  async remove(item: MenuItem) {
    const alert = await this.alertCtrl.create({
      header: 'Confirmar',
      message: `¿Eliminar ${item.nombre}?`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: async () => {
            try {
              await firstValueFrom(this.menuService.deleteRemote(item.id));
              const t = await this.toastCtrl.create({
                message: 'Plato eliminado',
                duration: 1500,
                color: 'warning',
              });
              await t.present();
            } catch (err) {
              console.error('[EditarMenu] delete failed', err);
              const t = await this.toastCtrl.create({
                message: 'Error al eliminar',
                duration: 2000,
                color: 'danger',
              });
              await t.present();
            }
          },
        },
      ],
    });
    await alert.present();
  }

  cancelEdit() {
    this.editingId = null;
    this.form.reset({
      nombre: '',
      descripcion: '',
      precio: 0,
      disponible: true,
      categoria: 1,
    });
    this.selectedFile = null;
  }

  onFileSelected(ev: any) {
    const f = ev?.target?.files?.[0] as File | undefined;
    if (f) this.selectedFile = f;
    else this.selectedFile = null;
  }

  back() {
    this.router.navigate(['/empleado/dashboard']);
  }
}
