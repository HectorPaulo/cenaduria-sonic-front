import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  FormArray,
} from '@angular/forms';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import {
  IonContent,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonButton,
  IonIcon,
  IonBadge,
  IonItem,
  IonLabel,
  IonList,
  IonSearchbar,
  IonModal,
  IonInput,
  IonSelect,
  IonSelectOption,
  IonToggle,
  IonCheckbox,
  IonDatetime,
  IonTextarea,
  IonSpinner,
  IonRefresher,
  IonRefresherContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  AlertController,
  ToastController,
  LoadingController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  pricetag,
  add,
  create,
  trash,
  image,
  calendar,
  time,
  checkmark,
  close,
  search,
  filter,
} from 'ionicons/icons';
import { HeaderComponent } from 'src/app/components/header/header.component';
import {
  PromotionsService,
  PromotionSummaryResponse,
  PromotionDetailResponse,
  CreatePromotionRequest,
  UpdatePromotionRequest,
  PromotionType,
  DayOfWeek,
  CreateWeeklyRuleRequest,
} from 'src/app/services/promotions.service';
import { MenuService } from 'src/app/services/menu.service';
import { Alimento } from 'src/app/Types/Alimento';

@Component({
  selector: 'app-promociones',
  templateUrl: './promociones.page.html',
  styleUrls: ['./promociones.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonContent,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonButton,
    IonIcon,
    IonBadge,
    IonItem,
    IonLabel,
    IonSearchbar,
    IonModal,
    IonInput,
    IonSelect,
    IonSelectOption,
    IonCheckbox,
    IonTextarea,
    IonSpinner,
    IonRefresher,
    IonRefresherContent,
    IonHeader,
    IonToolbar,
    IonTitle,
    HeaderComponent,
  ],
})
export class PromocionesPage implements OnInit, OnDestroy {
  private promotionsService = inject(PromotionsService);
  private menuService = inject(MenuService);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private alertController = inject(AlertController);
  private toastController = inject(ToastController);
  private loadingController = inject(LoadingController);

  promotions: PromotionSummaryResponse[] = [];
  allProducts: Alimento[] = [];
  searchTerm: string = '';
  loading: boolean = false;
  isModalOpen: boolean = false;
  isEditMode: boolean = false;
  selectedPromotion: PromotionDetailResponse | null = null;
  selectedImageFile: File | null = null;
  imagePreview: string | null = null;

  promotionForm!: FormGroup;

  daysOfWeek: DayOfWeek[] = [
    'MONDAY',
    'TUESDAY',
    'WEDNESDAY',
    'THURSDAY',
    'FRIDAY',
    'SATURDAY',
    'SUNDAY',
  ];

  private destroy$ = new Subject<void>();

  constructor() {
    addIcons({
      pricetag,
      add,
      create,
      trash,
      image,
      calendar,
      time,
      checkmark,
      close,
      search,
      filter,
    });

    this.initForm();
  }

