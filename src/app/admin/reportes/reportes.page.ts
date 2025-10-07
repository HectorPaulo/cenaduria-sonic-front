import { Component } from '@angular/core';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle, IonRefresher, IonRefresherContent, 
RefresherEventDetail} from '@ionic/angular/standalone';
import { IonRefresherCustomEvent, RefresherCustomEvent } from '@ionic/core';
import { HeaderComponent } from "src/app/components/header/header.component";
import { FabbtnComponent } from "src/app/components/fabbtn/fabbtn.component";

@Component({
  selector: 'app-reportes',
  templateUrl: './reportes.page.html',
  styleUrls: ['./reportes.page.scss'],
  standalone: true,
  imports: [IonRefresherContent, IonRefresher,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    HeaderComponent, FabbtnComponent],
})
export class ReportesPage {
doRefresh(event: RefresherCustomEvent) {
    setTimeout(() => {
      // TODO: Implementar la lógica para mandar a llamar a los datos actualizacos
      event.target.complete();
    }, 2000);
  }
}
