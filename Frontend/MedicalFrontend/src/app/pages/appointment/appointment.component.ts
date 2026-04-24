import { Component, signal, computed, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { EndPoints } from '../../Services/endpoints';

interface Doctor {
  id: number;
  name: string;
  specialization: string;
}

interface Department {
  id: string;
  name: string;
  doctors: Doctor[];
}

@Component({
  selector: 'app-appointment',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './appointment.component.html',
  styleUrls: ['./appointment.component.css']
})
export class AppointmentComponent implements OnInit {
  private endpoint = inject(EndPoints);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  currentStep = signal<number>(1);
  selectedDepartment = signal<string>('');
  
  formData = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    allergies: '',
    bloodType: '',
    emergencyContactPhone: '',
    medicalHistory: '',
    age: null as number | null,
    doctorId: '',
    appointmentDate: '',
    message: ''
  };

  departments = signal<Department[]>([]);

  availableDoctors = signal<Doctor[]>([]);

  minDate = computed(() => new Date().toISOString().split('T')[0]);

  ngOnInit() {
    this.loadDepartments();
    
    this.route.queryParams.subscribe(params => {
      if (params['doctorId']) {
        this.formData.doctorId = params['doctorId'];
      }
      if (params['department']) {
        this.selectedDepartment.set(params['department']);
        this.onDepartmentChange(params['department']);
      }
    });
  }

  loadDepartments() {
    this.endpoint.departments.getAll().subscribe({
      next: (data) => {
        this.departments.set(data.map(d => ({
          id: d.id.toString(),
          name: d.departmentName,
          doctors: []
        })));
      },
      error: (err) => console.error('Error loading departments', err)
    });
  }

  onDepartmentChange(value: string) {
    this.selectedDepartment.set(value);
    this.formData.doctorId = '';
    
    if (value) {
      this.endpoint.doctors.getByDepartment(parseInt(value)).subscribe({
        next: (data) => {
          this.availableDoctors.set(data.map(d => ({
            id: d.id,
            name: d.fullName,
            specialization: d.specialization
          })));
        },
        error: (err) => console.error('Error loading doctors', err)
      });
    } else {
      this.availableDoctors.set([]);
    }
  }

  getStepLabel(step: number): string {
    const labels = ['Personal Info', 'Appointment Details', 'Confirmation'];
    return labels[step - 1];
  }

  getDepartmentName(id: string): string {
    const dept = this.departments().find(d => d.id === id);
    return dept?.name || 'Not selected';
  }

  getDoctorName(id: string): string {
    const doc = this.availableDoctors().find(d => d.id.toString() === id);
    return doc?.name || 'Not selected';
  }

  nextStep() {
    if (this.validateStep()) {
      this.currentStep.update(step => Math.min(step + 1, 3));
    }
  }

  prevStep() {
    this.currentStep.update(step => Math.max(step - 1, 1));
  }

  validateStep(): boolean {
    if (this.currentStep() === 1) {
      return !!(this.formData.firstName && this.formData.email && this.formData.phone);
    }
    if (this.currentStep() === 2) {
      return !!(this.selectedDepartment() && this.formData.doctorId && this.formData.appointmentDate);
    }
    return true;
  }

  onSubmit() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const patientId = currentUser.id || 1;

    const dto = {
      patientId: patientId,
      doctorId: parseInt(this.formData.doctorId),
      timeSlotId: 1,
      appointmentDate: this.formData.appointmentDate,
      type: 'Routine',
      notes: this.formData.message
    };

    this.endpoint.appointments.create(dto).subscribe({
      next: (res) => {
        console.log('Appointment created successfully', res);
        this.router.navigate(['/appointment-success']);
      },
      error: (err) => {
        console.error('Error creating appointment', err);
        alert('Failed to book appointment. Please try again.');
      }
    });
  }
}
