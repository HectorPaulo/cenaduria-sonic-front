import { Component, OnInit } from '@angular/core';
import {
  IonToggle,
  IonItem,
  IonLabel,
  IonIcon,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { moon, sunny } from 'ionicons/icons';
import { ThemeService } from '../../services/theme.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-theme-toggle',
  templateUrl: './theme-toggle.component.html',
  styleUrls: ['./theme-toggle.component.scss'],
  standalone: true,
  imports: [IonToggle, IonItem, IonLabel, IonIcon, CommonModule],
})
export class ThemeToggleComponent implements OnInit {
  constructor(public themeService: ThemeService) {
    addIcons({ moon, sunny });
  }

  ngOnInit() {}

  onThemeToggle(event: any) {
    this.themeService.setTheme(event.detail.checked);
  }
}
