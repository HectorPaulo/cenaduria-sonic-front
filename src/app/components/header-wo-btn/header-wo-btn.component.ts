import { Component, Input, OnInit } from '@angular/core';
import { IonHeader, IonToolbar, IonButtons, IonMenuButton, IonGrid, IonRow, IonTitle, IonText } from "@ionic/angular/standalone";

@Component({
  selector: 'app-header-wo-btn',
  templateUrl: './header-wo-btn.component.html',
  styleUrls: ['./header-wo-btn.component.scss'],
  imports: [IonText, 
    IonTitle,
    IonRow,
    IonGrid,
    IonButtons,
    IonHeader,
    IonToolbar,
    IonMenuButton,
  ],
})
export class HeaderWoBtnComponent implements OnInit {
  @Input() titulo: string = 'No hay título';

  constructor() {}

  ngOnInit() {}
}
