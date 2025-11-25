import { Component, Input, OnInit } from '@angular/core';
import {
  IonButtons,
  IonToolbar,
  IonHeader,
  IonMenuButton,
} from '@ionic/angular/standalone';

@Component({
  standalone: true,
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  imports: [IonHeader, IonToolbar, IonButtons, IonMenuButton],
})
export class HeaderComponent implements OnInit {
  username: string = 'Sonic el Erizo';
  role: string = 'desconocido';
  avatar: string = '';
  @Input() titulo: string = 'No hay título';

  constructor() {}

  ngOnInit() {
    const currentUserJson = localStorage.getItem('currentUser');
    if (currentUserJson) {
      try {
        const user = JSON.parse(currentUserJson) as {
          nombre?: string;
          role?: string;
          avatar?: string;
        };
        this.username = user.nombre ?? this.username;
        this.role = user.role ?? this.role;
        this.avatar = user.avatar ?? this.avatar;
      } catch (e) {
        console.error('Error: ', e);
      }
    }
  }
}
