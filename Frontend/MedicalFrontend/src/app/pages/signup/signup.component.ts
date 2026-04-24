import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { EndPoints } from '../../Services/endpoints';
import { RegisterPatientDto } from '../../interfaces/auth.interface';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent {
  private endpoint = inject(EndPoints);
  private router = inject(Router);

  username = signal<string>('');
  email = signal<string>('');
  password = signal<string>('');
  confirmPassword = signal<string>('');
  agreedToTerms = signal<boolean>(false);
  errorMessage = signal<string>('');

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

    const registrationData: RegisterPatientDto = {
      firstName: this.username().split(' ')[0] || this.username(),
      lastName: this.username().split(' ')[1] || 'User',
      nationalID: '12345678901234',
      birthDate: '2000-01-01',
      gender: 1,
      email: this.email(),
      password: this.password(),
      phone: '0123456789'
    };

    this.endpoint.auth.registerPatient(registrationData).subscribe({
      next: (response) => {
        console.log('Registration successful', response);
        localStorage.setItem('currentUser', JSON.stringify(response));
        this.router.navigate(['/registration-confirmation']);
      },
      error: (err) => {
        console.error('Registration failed', err);
        this.errorMessage.set(err.error?.message || 'Registration failed. Please try again.');
      }
    });
  }
}
