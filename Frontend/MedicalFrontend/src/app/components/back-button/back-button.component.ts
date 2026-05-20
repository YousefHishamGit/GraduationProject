import { Component, inject, Input } from '@angular/core';
import { Location, CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-back-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button class="back-btn" (click)="goBack()" *ngIf="showBackButton()">
      <i class="fas fa-arrow-left"></i> Back
    </button>
  `,
  styles: [`
    .back-btn {
      position: fixed;
      bottom: 30px;
      left: 30px;
      z-index: 1000;
      background: var(--primary);
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 50px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 10px;
      font-weight: 600;
      font-size: 1rem;
      transition: all 0.3s ease;
      font-family: inherit;
    }
    .back-btn:hover {
      transform: translateY(-3px);
      box-shadow: 0 6px 16px rgba(0,0,0,0.3);
      background: var(--primary-dark);
    }
    .back-btn:active {
      transform: translateY(0);
    }
    @media (max-width: 768px) {
      .back-btn {
        bottom: 20px;
        left: 20px;
        padding: 8px 16px;
        font-size: 0.9rem;
      }
    }
  `]
})
export class BackButtonComponent {
  private location = inject(Location);
  private router = inject(Router);

  @Input() forceShow = false;

  showBackButton(): boolean {
    if (this.forceShow) return true;
    const url = this.router.url.split('?')[0];
    const hiddenRoutes = [
      '/',
      '/login',
      '/signup',
      '/admin-dashboard',
      '/doctor-dashboard',
      '/patient-dashboard',
      '/appointment'
    ];
    return !hiddenRoutes.includes(url);
  }

  goBack() {
    if (window.history.length > 1) {
      this.location.back();
    } else {
      this.router.navigate(['/']);
    }
  }
}
