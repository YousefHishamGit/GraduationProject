import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { EndPoints } from '../../services/endpoints';

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

  // Step
  currentStep = signal(1);
  totalSteps = 3;

  // Personal
  firstName = '';
  lastName = '';
  nationalID = '';
  birthDate = '';
  gender = 0;
  phone = '';
  address = '';

  // Account
  email = '';
  password = '';
  confirmPassword = '';
  showPassword = false;
  showConfirm = false;

  // Medical
  bloodType = '';
  allergies = '';
  medicalHistory = '';
  emergencyContactName = '';
  emergencyContactPhone = '';

  // Terms
  agreedToTerms = false;

  // UI
  errorMessage = '';
  isLoading = false;

  bloodTypes = [
    { value: 0, label: 'A+' },
    { value: 1, label: 'A-' },
    { value: 2, label: 'B+' },
    { value: 3, label: 'B-' },
    { value: 4, label: 'O+' },
    { value: 5, label: 'O-' },
    { value: 6, label: 'AB+' },
    { value: 7, label: 'AB-' }
  ];

  nextStep() {
    this.errorMessage = '';

    if (this.currentStep() === 1) {
      if (!this.firstName || !this.lastName || !this.nationalID || !this.birthDate) {
        this.errorMessage = 'Please fill all required fields';
        return;
      }
    }

    if (this.currentStep() === 2) {
      if (!this.email || !this.password || !this.confirmPassword) {
        this.errorMessage = 'Please fill all required fields';
        return;
      }
      if (this.password !== this.confirmPassword) {
        this.errorMessage = 'Passwords do not match';
        return;
      }
      if (this.password.length < 8) {
        this.errorMessage = 'Password must be at least 8 characters';
        return;
      }
    }

    if (this.currentStep() < this.totalSteps) {
      this.currentStep.update(s => s + 1);
    }
  }

  prevStep() {
    if (this.currentStep() > 1) {
      this.currentStep.update(s => s - 1);
    }
  }

  onSubmit() {
    this.errorMessage = '';

    if (!this.agreedToTerms) {
      this.errorMessage = 'You must agree to the terms';
      return;
    }

    this.isLoading = true;

    const dto = {
      firstName: this.firstName,
      lastName: this.lastName,
      nationalID: this.nationalID,
      birthDate: this.birthDate,
      gender: Number(this.gender),
      phone: this.phone || '00000000000',
      address: this.address || 'N/A',
      email: this.email,
      password: this.password,
      bloodType: this.bloodType ? Number(this.bloodType) : undefined,
      allergies: this.allergies || undefined,
      medicalHistory: this.medicalHistory || undefined,
      emergencyContactName: this.emergencyContactName || undefined,
      emergencyContactPhone: this.emergencyContactPhone || undefined
    };

    this.endpoint.auth.registerPatient(dto).subscribe({
      next: (res) => {
        localStorage.setItem('token', res.token);
        localStorage.setItem('currentUser', JSON.stringify(res));
        this.router.navigate(['/patient-dashboard']);
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Registration failed. Please try again.';
        this.isLoading = false;
      }
    });
  }

  getStepProgress(): number {
    return (this.currentStep() / this.totalSteps) * 100;
  }
}