import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private darkMode = false;

  constructor() {
    // * Verificar si hay una preferencia guardada
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      this.darkMode = savedTheme === 'dark';
    } else {
      // * Usar preferencia del sistema si no hay guardada
      this.darkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    this.updateTheme();
  }

  toggleTheme() {
    this.darkMode = !this.darkMode;
    this.updateTheme();
    localStorage.setItem('theme', this.darkMode ? 'dark' : 'light');
  }

  private updateTheme() {
    document.body.classList.toggle('dark', this.darkMode);
  }

  isDarkMode(): boolean {
    return this.darkMode;
  }

  setTheme(isDark: boolean) {
    this.darkMode = isDark;
    this.updateTheme();
    localStorage.setItem('theme', this.darkMode ? 'dark' : 'light');
  }
}
