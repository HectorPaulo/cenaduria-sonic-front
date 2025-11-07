import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonGrid,
  IonRow,
  IonCard,
  IonCardContent,
  IonCardTitle,
  IonCardHeader,
  IonChip,
  IonLabel,
  IonRefresher,
  IonRefresherContent,
} from '@ionic/angular/standalone';
import { HeaderComponent } from '../components/header/header.component';
import { RouterLink } from '@angular/router';
import Promocion from '../Types/Promocion';
import { RefresherCustomEvent } from '@ionic/core/components';
import { FabbtnComponent } from '../components/fabbtn/fabbtn.component';
import { Subscription } from 'rxjs';
import { Alimento } from '../Types/Alimento';
import { ComidasService } from '../services/comidas.service';
import Recomendacion from '../Types/Recomendacion';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [
    IonRefresherContent,
    IonRefresher,
    IonLabel,
    IonChip,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonCard,
    IonRow,
    IonGrid,
    IonContent,
    CommonModule,
    FormsModule,
    HeaderComponent,
    RouterLink,
    FabbtnComponent,
  ],
})
export class HomePage implements OnInit {
  private itemsSub?: Subscription;
  private categoriesSub?: Subscription;
  filtroActivo: string = '';
  menuDestacadoFiltrado: Alimento[] = [];
  todasCategorias: Recomendacion[] = [];
  generarCategorias: any;

  doRefresh(event: RefresherCustomEvent) {
    setTimeout(() => {
      // TODO: Implementar la lógica para mandar a llamar a los datos actualizacos
      event.target.complete();
    }, 2000);
  }
  navigateToTop() {
    this.content.scrollToTop(500);
  }

  navigateToBottom() {
    this.content.scrollToBottom(500);
  }

  @ViewChild(IonContent) content!: IonContent;

  menuDestacado: Alimento[] = [];
  promociones: Promocion[] = [
    {
      name: '2x1 en Tacos',
      description: 'Solo hoy de 6pm a 9pm',
      image: 'assets/tacos.png',
    },
    {
      name: 'Combo Familiar',
      description: '4 hamburguesas + 4 papas + 4 refrescos por $150',
      image: 'assets/burgers.png',
    },
  ];

  constructor(private comidasService: ComidasService) {}
  ngOnInit() {
    this.itemsSub = this.comidasService.items$.subscribe((items) => {
      this.menuDestacado = items;
      // cada vez que cambian los items, recalcular el menu destacado filtrado
      this.applyFeaturedFilter();
    });

    this.categoriesSub = this.comidasService.categories$.subscribe((cats) => {
      if (cats && cats.length > 0) {
        this.todasCategorias = [{ name: 'Todos' }, ...cats];
      } else {
        this.generarCategorias();
      }
      // categories changed -> re-aplicar filtro por hamburguesas
      this.applyFeaturedFilter();
    });

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
            icon: c.icon || '🍽️',
            id: c.id,
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

  private applyFeaturedFilter() {
    const targetId = 5;

    this.comidasService.loadProductsByCategory(targetId).subscribe({
      next: (items) => {
        this.menuDestacadoFiltrado = items || [];
      },
      error: (err) => {
        console.error(
          `Error cargando productos de categoría ${targetId} desde backend:`,
          err
        );
        this.menuDestacadoFiltrado = this.menuDestacado.filter(
          (it) => Number(it.category?.id) === targetId
        );
      },
    });
  }
}
