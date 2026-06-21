import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { EndPoints } from '../../services/endpoints';
import { LanguageService } from '../../services/language.service';
import { parseApiError } from '../../shared/api-error.util';
import { FirebaseService } from '../../services/firebase.service';

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
  private firebaseService = inject(FirebaseService);

  // Firebase OTP verification fields
  otpCode = '';
  otpDigits = ['', '', '', '', '', ''];
  isOtpSent = signal(false);
  isPhoneVerified = signal(false);
  showOtpModal = signal(false);
  otpErrorMessage = '';
  otpLoading = false;
  sendingOtp = false;
  otpSendFailed = false;
  private confirmationResult: any = null;
  private recaptchaVerifier: any = null;

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
  errorField = '';
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

    // Pre-initialize reCAPTCHA so it's ready when the user clicks Next
    setTimeout(() => {
      try {
        if (!this.recaptchaVerifier) {
          this.recaptchaVerifier = this.firebaseService.createRecaptchaVerifier('recaptcha-container');
          // Render it silently in the background
          this.recaptchaVerifier.render().catch(() => {
            this.recaptchaVerifier = null; // reset if it fails
          });
        }
      } catch (e) {
        this.recaptchaVerifier = null;
      }
    }, 500);
  }

  onPhoneBlur() {
    this.isPhoneVerified.set(false);
    this.isOtpSent.set(false);
  }

  nextStep() {
    this.errorMessage = '';
    this.errorField = '';
    document.querySelectorAll('.has-error').forEach(el => el.classList.remove('has-error'));

    if (this.currentStep() === 1) {
      // Validate all Step 1 fields except phone verification
      const stepOneError = this.validateStepOneWithoutPhone();
      if (stepOneError) {
        this.errorMessage = stepOneError;
        this.scrollToErrorField();
        return;
      }

      // If phone already verified, go to step 2 directly
      if (this.isPhoneVerified()) {
        this.currentStep.update(s => s + 1);
        return;
      }

      // Otherwise, open OTP modal and auto-send code
      this.openOtpModal();
      return;
    }

    if (this.currentStep() === 2) {
      const stepTwoError = this.validateStepTwo();
      if (stepTwoError) {
        this.errorMessage = stepTwoError;
        this.scrollToErrorField();
        return;
      }
    }

    if (this.currentStep() < this.totalSteps) {
      this.currentStep.update(s => s + 1);
    }
  }

  openOtpModal() {
    this.showOtpModal.set(true);
    this.otpCode = '';
    this.otpDigits = ['', '', '', '', '', ''];
    this.otpErrorMessage = '';
    this.otpSendFailed = false;
    if (!this.isOtpSent()) {
      this.sendOtp();
    }
  }

  closeOtpModal() {
    this.showOtpModal.set(false);
    this.otpErrorMessage = '';
  }

  async confirmAndProceed() {
    await this.verifyOtp();
    if (this.isPhoneVerified()) {
      this.showOtpModal.set(false);
      this.currentStep.update(s => s + 1);
    }
  }

  onDigitInput(event: Event, index: number) {
    const input = event.target as HTMLInputElement;
    const value = input.value;
    
    // Allow only single numeric character
    this.otpDigits[index] = value.replace(/[^0-9]/g, '');
    
    if (this.otpDigits[index] && index < 5) {
      const nextInput = input.nextElementSibling as HTMLInputElement;
      if (nextInput) {
        nextInput.focus();
        nextInput.select();
      }
    }
    
    this.otpCode = this.otpDigits.join('');
    if (this.otpCode.length === 6) {
      this.confirmAndProceed();
    }
  }

  onDigitKeydown(event: KeyboardEvent, index: number) {
    const input = event.target as HTMLInputElement;
    
    if (event.key === 'Backspace') {
      if (!this.otpDigits[index] && index > 0) {
        this.otpDigits[index - 1] = '';
        const prevInput = input.previousElementSibling as HTMLInputElement;
        if (prevInput) {
          prevInput.focus();
          prevInput.select();
        }
        event.preventDefault();
      } else {
        this.otpDigits[index] = '';
      }
      this.otpCode = this.otpDigits.join('');
    }
  }

  onOtpPaste(event: ClipboardEvent) {
    event.preventDefault();
    const pastedData = event.clipboardData?.getData('text') || '';
    const cleanDigits = pastedData.replace(/[^0-9]/g, '').substring(0, 6).split('');
    
    for (let i = 0; i < 6; i++) {
      this.otpDigits[i] = cleanDigits[i] || '';
    }
    
    this.otpCode = this.otpDigits.join('');
    
    // Focus appropriate input box
    const inputs = document.querySelectorAll('.otp-digit-box');
    const targetIndex = Math.min(cleanDigits.length, 5);
    const targetInput = inputs[targetIndex] as HTMLInputElement;
    if (targetInput) {
      targetInput.focus();
    }

    if (this.otpCode.length === 6) {
      this.confirmAndProceed();
    }
  }

  prevStep() {
    if (this.currentStep() > 1) {
      this.errorMessage = '';
      this.errorField = '';
      document.querySelectorAll('.has-error').forEach(el => el.classList.remove('has-error'));
      this.currentStep.update(s => s - 1);
    }
  }

  onSubmit() {
    this.errorMessage = '';
    this.errorField = '';
    document.querySelectorAll('.has-error').forEach(el => el.classList.remove('has-error'));

    if (!this.agreedToTerms) {
      this.errorMessage = this.language.translate('mustAgreeTerms');
      this.errorField = 'terms';
      this.scrollToErrorField();
      return;
    }

    const stepOneError = this.validateStepOne();
    if (stepOneError) {
      this.errorMessage = stepOneError;
      this.currentStep.set(1);
      this.scrollToErrorField();
      return;
    }

    const stepTwoError = this.validateStepTwo();
    if (stepTwoError) {
      this.errorMessage = stepTwoError;
      this.currentStep.set(2);
      this.scrollToErrorField();
      return;
    }

    if (this.role() === 'Doctor') {
      const doctorError = this.validateDoctorStep();
      if (doctorError) {
        this.errorMessage = doctorError;
        this.scrollToErrorField();
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

    if (message.includes('email')) {
      this.currentStep.set(2);
      this.errorField = 'email';
    } else if (message.includes('password')) {
      this.currentStep.set(2);
      this.errorField = 'password';
    } else if (message.includes('license')) {
      this.currentStep.set(3);
      this.errorField = 'licenseNumber';
    } else if (message.includes('specialization')) {
      this.currentStep.set(3);
      this.errorField = 'specialization';
    } else if (message.includes('department')) {
      this.currentStep.set(3);
      this.errorField = 'departmentId';
    } else if (message.includes('first name') || message.includes('firstname')) {
      this.currentStep.set(1);
      this.errorField = 'firstName';
    } else if (message.includes('last name') || message.includes('lastname')) {
      this.currentStep.set(1);
      this.errorField = 'lastName';
    } else if (message.includes('national id') || message.includes('nationalid')) {
      this.currentStep.set(1);
      this.errorField = 'nationalID';
    } else if (message.includes('birth')) {
      this.currentStep.set(1);
      this.errorField = 'birthDate';
    } else if (message.includes('phone')) {
      this.currentStep.set(1);
      this.errorField = 'phone';
    } else {
      this.errorField = '';
    }

    this.scrollToErrorField();
  }

  private scrollToErrorField(): void {
    document.querySelectorAll('.has-error').forEach(el => el.classList.remove('has-error'));

    // Highlight all invalid required fields in the current step
    const invalidFields = this.getInvalidFieldsForCurrentStep();
    setTimeout(() => {
      invalidFields.forEach(fieldName => {
        const el = document.querySelector(`[name="${fieldName}"]`) as HTMLElement;
        if (el) {
          el.classList.add('has-error');
        }
      });

      // Scroll and focus on the primary error field
      if (this.errorField) {
        const primaryEl = document.querySelector(`[name="${this.errorField}"]`) as HTMLElement;
        if (primaryEl) {
          primaryEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
          primaryEl.focus();
        }
      }

      // Scroll error message into view
      const errorMsg = document.querySelector('.error-msg') as HTMLElement;
      if (errorMsg) {
        errorMsg.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }, 150);
  }

  private getInvalidFieldsForCurrentStep(): string[] {
    const invalid: string[] = [];
    if (this.currentStep() === 1) {
      if (!this.firstName.trim()) invalid.push('firstName');
      if (!this.lastName.trim()) invalid.push('lastName');
      if (!this.nationalID.trim() || this.nationalID.trim().length !== 14) invalid.push('nationalID');
      if (!this.birthDate) invalid.push('birthDate');
    } else if (this.currentStep() === 2) {
      if (!this.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email.trim())) invalid.push('email');
      if (!this.password || this.password.length < 8 || !/\d/.test(this.password)) invalid.push('password');
      if (!this.confirmPassword || this.password !== this.confirmPassword) invalid.push('confirmPassword');
    } else if (this.currentStep() === 3 && this.role() === 'Doctor') {
      if (!this.licenseNumber.trim()) invalid.push('licenseNumber');
      if (!this.specialization.trim()) invalid.push('specialization');
      if (Number(this.departmentId) <= 0) invalid.push('departmentId');
    }
    return invalid;
  }

  private validateStepOneWithoutPhone(): string {
    if (!this.firstName.trim()) { this.errorField = 'firstName'; return this.language.translate('pleaseFillAllRequiredFields') + ' (First Name)'; }
    if (!this.lastName.trim()) { this.errorField = 'lastName'; return this.language.translate('pleaseFillAllRequiredFields') + ' (Last Name)'; }
    if (!this.nationalID.trim()) { this.errorField = 'nationalID'; return this.language.translate('pleaseFillAllRequiredFields') + ' (National ID)'; }
    if (!this.birthDate) { this.errorField = 'birthDate'; return this.language.translate('pleaseFillAllRequiredFields') + ' (Birth Date)'; }
    if (this.nationalID.trim().length !== 14) { this.errorField = 'nationalID'; return 'National ID must be exactly 14 digits. (Step 1)'; }
    if (!this.phone.trim()) { this.errorField = 'phone'; return 'Phone number is required. (Step 1)'; }
    return '';
  }

  private validateStepOne(): string {
    const base = this.validateStepOneWithoutPhone();
    if (base) return base;
    if (!this.isPhoneVerified()) {
      this.errorField = 'phone';
      return 'Please verify your phone number using the verification code first.';
    }
    return '';
  }

  private validateStepTwo(): string {
    if (!this.email.trim()) { this.errorField = 'email'; return this.language.translate('pleaseFillAllRequiredFields') + ' (Email)'; }
    if (!this.password) { this.errorField = 'password'; return this.language.translate('pleaseFillAllRequiredFields') + ' (Password)'; }
    if (!this.confirmPassword) { this.errorField = 'confirmPassword'; return this.language.translate('pleaseFillAllRequiredFields') + ' (Confirm Password)'; }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email.trim())) {
      this.errorField = 'email';
      return 'Please enter a valid email address. (Step 2)';
    }

    if (this.password !== this.confirmPassword) {
      this.errorField = 'confirmPassword';
      return this.language.translate('passwordsDoNotMatch');
    }

    if (this.password.length < 8) {
      this.errorField = 'password';
      return this.language.translate('passwordMin8');
    }

    if (!/\d/.test(this.password)) {
      this.errorField = 'password';
      return 'Password must contain at least one number. (Step 2)';
    }

    return '';
  }

  private validateDoctorStep(): string {
    if (this.departments().length === 0) {
      return 'Could not load departments. Check that the API is running, then refresh this page.';
    }

    if (!this.licenseNumber.trim()) { this.errorField = 'licenseNumber'; return this.language.translate('pleaseFillAllRequiredFields') + ' (License Number)'; }
    if (!this.specialization.trim()) { this.errorField = 'specialization'; return this.language.translate('pleaseFillAllRequiredFields') + ' (Specialization)'; }
    if (Number(this.departmentId) <= 0) { this.errorField = 'departmentId'; return this.language.translate('pleaseFillAllRequiredFields') + ' (Department)'; }

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

  // Firebase OTP Flow
  async sendOtp() {
    this.otpErrorMessage = '';
    this.otpSendFailed = false;
    this.sendingOtp = true;

    const rawPhone = this.phone.trim();
    if (!rawPhone) {
      this.otpErrorMessage = 'Please enter a phone number first.';
      this.sendingOtp = false;
      this.otpSendFailed = true;
      return;
    }

    // Format Egypt number starting with 01 to international +20...
    let formattedPhone = rawPhone;
    if (formattedPhone.startsWith('01') && formattedPhone.length === 11) {
      formattedPhone = '+2' + formattedPhone;
    } else if (formattedPhone.startsWith('1') && formattedPhone.length === 10) {
      formattedPhone = '+20' + formattedPhone;
    } else if (!formattedPhone.startsWith('+')) {
      this.otpErrorMessage = 'Please enter phone number in international format starting with + (e.g. +201xxxxxxxxx).';
      this.sendingOtp = false;
      this.otpSendFailed = true;
      return;
    }

    try {
      // Reuse the pre-initialized verifier, or create a new one if needed
      if (!this.recaptchaVerifier) {
        this.recaptchaVerifier = this.firebaseService.createRecaptchaVerifier('recaptcha-container');
      }

      this.confirmationResult = await this.firebaseService.sendOtp(formattedPhone, this.recaptchaVerifier);
      this.isOtpSent.set(true);
      this.showOtpModal.set(true);
      this.sendingOtp = false;
      this.otpSendFailed = false;
      this.errorMessage = '';
    } catch (err: any) {
      console.error(err);
      this.otpErrorMessage = err.message || 'Failed to send SMS code. Please verify the phone number and format.';
      this.sendingOtp = false;
      this.otpSendFailed = true;
      // Reset reCAPTCHA so user can try again
      if (this.recaptchaVerifier) {
        try { this.recaptchaVerifier.clear(); } catch(e) {}
        this.recaptchaVerifier = null;
      }
    }
  }

  async verifyOtp() {
    this.otpErrorMessage = '';
    this.otpLoading = true;

    if (!this.otpCode || this.otpCode.length < 6) {
      this.otpErrorMessage = 'Please enter a valid 6-digit verification code.';
      this.otpLoading = false;
      return;
    }

    if (!this.confirmationResult) {
      this.otpErrorMessage = 'Verification context is missing. Try sending the code again.';
      this.otpLoading = false;
      return;
    }

    try {
      const result = await this.confirmationResult.confirm(this.otpCode);
      this.isPhoneVerified.set(true);
      this.otpLoading = false;
      this.otpErrorMessage = '';
      this.errorMessage = '';
      
      // Clean up reCAPTCHA verifier widget
      if (this.recaptchaVerifier) {
        try { this.recaptchaVerifier.clear(); } catch(e) {}
        this.recaptchaVerifier = null;
      }
    } catch (err: any) {
      console.error(err);
      this.otpErrorMessage = 'Invalid or expired verification code.';
      this.otpLoading = false;
    }
  }
}