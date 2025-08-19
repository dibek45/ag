import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { environment } from './environments/environment';
import { registerLocaleData } from '@angular/common';
import localeEsMx from '@angular/common/locales/es-MX';

// 🔥 Limpieza automática solo en desarrollo

registerLocaleData(localeEsMx, 'es-MX');

// 🚀 Bootstrap normal
bootstrapApplication(AppComponent, appConfig)
  .catch(err => console.error(err));
