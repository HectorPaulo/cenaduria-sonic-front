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

  constructor(
    private fb: FormBuilder,
    private menuService: MenuService,
    private toastCtrl: ToastController,
    private router: Router
  ) {
    this.form = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      descripcion: [''],
      precio: [0, [Validators.required, Validators.min(0.01)]],
      disponible: [true],
      categoria: ['comida'],
    });
  }

  ngOnInit() {
    this.sub = this.menuService.items$.subscribe((list) => (this.items = list));
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
    if (this.editingId) {
      this.menuService.update(this.editingId, val);
      this.editingId = null;
      const t = await this.toastCtrl.create({
        message: 'Plato actualizado',
        duration: 1500,
        color: 'success',
      });
      await t.present();
    } else {
      this.menuService.add(val);
      const t = await this.toastCtrl.create({
        message: 'Plato añadido',
        duration: 1500,
        color: 'success',
      });
      await t.present();
    }
    this.form.reset({
      nombre: '',
      descripcion: '',
      precio: 0,
      disponible: true,
      categoria: 'comida',
    });
  }

  edit(item: MenuItem) {
    this.editingId = item.id;
    this.form.setValue({
      nombre: item.nombre || '',
      descripcion: item.descripcion || '',
      precio: item.precio || 0,
      disponible: !!item.disponible,
      categoria: item.categoria || 'comida',
    });
  }

  async remove(item: MenuItem) {
    this.menuService.remove(item.id);
    const t = await this.toastCtrl.create({
      message: 'Plato eliminado',
      duration: 1500,
      color: 'warning',
    });
    await t.present();
  }

  cancelEdit() {
    this.editingId = null;
    this.form.reset({
      nombre: '',
      descripcion: '',
      precio: 0,
      disponible: true,
      categoria: 'comida',
    });
  }

  back() {
    this.router.navigate(['/empleado/dashboard']);
  }
}
