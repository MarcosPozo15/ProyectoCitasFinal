import 'zone.js';

import { bootstrapApplication } from '@angular/platform-browser';
import {
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';
import { provideRouter, RouterOutlet } from '@angular/router';
import { Component } from '@angular/core';
import { appRoutes } from './app/app.routes';
import { authInterceptor } from './app/core/interceptors/auth.interceptor';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: '<router-outlet></router-outlet>',
})
class AppComponent {}

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(appRoutes),
    provideHttpClient(withInterceptors([authInterceptor])),
  ],
}).catch((err) => console.error(err));