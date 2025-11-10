import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonGrid,
  IonRow,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonButton,
  IonIcon,
  IonLabel,
  IonRefresher,
  IonRefresherContent,
  IonChip,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { add, cart, search, close, heart } from 'ionicons/icons';
import Recomendacion from '../Types/Recomendacion';
import { Subscription } from 'rxjs';
import { ComidasService } from '../services/comidas.service';
import { CartService } from '../services/cart.service';
import { RefresherCustomEvent } from '@ionic/core';
import { HeaderComponent } from '../components/header/header.component';
import { FabbtnComponent } from '../components/fabbtn/fabbtn.component';
import { Alimento } from '../Types/Alimento';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.page.html',
  styleUrls: ['./menu.page.scss'],
  standalone: true,
  imports: [
    IonChip,
    IonRefresherContent,
    IonRefresher,
    IonLabel,
    IonIcon,
    IonButton,
    IonCardContent,
    IonCardTitle,
    IonCardHeader,
    IonCard,
    IonRow,
    IonGrid,
    IonContent,
    CommonModule,
    FormsModule,
    HeaderComponent,
    FabbtnComponent,
  ],
})
export class MenuPage implements OnInit {
  private itemsSub?: Subscription;
  private categoriesSub?: Subscription;
  filtroActivo: string = '';
  comidasFiltradas: Alimento[] = [];
  bebidasFiltradas: Alimento[] = [];

  doRefresh(event: RefresherCustomEvent) {
    setTimeout(() => {
      // TODO: Implementar lógica para mandar a llamar la información actualizada
      this.resetearFiltros();
      event.target.complete();
    }, 2000);
  }

  comidas: Alimento[] = [];
  categoriasComida: Recomendacion[] = [];
  categoriasBebida: Recomendacion[] = [];
  todasCategorias: Recomendacion[] = [];
  listaComidas: Alimento[] = [];
  bebidas: Alimento[] = [];

  addToList(listaItem: Alimento) {
    this.listaComidas.push(listaItem);
  }

  async addToCart(pedido: Alimento) {
    try {
      this.cartService.add(pedido, 1);
      await this.presentAddedToCartToast(pedido);
    } catch (e) {
      console.error('Funcion addToCart fallida', e);
    }
  }

  private async presentAddedToCartToast(pedido: Alimento) {
    const title = pedido?.name ? String(pedido.name) : 'Producto';
    const toast = await this.toastCtrl.create({
      message: `${title} añadido al carrito`,
      duration: 1500,
      position: 'bottom',
      color: 'success',
    });
    await toast.present();
  }

  constructor(
    private comidasService: ComidasService,
    private toastCtrl: ToastController,
    private cartService: CartService
  ) {
    addIcons({ close, cart, heart, search, add });
  }

  ngOnInit() {
    this.itemsSub = this.comidasService.items$.subscribe((items) => {
      console.debug('ComidasService emitted items:', items);
      this.comidas = items;
      this.comidasFiltradas = [...this.comidas];
      this.generarCategorias();
    });

    this.categoriesSub = this.comidasService.categories$.subscribe((cats) => {
      console.debug('ComidasService emitted categories:', cats);
      if (cats && cats.length > 0) {
        this.todasCategorias = [{ name: 'Todos' }, ...cats];
      } else {
        this.generarCategorias();
      }
    });

    this.cargarDesdeApi();
    this.cargarCategoriasDesdeApi();
    this.cargarBebidasDesdeApi();
  }

  ngOnDestroy() {
    this.itemsSub?.unsubscribe();
    this.categoriesSub?.unsubscribe();
  }

  cargarDesdeApi() {
    console.debug('Intentando cargar comidas desde API...');
    this.comidasService.loadFromApi().subscribe({
      next: (items) => {
        console.debug('Respuesta API comidas:', items);
        this.comidasService.setItems(items);
      },
      error: (err) => {
        console.error('Error al cargar comidas desde API:', err);
      },
    });
  }

  cargarCategoriasDesdeApi() {
    console.debug('Intentando cargar categorías desde API...');
    this.comidasService.loadCategories().subscribe({
      next: (res) => {
        try {
          const cats: Recomendacion[] = (res || []).map((c: any) => ({
            name: c.name || c.title || String(c),
          }));
          this.comidasService.setCategories(cats);
        } catch (e) {
          console.error('Error mapeando categories response', e);
        }
      },
      error: (err) => {
        console.error('Error al cargar categorías desde API:', err);
      },
    });
  }

  cargarBebidasDesdeApi() {
    console.debug('Intentando cargar bebidas desde API (category 4)...');
    this.comidasService.loadProductsByCategory(4).subscribe({
      next: (items) => {
        try {
          console.debug('Respuesta API bebidas:', items);
          this.bebidas = items || [];
          this.bebidasFiltradas = [...this.bebidas];
          // si las categorías no vienen del backend, podemos generar etiquetas a partir de bebidas
          if (!this.comidasService.getCategories().length)
            this.generarCategorias();
        } catch (e) {
          console.error('Error procesando bebidas response', e);
        }
      },
      error: (err) => {
        console.error('Error al cargar bebidas desde API:', err);
      },
    });
  }

  generarCategorias() {
    const backendCats = this.comidasService.getCategories();
    if (backendCats && backendCats.length > 0) {
      this.categoriasComida = backendCats;
      this.categoriasBebida = [];
      // this.todasCategorias = [{ name: 'Todos', icon: '🌟' }, ...backendCats];
      return;
    }

    // Adaptación para type Alimento: usar category.name y imageUrl
    const categoriasComidaUnicas = [
      ...new Set(this.comidas.map((c) => c.category?.name)),
    ];
    this.categoriasComida = categoriasComidaUnicas.map((catName) => {
      const comida = this.comidas.find((c) => c.category?.name === catName);
      return {
        name: catName,
      };
    });

    // Si tienes bebidas separadas, aplica lo mismo:
    // if (this.bebidas) {
    //   const categoriasBebidaUnicas = [
    //     ...new Set(this.bebidas.map((b) => b.category?.name)),
    //   ];
    //   this.categoriasBebida = categoriasBebidaUnicas.map((catName) => {
    //     const bebida = this.bebidas.find((b) => b.category?.name === catName);
    //     return {
    //       name: catName,
    //       icon: bebida?.imageUrl || '🥤',
    //     };
    //   });
    // }

    this.todasCategorias = [
      { name: 'Todos' },
      ...this.categoriasComida,
      ...this.categoriasBebida,
    ];
  }

  filtrarPorCategoria(categoria: string) {
    this.filtroActivo = categoria;

    if (categoria === 'Todos') {
      this.resetearFiltros();
      return;
    }

    this.comidasFiltradas = this.comidas.filter((comida) =>
      comida.category?.name?.toLowerCase().includes(categoria.toLowerCase())
    );

    // Si en el futuro agregas bebidas, puedes replicar la lógica aquí
    // this.bebidasFiltradas = this.bebidas.filter((bebida) =>
    //   bebida.category?.name?.toLowerCase().includes(categoria.toLowerCase())
    // );

    console.log('Filtrando por:', categoria);
    console.log('Comidas filtradas:', this.comidasFiltradas.length);
    console.log('Bebidas filtradas:', this.bebidasFiltradas.length);
  }

  resetearFiltros() {
    this.filtroActivo = '';
    this.comidasFiltradas = [...this.comidas];
    // this.bebidasFiltradas = [...this.bebidas];
  }

  hayElementosFiltrados(): boolean {
    return this.comidasFiltradas.length > 0 || this.bebidasFiltradas.length > 0;
  }
}
