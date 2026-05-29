import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable()
export abstract class BaseEndpoint {
  protected http = inject(HttpClient);
  protected readonly apiUrl = environment.apiUrl;

  protected getBaseUrl(endpoint: string): string {
    return `${this.apiUrl}/${endpoint}`;
  }

  private readonly formKeyMap: Record<string, string> = {
    firstName: 'FirstName',
    lastName: 'LastName',
    nationalID: 'NationalID',
    birthDate: 'BirthDate',
    gender: 'Gender',
    phone: 'Phone',
    address: 'Address',
    email: 'Email',
    password: 'Password',
    bloodType: 'BloodType',
    allergies: 'Allergies',
    medicalHistory: 'MedicalHistory',
    emergencyContactName: 'EmergencyContactName',
    emergencyContactPhone: 'EmergencyContactPhone',
    licenseNumber: 'LicenseNumber',
    specialization: 'Specialization',
    departmentId: 'DepartmentId',
    yearsOfExperience: 'YearsOfExperience',
    consultationFee: 'ConsultationFee',
    hireDate: 'HireDate',
    bio: 'Bio',
    image: 'Image',
  };

  protected toFormData(obj: Record<string, unknown>): FormData {
    const formData = new FormData();

    Object.entries(obj).forEach(([key, value]) => {
      if (value === undefined || value === null || value === '') {
        return;
      }

      const formKey = this.formKeyMap[key] ?? key;

      if (value instanceof Blob) {
        formData.append(formKey, value);
        return;
      }

      formData.append(formKey, String(value));
    });

    return formData;
  }
}