import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  email = signal<string>('');
  password = signal<string>('');
  remember = signal<boolean>(false);
  showPassword = signal<boolean>(false);
  errorMessage = signal<string>('');

  constructor(private router: Router) {
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

    const userData = {
      email: emailVal,
      name: emailVal.split('@')[0],
      role: 'Patient',
      loginTime: new Date().toISOString()
    };

    localStorage.setItem('currentUser', JSON.stringify(userData));

    const returnUrl = localStorage.getItem('returnUrl') || '/';
    localStorage.removeItem('returnUrl');

    this.router.navigate([returnUrl]);
  }
}