  ngOnInit() {
    this.loadPromotions();
    this.loadProducts();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ============ INICIALIZACIÓN ============

  initForm() {
    this.promotionForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(120)]],
      description: [''],
      price: [0, [Validators.required, Validators.min(0.01)]],
      type: ['TEMPORARY' as PromotionType, Validators.required],
      startsAt: [''],
      endsAt: [''],
      productIds: [[], Validators.required],
      weeklyRules: this.fb.array([]),
    });

    // Watch type changes to adjust validators
    this.promotionForm.get('type')?.valueChanges.subscribe((type) => {
      this.onTypeChange(type);
    });
  }

  get weeklyRules(): FormArray {
    return this.promotionForm.get('weeklyRules') as FormArray;
  }

  // ============ CARGAR DATOS ============

  async loadPromotions() {
    this.loading = true;
    this.promotionsService
      .getPromotions(0, 100)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.promotions = response.content || [];
          this.loading = false;
        },
        error: async (err) => {
          console.error('Error loading promotions:', err);
          this.loading = false;
          await this.showToast('Error al cargar promociones', 'danger');
        },
      });
  }

  loadProducts() {
    this.menuService.loadActive().subscribe({
      next: () => {
        this.allProducts = this.menuService.getItems();
      },
      error: (err) => {
        console.error('Error loading products:', err);
      },
    });
  }

  async doRefresh(event: any) {
    await this.loadPromotions();
    event.target.complete();
  }

  // ============ BÚSQUEDA Y FILTROS ============

  onSearch() {
    if (!this.searchTerm.trim()) {
      this.loadPromotions();
      return;
    }

    this.loading = true;
    this.promotionsService
      .searchPromotionsByName(this.searchTerm)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (promotions) => {
          this.promotions = promotions;
          this.loading = false;
        },
        error: async (err) => {
          console.error('Error searching:', err);
          this.loading = false;
          await this.showToast('Error en la búsqueda', 'danger');
        },
      });
  }

  filterByType(type: PromotionType) {
    this.loading = true;
    this.promotionsService
      .getPromotionsByType(type)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (promotions) => {
          this.promotions = promotions;
          this.loading = false;
        },
        error: async (err) => {
          console.error('Error filtering:', err);
          this.loading = false;
        },
      });
  }

  // ============ MODAL ============

  openCreateModal() {
    this.isEditMode = false;
    this.selectedPromotion = null;
    this.promotionForm.reset({
      type: 'TEMPORARY',
      price: 0,
      productIds: [],
    });
    this.weeklyRules.clear();
    this.selectedImageFile = null;
    this.imagePreview = null;
    this.isModalOpen = true;
  }

  async openEditModal(promotion: PromotionSummaryResponse) {
    const loading = await this.loadingController.create({
      message: 'Cargando...',
    });
    await loading.present();

    this.promotionsService
      .getPromotionById(promotion.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (detail) => {
          this.isEditMode = true;
          this.selectedPromotion = detail;
          this.populateForm(detail);
          this.imagePreview = detail.imageUrl || null;
          this.isModalOpen = true;
          loading.dismiss();
        },
        error: async (err) => {
          console.error('Error loading promotion details:', err);
          loading.dismiss();
          await this.showToast('Error al cargar detalles', 'danger');
        },
      });
  }

  closeModal() {
    this.isModalOpen = false;
    this.promotionForm.reset();
    this.weeklyRules.clear();
    this.selectedImageFile = null;
    this.imagePreview = null;
  }

  populateForm(promotion: PromotionDetailResponse) {
    this.promotionForm.patchValue({
      name: promotion.name,
      description: promotion.description,
      price: promotion.price,
      type: promotion.type,
      startsAt: promotion.startsAt,
      endsAt: promotion.endsAt,
      productIds: promotion.products.map((p) => p.id),
    });

    // Populate weekly rules if recurring
    if (promotion.type === 'RECURRING' && promotion.weeklyRules) {
      this.weeklyRules.clear();
      promotion.weeklyRules.forEach((rule) => {
        this.addWeeklyRule(rule);
      });
    }
  }

  onTypeChange(type: PromotionType) {
    const startsAtControl = this.promotionForm.get('startsAt');
    const endsAtControl = this.promotionForm.get('endsAt');

    if (type === 'TEMPORARY') {
      startsAtControl?.setValidators(Validators.required);
      endsAtControl?.setValidators(Validators.required);
      this.weeklyRules.clear();
    } else {
      startsAtControl?.clearValidators();
      endsAtControl?.clearValidators();
      startsAtControl?.setValue('');
      endsAtControl?.setValue('');
    }

    startsAtControl?.updateValueAndValidity();
    endsAtControl?.updateValueAndValidity();
  }

  // ============ REGLAS SEMANALES ============

  addWeeklyRule(existingRule?: any) {
    const ruleGroup = this.fb.group({
      dayOfWeek: [existingRule?.dayOfWeek || 'MONDAY', Validators.required],
      startTime: [
        existingRule?.startTime || { hour: 10, minute: 0, second: 0, nano: 0 },
        Validators.required,
      ],
      endTime: [
        existingRule?.endTime || { hour: 18, minute: 0, second: 0, nano: 0 },
        Validators.required,
      ],
    });
    this.weeklyRules.push(ruleGroup);
  }

  removeWeeklyRule(index: number) {
    this.weeklyRules.removeAt(index);
  }

  // ============ IMAGEN ============

  onImageSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      this.showToast('La imagen no debe superar 5MB', 'warning');
      return;
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      this.showToast('Solo se permiten imágenes JPG, PNG o WebP', 'warning');
      return;
    }

    this.selectedImageFile = file;

    // Preview
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.imagePreview = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  // ============ GUARDAR ============

  async savePromotion() {
    if (this.promotionForm.invalid) {
      await this.showToast(
        'Por favor completa todos los campos requeridos',
        'warning'
      );
      return;
    }

    const formValue = this.promotionForm.value;

    // Validate weekly rules for recurring promotions
    if (formValue.type === 'RECURRING' && this.weeklyRules.length === 0) {
      await this.showToast(
        'Las promociones recurrentes requieren al menos una regla semanal',
        'warning'
      );
      return;
    }

    const loading = await this.loadingController.create({
      message: this.isEditMode ? 'Actualizando...' : 'Creando...',
    });
    await loading.present();

    if (this.isEditMode && this.selectedPromotion) {
      await this.updatePromotion(loading);
    } else {
      await this.createPromotion(loading);
    }
  }

  async createPromotion(loading: HTMLIonLoadingElement) {
    const formValue = this.promotionForm.value;

    const request: CreatePromotionRequest = {
      name: formValue.name,
      description: formValue.description,
      price: formValue.price,
      type: formValue.type,
      productIds: formValue.productIds,
    };

    if (formValue.type === 'TEMPORARY') {
      request.startsAt = formValue.startsAt;
      request.endsAt = formValue.endsAt;
    } else {
      request.weeklyRules = this.weeklyRules.value;
    }

    this.promotionsService
      .createPromotion(request)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: async (promotion) => {
          // Upload image if selected
          if (this.selectedImageFile) {
            await this.uploadImage(promotion.id);
          }

          loading.dismiss();
          await this.showToast('Promoción creada exitosamente', 'success');
          this.closeModal();
          this.loadPromotions();
        },
        error: async (err) => {
          console.error('Error creating promotion:', err);
          loading.dismiss();
          await this.showToast(
            err.error?.message || 'Error al crear promoción',
            'danger'
          );
        },
      });
  }

  async updatePromotion(loading: HTMLIonLoadingElement) {
    if (!this.selectedPromotion) return;

    const formValue = this.promotionForm.value;

    const request: UpdatePromotionRequest = {
      name: formValue.name,
      description: formValue.description,
      price: formValue.price,
      productIds: formValue.productIds,
    };

    if (formValue.type === 'TEMPORARY') {
      request.startsAt = formValue.startsAt;
      request.endsAt = formValue.endsAt;
    } else {
      request.weeklyRules = this.weeklyRules.value;
    }

    this.promotionsService
      .updatePromotion(this.selectedPromotion.id, request)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: async (promotion) => {
          // Upload image if selected
          if (this.selectedImageFile) {
            await this.uploadImage(promotion.id);
          }

          loading.dismiss();
          await this.showToast('Promoción actualizada exitosamente', 'success');
          this.closeModal();
          this.loadPromotions();
        },
        error: async (err) => {
          console.error('Error updating promotion:', err);
          loading.dismiss();
          await this.showToast(
            err.error?.message || 'Error al actualizar promoción',
            'danger'
          );
        },
      });
  }

  async uploadImage(promotionId: number): Promise<void> {
    if (!this.selectedImageFile) return;

    return new Promise((resolve, reject) => {
      this.promotionsService
        .uploadPromotionImage(promotionId, this.selectedImageFile!)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => resolve(),
          error: (err) => {
            console.error('Error uploading image:', err);
            reject(err);
          },
        });
    });
  }

  // ============ TOGGLE STATUS ============

  async toggleStatus(promotion: PromotionSummaryResponse) {
    const loading = await this.loadingController.create({
      message: 'Cambiando estado...',
    });
    await loading.present();

    this.promotionsService
      .togglePromotionStatus(promotion.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: async () => {
          loading.dismiss();
          await this.showToast('Estado actualizado', 'success');
          this.loadPromotions();
        },
        error: async (err) => {
          console.error('Error toggling status:', err);
          loading.dismiss();
          await this.showToast(
            err.error?.message || 'Error al cambiar estado',
            'danger'
          );
        },
      });
  }

  // ============ ELIMINAR ============

  async confirmDelete(promotion: PromotionSummaryResponse) {
    const alert = await this.alertController.create({
      header: 'Confirmar eliminación',
      message: `¿Estás seguro de eliminar la promoción "${promotion.name}"? Esta acción no se puede deshacer.`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: () => {
            this.deletePromotion(promotion.id);
          },
        },
      ],
    });

    await alert.present();
  }

  async deletePromotion(id: number) {
    const loading = await this.loadingController.create({
      message: 'Eliminando...',
    });
    await loading.present();

    this.promotionsService
      .deletePromotion(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: async () => {
          loading.dismiss();
          await this.showToast('Promoción eliminada', 'success');
          this.loadPromotions();
        },
        error: async (err) => {
          console.error('Error deleting promotion:', err);
          loading.dismiss();
          await this.showToast(
            err.error?.message ||
              'Error al eliminar. Verifica que esté inactiva.',
            'danger'
          );
        },
      });
  }

  // ============ UTILIDADES ============

  async showToast(message: string, color: string = 'primary') {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      color,
      position: 'bottom',
    });
    await toast.present();
  }

  getStatusColor(promotion: PromotionSummaryResponse): string {
    if (!promotion.active) return 'medium';
    return promotion.currentlyValid ? 'success' : 'warning';
  }

  getStatusText(promotion: PromotionSummaryResponse): string {
    if (!promotion.active) return 'Inactiva';
    return promotion.currentlyValid ? 'Activa' : 'Activa (fuera de horario)';
  }

  isProductSelected(productId: number): boolean {
    const selectedIds = this.promotionForm.get('productIds')?.value || [];
    return selectedIds.includes(productId);
  }

  toggleProduct(productId: number, event: any) {
    const selectedIds = this.promotionForm.get('productIds')?.value || [];
    if (event.detail.checked) {
      if (!selectedIds.includes(productId)) {
        selectedIds.push(productId);
      }
    } else {
      const index = selectedIds.indexOf(productId);
      if (index > -1) {
        selectedIds.splice(index, 1);
      }
    }
    this.promotionForm.patchValue({ productIds: selectedIds });
  }

  formatTime(time: any): string {
    if (!time) return '00:00';
    const hour = String(time.hour || 0).padStart(2, '0');
    const minute = String(time.minute || 0).padStart(2, '0');
    return `${hour}:${minute}`;
  }

  onTimeChange(index: number, field: 'startTime' | 'endTime', event: any) {
    const timeStr = event.detail.value;
    const [hour, minute] = timeStr.split(':').map(Number);
    const timeObj = { hour, minute, second: 0, nano: 0 };
    this.weeklyRules.at(index).patchValue({ [field]: timeObj });
  }

  getWeeklyRuleGroup(index: number): FormGroup {
    return this.weeklyRules.at(index) as FormGroup;
  }
}
