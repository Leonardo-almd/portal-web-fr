import { provideRouter } from '@angular/router';

import { routes } from './app.routes';

import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { PoHttpRequestModule } from '@po-ui/ng-components';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { authInterceptor } from './interceptors/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(),
    importProvidersFrom([BrowserAnimationsModule, PoHttpRequestModule]),
    provideFirebaseApp(() =>
      initializeApp({
        projectId: 'portal-web-fr',
        appId: '1:11838731901:web:a4b1a1b6cc088e1b7a2314',
        storageBucket: 'portal-web-fr.appspot.com',
        apiKey: 'AIzaSyAjdDrZe3lbxNSvsJpBV1u29pzRJJCPOlQ',
        authDomain: 'portal-web-fr.firebaseapp.com',
        messagingSenderId: '11838731901',
      })
    ),
    provideAuth(() => getAuth()),
    provideHttpClient(withInterceptors([authInterceptor])),
  ],
};
