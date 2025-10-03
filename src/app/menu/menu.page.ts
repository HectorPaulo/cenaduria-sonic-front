import { Component, OnInit } from '@angular/core';
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
  IonCol,
  IonText,
  IonRefresher,
  IonRefresherContent,
} from '@ionic/angular/standalone';
import Comida from '../Types/Comida';
import { addIcons } from 'ionicons';
import { add, cart, search, close } from 'ionicons/icons';
import Pedido from '../Types/Pedido';
import Lista from '../Types/Lista';
import Bebida from '../Types/Bebida';
import Recomendacion from '../Types/Recomendacion';
import { RefresherCustomEvent } from '@ionic/core';
import { HeaderComponent } from '../components/header/header.component';
import { FabbtnComponent } from '../components/fabbtn/fabbtn.component';

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
  // Variables para el filtrado
  filtroActivo: string = '';
  comidasFiltradas: Comida[] = [];
  bebidasFiltradas: Bebida[] = [];

  doRefresh(event: RefresherCustomEvent) {
    setTimeout(() => {
      // TODO: Implementar lógica para mandar a llamar la información actualizada
      this.resetearFiltros();
      event.target.complete();
    }, 2000);
  }
  comidas: Comida[] = [
    {
      name: 'Albóndigas Clásicas',
      description: 'Jugosas albóndigas de res con salsa de tomate y especias.',
      price: 8.99,
      image: 'assets/comida.png',
      tag: 'Platos fuertes',
      icon: '🍽️',
    },
    {
      name: 'Hamburguesa con Queso',
      description:
        'Hamburguesa de res con queso cheddar, lechuga, tomate y cebolla.',
      price: 7.99,
      image: 'assets/burgers.png',
      tag: 'Hamburguesas',
      icon: '🍔',
    },
    {
      name: 'Tacos',
      description: 'Tacos de carne asada con cebolla, cilantro y salsa.',
      price: 7.99,
      image: 'assets/tacos.png',
      tag: 'Tacos',
      icon: '🌮',
    },
  ];
  // Categorías dinámicas basadas en los datos reales
  categoriasComida: Recomendacion[] = [];
  categoriasBebida: Recomendacion[] = [];
  todasCategorias: Recomendacion[] = [];
  pedidos: Pedido[] = [];
  listaComidas: Lista[] = [];
  bebidas: Bebida[] = [
    {
      name: 'Refresco de Cola',
      description: 'Bebida carbonatada con sabor a cola, refrescante y dulce.',
      price: 1.99,
      image: 'assets/bebida.png',
      tag: 'Bebidas',
      icon: '🥤',
    },
    {
      name: 'Cerveza Artesanal',
      description: 'Cerveza perfecta para acompañar hamburguesas.',
      price: 3.49,
      image: 'assets/bebida.png',
      tag: 'Hamburguesas',
      icon: '🍺',
    },
    {
      name: 'Horchata',
      description: 'Bebida tradicional perfecta con tacos.',
      price: 2.99,
      image: 'assets/bebida.png',
      tag: 'Tacos',
      icon: '🥛',
    },
    {
      name: 'Agua Mineral',
      description: 'Agua con gas, ligera y burbujeante.',
      price: 1.49,
      image: 'assets/agua.png',
      tag: 'Bebidas',
      icon: '💧',
    },
    {
      name: 'Vino Tinto',
      description: 'Vino que complementa perfectamente los platos fuertes.',
      price: 4.99,
      image: 'assets/bebida.png',
      tag: 'Platos fuertes',
      icon: '🍷',
    },
    {
      name: 'Jugo Natural',
      description: 'Jugo fresco de frutas naturales, sin conservadores.',
      price: 2.49,
      image: 'assets/bebida.png',
      tag: 'Bebidas',
      icon: '🧃',
    },
  ];

  addToList(listaItem: Lista) {
    this.listaComidas.push(listaItem);
  }

  addToCart(pedido: Pedido) {
    this.pedidos.push(pedido);
  }

  constructor() {
    addIcons({ search, cart, add, close });
  }

  ngOnInit() {
    // Inicializar los arrays filtrados con todos los elementos
    this.comidasFiltradas = [...this.comidas];
    this.bebidasFiltradas = [...this.bebidas];

    // Generar categorías dinámicas
    this.generarCategorias();
  }

  // Generar categorías basadas en los datos
  generarCategorias() {
    // Categorías únicas de comida
    const categoriasComidaUnicas = [...new Set(this.comidas.map((c) => c.tag))];
    this.categoriasComida = categoriasComidaUnicas.map((tag) => {
      const comida = this.comidas.find((c) => c.tag === tag);
      return { name: tag, icon: comida?.icon || '🍽️' };
    });

    // Categorías únicas de bebidas
    const categoriasBebidaUnicas = [...new Set(this.bebidas.map((b) => b.tag))];
    this.categoriasBebida = categoriasBebidaUnicas.map((tag) => {
      const bebida = this.bebidas.find((b) => b.tag === tag);
      return { name: tag, icon: bebida?.icon || '🥤' };
    });

    // Todas las categorías con la opción "Todos"
    this.todasCategorias = [
      { name: 'Todos', icon: '🌟' },
      ...this.categoriasComida,
      ...this.categoriasBebida,
    ];
  }

  // Método para filtrar por categoría
  filtrarPorCategoria(categoria: string) {
    this.filtroActivo = categoria;

    if (categoria === 'Todos') {
      this.resetearFiltros();
      return;
    }

    // Filtrar comidas por tag
    this.comidasFiltradas = this.comidas.filter((comida) =>
      comida.tag.toLowerCase().includes(categoria.toLowerCase())
    );

    // Filtrar bebidas por tag
    this.bebidasFiltradas = this.bebidas.filter((bebida) =>
      bebida.tag.toLowerCase().includes(categoria.toLowerCase())
    );

    console.log('Filtrando por:', categoria);
    console.log('Comidas filtradas:', this.comidasFiltradas.length);
    console.log('Bebidas filtradas:', this.bebidasFiltradas.length);
  }

  // Método para resetear filtros y mostrar todo
  resetearFiltros() {
    this.filtroActivo = '';
    this.comidasFiltradas = [...this.comidas];
    this.bebidasFiltradas = [...this.bebidas];
  }

  // Método para verificar si hay elementos filtrados
  hayElementosFiltrados(): boolean {
    return this.comidasFiltradas.length > 0 || this.bebidasFiltradas.length > 0;
  }
}
