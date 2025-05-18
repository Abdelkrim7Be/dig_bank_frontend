import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { loadingInterceptor } from './interceptors/loading.interceptor';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    // Import standalone components if you need them in this module
  ],
  exports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule],
  providers: [
    // Modern approach uses provideHttpClient with withInterceptors in app.config.ts
    // Old HTTP_INTERCEPTORS approach is no longer needed here
  ],
})
export class SharedModule {}
