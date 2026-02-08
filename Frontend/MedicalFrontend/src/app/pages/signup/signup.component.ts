import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [RouterLink],
  template: `
    <section class="page-section">
      <div class="container">
        <h1 class="page-title">Sign Up</h1>
        <p class="page-lead">Create your account.</p>
        <a routerLink="/login" class="btn btn-secondary">Already have an account? Login</a>
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
export class SignupComponent {}
