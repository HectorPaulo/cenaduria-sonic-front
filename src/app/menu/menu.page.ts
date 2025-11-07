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
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { add, cart, search, close } from 'ionicons/icons';
import Recomendacion from '../Types/Recomendacion';
import { Subscription } from 'rxjs';
import { ComidasService } from '../services/comidas.service';
import { RefresherCustomEvent } from '@ionic/core';
import { HeaderComponent } from '../components/header/header.component';
import { FabbtnComponent } from '../components/fabbtn/fabbtn.component';
import { Alimento } from '../Types/Alimento';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.page.html',
  styleUrls: ['./menu.page.scss'],
  standalone: true,
  imports: [
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
  pedidos: Alimento[] = [];
  listaComidas: Alimento[] = [];
  // bebidas: Alimento[] = [
  //   {
  //     name: 'Refresco de Cola',
  //     description: 'Bebida carbonatada con sabor a cola, refrescante y dulce.',
  //     price: 1.99,
  //     image: 'assets/bebida.png',
  //     tag: 'Bebidas',
  //     icon: '🥤',
  //   },
  //   {
  //     name: 'Cerveza Artesanal',
  //     description: 'Cerveza perfecta para acompañar hamburguesas.',
  //     price: 3.49,
  //     image: 'assets/bebida.png',
  //     tag: 'Cervezas',
  //     icon: '🍺',
  //   },
  //   {
  //     name: 'Horchata',
  //     description: 'Bebida tradicional perfecta con tacos.',
  //     price: 2.99,
  //     image: 'assets/bebida.png',
  //     tag: 'Aguas frescas',
  //     icon: '🥛',
  //   },
  //   {
  //     name: 'Agua Mineral',
  //     description: 'Agua con gas, ligera y burbujeante.',
  //     price: 1.49,
  //     image: 'assets/agua.png',
  //     tag: 'Bebidas',
  //     icon: '💧',
  //   },
  //   {
  //     name: 'Vino Tinto',
  //     description: 'Vino que complementa perfectamente los platos fuertes.',
  //     price: 4.99,
  //     image: 'assets/bebida.png',
  //     tag: 'Vinos',
  //     icon: '🍷',
  //   },
  //   {
  //     name: 'Jugo Natural',
  //     description: 'Jugo fresco de frutas naturales, sin conservadores.',
  //     price: 2.49,
  //     image: 'assets/bebida.png',
  //     tag: 'Jugos',
  //     icon: '🧃',
  //   },
  // ];

  addToList(listaItem: Alimento) {
    this.listaComidas.push(listaItem);
  }

  addToCart(pedido: Alimento) {
    this.pedidos.push(pedido);
  }

  constructor(private comidasService: ComidasService) {
    addIcons({ search, cart, add, close });
  }

  ngOnInit() {
    this.itemsSub = this.comidasService.items$.subscribe((items) => {
      console.debug('ComidasService emitted items:', items);
      this.comidas = items;
      this.comidasFiltradas = [...this.comidas];
      // this.bebidasFiltradas = [...this.bebidas];
      this.generarCategorias();
    });

    // Suscribir a categorías que provea el servicio (desde /api/categories)
    this.categoriesSub = this.comidasService.categories$.subscribe((cats) => {
      console.debug('ComidasService emitted categories:', cats);
      if (cats && cats.length > 0) {
        // this.todasCategorias = [{ name: 'Todos', icon: '🌟' }, ...cats];
      } else {
        // si no hay categorías del backend, recalcular localmente
        this.generarCategorias();
      }
    });

    // Cargar datos desde API
    this.cargarDesdeApi();
    this.cargarCategoriasDesdeApi();
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
            icon: '🫓',
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
        icon: comida?.imageUrl || '🍽️', // Usa imageUrl como icono si existe
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
      // { name: 'Todos', icon: '🌟' },
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
