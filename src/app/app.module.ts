import { NgModule } from '@angular/core';
import {
  BrowserModule,
  provideClientHydration,
} from '@angular/platform-browser';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';

// Import SharedModule and interceptor
import { SharedModule } from './shared/shared.module';
import { TokenInterceptor } from './auth/interceptors/token.interceptor';

// Import routes
import { routes } from './app-routing.module';

// This module is now only for providing services and configuration
// It is not used for bootstrapping the application
@NgModule({
  declarations: [],
  imports: [
    BrowserModule,
    RouterModule.forRoot(routes),
    HttpClientModule,
    SharedModule,
  ],
  providers: [
    provideClientHydration(),
    { provide: HTTP_INTERCEPTORS, useClass: TokenInterceptor, multi: true },
  ],
  // Remove bootstrap array for standalone components
})
export class AppModule {}
