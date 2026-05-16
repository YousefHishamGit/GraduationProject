import { Component, inject } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { BackButtonComponent } from './components/back-button/back-button.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, HeaderComponent, FooterComponent, BackButtonComponent],
  template: `
    @if (showLayout()) {
      <app-header />
    }
    <main [class.has-header]="showLayout()">
      <router-outlet />
    </main>
    @if (showLayout()) {
      <app-footer />
    }
    <app-back-button />
  `,
  styles: [`
    .has-header {
      padding-top: 171px;
      min-height: calc(100vh - 171px);
      display: flex;
      flex-direction: column;
    }
  `]
})
export class AppComponent {
  private router = inject(Router);

  // Hide header/footer on dashboard pages
  showLayout() {
    const url = this.router.url;
    const dashboardRoutes = [
      '/admin', '/doctor-dashboard', '/patient-dashboard'
    ];
    return !dashboardRoutes.some(r => url.startsWith(r));
  }
}