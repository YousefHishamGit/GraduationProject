import { Component, inject } from '@angular/core';
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

  // Form fields
  firstName = '';
  lastName = '';
  email = '';
  nationalID = '';
  birthDate = '';
  address = '';
  gender = 0;
  phone = '';
  password = '';
  confirmPassword = '';
  agreedToTerms = false;

  // UI state
  errorMessage = '';
  isLoading = false;

  onSubmit() {
    this.errorMessage = '';

    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match';
      return;
    }

    if (!this.agreedToTerms) {
      this.errorMessage = 'You must agree to the terms and conditions';
      return;
    }

    const dto: RegisterPatientDto = {
      firstName: this.firstName,
      lastName: this.lastName,
      nationalID: this.nationalID,
      birthDate: this.birthDate,
      address: this.address || 'N/A',
      gender: Number(this.gender),
      email: this.email,
      password: this.password,
      phone: this.phone
    };

    this.isLoading = true;

    this.endpoint.auth.registerPatient(dto).subscribe({
      next: (response) => {
        localStorage.setItem('token', response.token);
        localStorage.setItem('currentUser', JSON.stringify(response));
        this.router.navigate(['/registration-confirmation']);
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Registration failed. Please try again.';
        this.isLoading = false;
      }
    });
  }
}