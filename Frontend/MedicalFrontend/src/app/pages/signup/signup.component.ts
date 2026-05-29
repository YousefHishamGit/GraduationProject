import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { EndPoints } from '../../services/endpoints';
import { LanguageService } from '../../services/language.service';
import { parseApiError } from '../../shared/api-error.util';

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
  selectedImage: File | null = null;
  imagePreviewUrl: string | null = null;

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
      const stepOneError = this.validateStepOne();
      if (stepOneError) {
        this.errorMessage = stepOneError;
        return;
      }
    }

    if (this.currentStep() === 2) {
      const stepTwoError = this.validateStepTwo();
      if (stepTwoError) {
        this.errorMessage = stepTwoError;
        return;
      }
    }

    if (this.currentStep() < this.totalSteps) {
      this.currentStep.update(s => s + 1);
    }
  }

  prevStep() {
    if (this.currentStep() > 1) {
      this.errorMessage = '';
      this.currentStep.update(s => s - 1);
    }
  }

  onSubmit() {
    this.errorMessage = '';

    if (!this.agreedToTerms) {
      this.errorMessage = this.language.translate('mustAgreeTerms');
      return;
    }

    const stepOneError = this.validateStepOne();
    if (stepOneError) {
      this.errorMessage = stepOneError;
      this.currentStep.set(1);
      return;
    }

    const stepTwoError = this.validateStepTwo();
    if (stepTwoError) {
      this.errorMessage = stepTwoError;
      this.currentStep.set(2);
      return;
    }

    if (this.role() === 'Doctor') {
      const doctorError = this.validateDoctorStep();
      if (doctorError) {
        this.errorMessage = doctorError;
        return;
      }
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
        emergencyContactPhone: this.emergencyContactPhone || undefined,
        image: this.selectedImage || undefined
      };

      this.endpoint.auth.registerPatient(dto).subscribe({
        next: (res) => {
          this.isLoading = false;
          localStorage.setItem('token', res.token);
          localStorage.setItem('currentUser', JSON.stringify(res));
          this.router.navigate(['/patient-dashboard']);
        },
        error: (err) => {
          this.errorMessage = parseApiError(err, this.language.translate('registrationFailedTryAgain'));
          this.isLoading = false;
          this.focusStepForError();
        }
      });
    } else {
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
        bio: this.bio || '',
        image: this.selectedImage || undefined
      };

      this.endpoint.auth.registerDoctor(dto as any).subscribe({
        next: (res) => {
          this.isLoading = false;
          alert('Registration successful! Your account is pending admin approval. You will be able to log in once the administrator confirms it.');
          this.router.navigate(['/login']);
        },
        error: (err) => {
          this.errorMessage = parseApiError(err, this.language.translate('registrationFailedTryAgain'));
          this.isLoading = false;
          this.focusStepForError();
        }
      });
    }
  }

  private focusStepForError(): void {
    const message = this.errorMessage.toLowerCase();

    if (message.includes('email') || message.includes('password')) {
      this.currentStep.set(2);
      return;
    }

    if (message.includes('license') || message.includes('specialization') || message.includes('department')) {
      this.currentStep.set(3);
      return;
    }

    if (message.includes('first name') || message.includes('last name') || message.includes('national id') || message.includes('birth')) {
      this.currentStep.set(1);
    }
  }

  private validateStepOne(): string {
    if (!this.firstName.trim() || !this.lastName.trim() || !this.nationalID.trim() || !this.birthDate) {
      return this.language.translate('pleaseFillAllRequiredFields') + ' (Step 1: Personal Info)';
    }

    if (this.nationalID.trim().length !== 14) {
      return 'National ID must be exactly 14 digits. (Step 1)';
    }

    return '';
  }

  private validateStepTwo(): string {
    if (!this.email.trim() || !this.password || !this.confirmPassword) {
      return this.language.translate('pleaseFillAllRequiredFields') + ' (Step 2: Account Setup)';
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email.trim())) {
      return 'Please enter a valid email address. (Step 2)';
    }

    if (this.password !== this.confirmPassword) {
      return this.language.translate('passwordsDoNotMatch');
    }

    if (this.password.length < 8) {
      return this.language.translate('passwordMin8');
    }

    if (!/\d/.test(this.password)) {
      return 'Password must contain at least one number. (Step 2)';
    }

    return '';
  }

  private validateDoctorStep(): string {
    if (this.departments().length === 0) {
      return 'Could not load departments. Check that the API is running, then refresh this page.';
    }

    if (!this.licenseNumber.trim() || !this.specialization.trim() || Number(this.departmentId) <= 0) {
      return this.language.translate('pleaseFillAllRequiredFields') + ' (Step 3: License, Specialization, Department)';
    }

    return '';
  }

  getStepProgress(): number {
    return (this.currentStep() / this.totalSteps) * 100;
  }

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) {
      this.selectedImage = null;
      this.imagePreviewUrl = null;
      return;
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      this.errorMessage = 'Please upload a JPG, PNG, or WEBP image.';
      this.selectedImage = null;
      this.imagePreviewUrl = null;
      input.value = '';
      return;
    }

    this.selectedImage = file;
    this.errorMessage = '';
    this.imagePreviewUrl = URL.createObjectURL(file);
  }
}