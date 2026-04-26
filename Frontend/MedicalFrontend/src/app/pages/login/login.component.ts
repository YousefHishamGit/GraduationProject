import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { EndPoints } from '../../Services/endpoints';

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

  email = '';
  password = '';
  remember = false;
  showPassword = false;
  errorMessage = '';
  isLoading = false;

  constructor() {
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
      this.redirectBasedOnRole(JSON.parse(currentUser).role);
    }
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  onSubmit() {
    if (!this.email || !this.password) {
      this.errorMessage = 'Please fill in all fields';
      return;
    }

    this.errorMessage = '';
    this.isLoading = true;

    this.endpoint.auth.login({
      email: this.email,
      password: this.password
    }).subscribe({
      next: (response) => {
        localStorage.setItem('token', response.token);
        localStorage.setItem('currentUser', JSON.stringify(response));
        this.redirectBasedOnRole(response.role);
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Invalid email or password.';
        this.isLoading = false;
      }
    });
  }

  private redirectBasedOnRole(role: string) {
    switch (role) {
      case 'Admin': this.router.navigate(['/admin-dashboard']); break;
      case 'Doctor': this.router.navigate(['/doctor-dashboard']); break;
      case 'Patient': this.router.navigate(['/patient-dashboard']); break;
      default: this.router.navigate(['/']);
    }
  }
}