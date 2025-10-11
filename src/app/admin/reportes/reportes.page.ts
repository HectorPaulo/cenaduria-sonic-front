import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle, 
  IonRefresher, 
  IonRefresherContent,
  IonIcon,
  IonChip,
  IonLabel,
  RefresherEventDetail
} from '@ionic/angular/standalone';
import { IonRefresherCustomEvent, RefresherCustomEvent } from '@ionic/core';
import { HeaderComponent } from "src/app/components/header/header.component";
import { FabbtnComponent } from "src/app/components/fabbtn/fabbtn.component";
import Reporte from 'src/app/Types/Reporte';
import { addIcons } from 'ionicons';
import { calendar, cash, analytics, document } from 'ionicons/icons';

@Component({
  selector: 'app-reportes',
  templateUrl: './reportes.page.html',
  styleUrls: ['./reportes.page.scss'],
  standalone: true,
  imports: [
    IonLabel,
    IonChip,
    IonIcon,
    IonRefresherContent, 
    IonRefresher,
    IonContent,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    HeaderComponent, 
    FabbtnComponent,
    CommonModule
  ],
})
export class ReportesPage implements OnInit {
  
  reportes: Reporte[] = [];
  reportesPorEmpresa: { [empresa: string]: Reporte[] } = {};
  empresas: string[] = [];

  constructor() {
    addIcons({ calendar, cash, analytics, document });
  }

  ngOnInit() {
    this.cargarReportes();
  }

  cargarReportes() {
    // Datos mock para mostrar los reportes de múltiples empresas
    this.reportes = [
     
      {
        id: 2,
        nombre: 'Reporte Mensual',
        comentario: 'Análisis completo del mes de enero',
        fecha: '2024-01-31',
        cantidadVentas: 1032,
        totalIngresos: 48750.75,
        empresa: 'Cenaduria Sonic Centro',
        logo: '🍔'
      },
      
     
    ];

    this.agruparReportesPorEmpresa();
  }

  agruparReportesPorEmpresa() {
    this.reportesPorEmpresa = {};
    this.empresas = [];

    this.reportes.forEach(reporte => {
      if (!this.reportesPorEmpresa[reporte.empresa]) {
        this.reportesPorEmpresa[reporte.empresa] = [];
        this.empresas.push(reporte.empresa);
      }
      this.reportesPorEmpresa[reporte.empresa].push(reporte);
    });
  }

  getTotalVentasEmpresa(empresa: string): number {
    return this.reportesPorEmpresa[empresa].reduce((total, reporte) => total + reporte.cantidadVentas, 0);
  }

  getTotalIngresosEmpresa(empresa: string): number {
    return this.reportesPorEmpresa[empresa].reduce((total, reporte) => total + reporte.totalIngresos, 0);
  }

  formatearFecha(fecha: string): string {
    const date = new Date(fecha);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  formatearMoneda(cantidad: number): string {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(cantidad);
  }

  doRefresh(event: RefresherCustomEvent) {
    setTimeout(() => {
      this.cargarReportes();
      event.target.complete();
    }, 2000);
  }
}
