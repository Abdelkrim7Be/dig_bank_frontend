import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AlertComponent } from './shared/components/alert/alert.component';
import { LoaderComponent } from './shared/components/loader/loader.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, AlertComponent, LoaderComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  title = 'dig_bank_frontend';
}
