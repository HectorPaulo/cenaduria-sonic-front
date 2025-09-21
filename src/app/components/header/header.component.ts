import { Component, Input, OnInit } from '@angular/core';
import { IonTitle, IonButtons, IonToolbar, IonHeader, IonMenuButton, IonGrid, IonRow } from "@ionic/angular/standalone";

@Component({
  standalone: true,
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  imports: [IonRow, IonGrid, IonHeader, IonToolbar, IonButtons, IonTitle, IonMenuButton],
})
export class HeaderComponent  implements OnInit {
  @Input() titulo: string = 'No hay título';

  constructor() { }

  ngOnInit() {}

}
