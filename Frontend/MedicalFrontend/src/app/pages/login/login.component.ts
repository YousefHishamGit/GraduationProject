import { Component, signal, inject } from '@angular/core';
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

  email = signal<string>('');
  password = signal<string>('');
  remember = signal<boolean>(false);
  showPassword = signal<boolean>(false);
  errorMessage = signal<string>('');

  constructor() {
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
      this.router.navigate(['/']);
    }
  }

  togglePassword() {
    this.showPassword.update(v => !v);
  }

  onSubmit() {
    const emailVal = this.email();
    const passwordVal = this.password();
    
    if (!emailVal || !passwordVal) {
      this.errorMessage.set('Please fill in all fields');
      return;
    }

    this.errorMessage.set('');

    this.endpoint.auth.login({ email: emailVal, password: passwordVal }).subscribe({
      next: (response) => {
        console.log('Login successful', response);
        localStorage.setItem('currentUser', JSON.stringify(response));
        localStorage.setItem('token', response.token);

        const returnUrl = localStorage.getItem('returnUrl') || '/';
        localStorage.removeItem('returnUrl');
        this.router.navigate([returnUrl]);
      },
      error: (err) => {
        console.error('Login failed', err);
        this.errorMessage.set(err.error?.message || 'Invalid email or password. Please try again.');
      }
    });
  }
}
