import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {
  IonFabButton,
  IonFab,
  IonFabList,
  IonIcon,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { chevronUpCircle, person, colorPalette, chevronDownCircle, chevronForwardCircle, globe, moon, sunny } from 'ionicons/icons';
import { ThemeService } from 'src/app/services/theme.service';

@Component({
  selector: 'app-fabbtn',
  templateUrl: './fabbtn.component.html',
  styleUrls: ['./fabbtn.component.scss'],
  imports: [IonIcon, IonFabList, IonFab, IonFabButton],
})
export class FabbtnComponent implements OnInit {
  private router = inject(Router);

  navigateToPerfil() {
    this.router.navigate(['/perfil']);
  }
  onThemeToggle() {
    this.themeService.toggleTheme();
  }

  constructor(public themeService: ThemeService) {
        addIcons({
          chevronUpCircle,
          person,
          colorPalette,
          chevronDownCircle,
          chevronForwardCircle,
          globe,
          moon,
          sunny,
        });
  }

  ngOnInit() {}
}
