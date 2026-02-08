import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-doctors',
  standalone: true,
  imports: [RouterLink],
  template: `
    <section class="page-section">
      <div class="container">
        <h1 class="page-title">Our Doctors</h1>
        <p class="page-lead">Meet our experienced medical professionals.</p>
        <a routerLink="/appointment" class="btn btn-primary">Book an Appointment</a>
      </div>
    </section>
  `,
  styles: [`
    .page-section { padding: 6rem 0; min-height: 50vh; }
    .page-title { font-size: 2.5rem; margin-bottom: 1rem; color: #0f172a; }
    .page-lead { font-size: 1.2rem; color: #64748b; margin-bottom: 1.5rem; }
    .btn { padding: 0.55rem 1.2rem; border-radius: 999px; text-decoration: none; font-weight: 600; display: inline-block; }
    .btn-primary { background: #0ea5e9; color: #fff; }
  `]
})
export class DoctorsComponent {}
