import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { MainLayoutComponent } from './main-layout/main-layout.component';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import { SidebarComponent } from './sidebar/sidebar.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    MainLayoutComponent,
    HeaderComponent,
    FooterComponent,
    SidebarComponent,
  ],
  exports: [
    MainLayoutComponent,
    HeaderComponent,
    FooterComponent,
    SidebarComponent,
  ],
})
export class LayoutModule {}
