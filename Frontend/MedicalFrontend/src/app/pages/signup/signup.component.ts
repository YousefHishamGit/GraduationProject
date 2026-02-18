import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent {
  username = signal<string>('');
  email = signal<string>('');
  password = signal<string>('');
  confirmPassword = signal<string>('');
  agreedToTerms = signal<boolean>(false);
  errorMessage = signal<string>('');

  constructor(private router: Router) {}

  onSubmit() {
    this.errorMessage.set('');

    if (this.password() !== this.confirmPassword()) {
      this.errorMessage.set('Passwords do not match');
      return;
    }

    if (!this.agreedToTerms()) {
      this.errorMessage.set('You must agree to the terms and conditions');
      return;
    }

    const userData = {
      username: this.username(),
      email: this.email(),
      createdAt: new Date().toISOString()
    };

    localStorage.setItem('pendingUser', JSON.stringify(userData));

    this.router.navigate(['/registration-confirmation']);
  }
}
