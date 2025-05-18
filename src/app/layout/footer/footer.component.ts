import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  standalone: true,
  template: `
    <footer class="bg-light text-center text-muted py-3 mt-auto">
      <div class="container">
        <p class="mb-0">
          © {{ currentYear }} Digital Banking. All rights reserved.
        </p>
      </div>
    </footer>
  `,
  styles: [
    `
      footer {
        border-top: 1px solid #e9ecef;
      }
    `,
  ],
})
export class FooterComponent {
  currentYear = new Date().getFullYear();
}
