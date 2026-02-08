import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterLink],
  template: `
    <section class="page-section">
      <div class="container">
        <h1 class="page-title">Login</h1>
        <p class="page-lead">Sign in to your account.</p>
        <a routerLink="/signup" class="btn btn-secondary">Create Account</a>
      </div>
    </section>
  `,
  styles: [`
    .page-section { padding: 6rem 0; min-height: 50vh; }
    .page-title { font-size: 2.5rem; margin-bottom: 1rem; color: #0f172a; }
    .page-lead { font-size: 1.2rem; color: #64748b; margin-bottom: 1.5rem; }
    .btn { padding: 0.55rem 1.2rem; border-radius: 999px; text-decoration: none; font-weight: 600; display: inline-block; }
    .btn-secondary { background: transparent; color: #0ea5e9; border: 2px solid #0ea5e9; }
  `]
})
export class LoginComponent {}
