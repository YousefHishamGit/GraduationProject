import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { EndPoints } from '../../services/endpoints';
import { AuthService } from '../../services/auth.service';
import { LanguageService } from '../../services/language.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  private endpoint = inject(EndPoints);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private authService = inject(AuthService);
  public language = inject(LanguageService);

  email = '';
  password = '';
  remember = false;
  showPassword = false;
  errorMessage = '';
  isLoading = false;

  constructor() {
    if (this.authService.isLoggedIn()) {
      const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
      if (returnUrl) {
        this.router.navigateByUrl(returnUrl);
      } else {
        this.redirectByRole(this.authService.getRole() || '');
      }
    }
  }

  togglePassword() { this.showPassword = !this.showPassword; }

  onSubmit() {
    if (!this.email || !this.password) {
      this.errorMessage = 'Please fill in all fields';
      return;
    }

    this.errorMessage = '';
    this.isLoading = true;

    const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');

    this.endpoint.auth.login({ email: this.email, password: this.password }).subscribe({
      next: (res) => {
        localStorage.setItem('token', res.token);
        localStorage.setItem('currentUser', JSON.stringify(res));
        if (returnUrl) {
          this.router.navigateByUrl(returnUrl);
        } else {
          this.redirectByRole(res.role);
        }
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Invalid email or password.';
        this.isLoading = false;
      }
    });
  }

  private redirectByRole(role: string) {
    const routes: Record<string, string> = {
      Admin: '/admin-dashboard',
      Doctor: '/doctor-dashboard',
      Patient: '/patient-dashboard'
    };
    this.router.navigate([routes[role] || '/']);
  }
}