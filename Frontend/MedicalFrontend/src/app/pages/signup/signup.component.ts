import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { EndPoints } from '../../services/endpoints';
import { LanguageService } from '../../services/language.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit {
  private endpoint = inject(EndPoints);
  private router = inject(Router);
  public language = inject(LanguageService);

  // Role Choice
  role = signal<'Patient' | 'Doctor'>('Patient');
  departments = signal<any[]>([]);

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

  // Medical (Patient)
  bloodType = '';
  allergies = '';
  medicalHistory = '';
  emergencyContactName = '';
  emergencyContactPhone = '';

  // Doctor Details
  licenseNumber = '';
  specialization = '';
  departmentId = 0;
  yearsOfExperience = 0;
  consultationFee = 0;
  bio = '';

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

  ngOnInit() {
    this.endpoint.departments.getAll().subscribe({
      next: (depts) => {
        this.departments.set(depts);
      },
      error: () => {}
    });
  }

  nextStep() {
    this.errorMessage = '';

    if (this.currentStep() === 1) {
      if (!this.firstName || !this.lastName || !this.nationalID || !this.birthDate) {
        this.errorMessage = this.language.translate('pleaseFillAllRequiredFields');
        return;
      }
    }

    if (this.currentStep() === 2) {
      if (!this.email || !this.password || !this.confirmPassword) {
        this.errorMessage = this.language.translate('pleaseFillAllRequiredFields');
        return;
      }
      if (this.password !== this.confirmPassword) {
        this.errorMessage = this.language.translate('passwordsDoNotMatch');
        return;
      }
      if (this.password.length < 8) {
        this.errorMessage = this.language.translate('passwordMin8');
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
      this.errorMessage = this.language.translate('mustAgreeTerms');
      return;
    }

    this.isLoading = true;

    if (this.role() === 'Patient') {
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
          this.errorMessage = err.error?.message || this.language.translate('registrationFailedTryAgain');
          this.isLoading = false;
        }
      });
    } else {
      // Doctor Registration
      if (!this.licenseNumber || !this.specialization || !this.departmentId) {
        this.errorMessage = this.language.translate('pleaseFillAllRequiredFields');
        this.isLoading = false;
        return;
      }

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
        licenseNumber: this.licenseNumber,
        specialization: this.specialization,
        departmentId: Number(this.departmentId),
        yearsOfExperience: Number(this.yearsOfExperience || 0),
        consultationFee: Number(this.consultationFee || 0),
        hireDate: new Date().toISOString().split('T')[0],
        bio: this.bio || ''
      };

      this.endpoint.auth.registerDoctor(dto as any).subscribe({
        next: (res) => {
          this.isLoading = false;
          alert('Registration successful! Your account is pending admin approval. You will be able to log in once the administrator confirms it.');
          this.router.navigate(['/login']);
        },
        error: (err) => {
          this.errorMessage = err.error?.message || 'Registration failed. Try again.';
          this.isLoading = false;
        }
      });
    }
  }

  getStepProgress(): number {
    return (this.currentStep() / this.totalSteps) * 100;
  }
}