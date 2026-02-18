import { Component, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

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

  departments = signal<Department[]>([
    {
      id: '1',
      name: 'Cardiology',
      doctors: [
        { id: 1, name: 'Dr. Sarah Johnson', specialization: 'Cardiologist' },
        { id: 2, name: 'Dr. Michael Chen', specialization: 'Heart Surgeon' }
      ]
    },
    {
      id: '2',
      name: 'Neurology',
      doctors: [
        { id: 3, name: 'Dr. Robert Wilson', specialization: 'Neurologist' },
        { id: 4, name: 'Dr. Lisa Martinez', specialization: 'Neurosurgeon' }
      ]
    },
    {
      id: '3',
      name: 'Orthopedics',
      doctors: [
        { id: 5, name: 'Dr. David Brown', specialization: 'Orthopedic Surgeon' },
        { id: 6, name: 'Dr. Emily Davis', specialization: 'Sports Medicine' }
      ]
    },
    {
      id: '4',
      name: 'Pediatrics',
      doctors: [
        { id: 7, name: 'Dr. Jennifer Lee', specialization: 'Pediatrician' },
        { id: 8, name: 'Dr. Thomas Clark', specialization: 'Child Specialist' }
      ]
    }
  ]);

  availableDoctors = computed(() => {
    const dept = this.departments().find(d => d.id === this.selectedDepartment());
    return dept ? dept.doctors : [];
  });

  minDate = computed(() => new Date().toISOString().split('T')[0]);

  constructor(private router: Router, private route: ActivatedRoute) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['doctorId']) {
        this.formData.doctorId = params['doctorId'];
      }
      if (params['department']) {
        this.selectedDepartment.set(params['department']);
      }
    });
  }

  getStepLabel(step: number): string {
    const labels = ['Personal Info', 'Appointment Details', 'Confirmation'];
    return labels[step - 1];
  }

  onDepartmentChange(value: string) {
    this.selectedDepartment.set(value);
    this.formData.doctorId = '';
  }

  getDepartmentName(id: string): string {
    const dept = this.departments().find(d => d.id === id);
    return dept?.name || 'Not selected';
  }

  getDoctorName(id: string): string {
    for (const dept of this.departments()) {
      const doc = dept.doctors.find(d => d.id.toString() === id);
      if (doc) return doc.name;
    }
    return 'Not selected';
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
    const appointments = JSON.parse(localStorage.getItem('appointments') || '[]');
    appointments.push({
      ...this.formData,
      id: Date.now(),
      departmentId: this.selectedDepartment(),
      status: 'Scheduled',
      createdAt: new Date().toISOString()
    });
    localStorage.setItem('appointments', JSON.stringify(appointments));
    this.router.navigate(['/appointment-success']);
  }
}
