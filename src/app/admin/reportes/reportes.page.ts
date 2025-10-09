import { Component } from '@angular/core';
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
  IonCardSubtitle,
  IonLabel,
} from '@ionic/angular/standalone';
import { RefresherCustomEvent } from '@ionic/core';
import { HeaderComponent } from 'src/app/components/header/header.component';
import { FabbtnComponent } from 'src/app/components/fabbtn/fabbtn.component';

@Component({
  selector: 'app-reportes',
  templateUrl: './reportes.page.html',
  styleUrls: ['./reportes.page.scss'],
  standalone: true,
  imports: [
    IonLabel,
    IonCardSubtitle,
    IonRefresherContent,
    IonRefresher,
    IonContent,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    HeaderComponent,
    FabbtnComponent,
    IonCardContent
],
})
export class ReportesPage {
  doRefresh(event: RefresherCustomEvent) {
    setTimeout(() => {
      // TODO: Implementar la lógica para mandar a llamar a los datos actualizacos
      event.target.complete();
    }, 2000);
  }
}
