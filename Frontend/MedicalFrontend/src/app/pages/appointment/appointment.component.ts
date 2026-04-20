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
  isSuccess = signal<boolean>(false);
  selectedTimeSlot = signal<string>('');

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
      id: 'cardiology',
      name: 'Cardiology',
      doctors: [
        { id: 1, name: 'Dr. Ahmed Hassan', specialization: 'Cardiologist' },
        { id: 2, name: 'Dr. Mohamed Chen', specialization: 'Heart Surgeon' }
      ]
    },
    {
      id: 'neurology',
      name: 'Neurology',
      doctors: [
        { id: 3, name: 'Dr. Sara Mohamed', specialization: 'Neurologist' },
        { id: 4, name: 'Dr. Lisa Martinez', specialization: 'Neurosurgeon' }
      ]
    },
    {
      id: 'orthopedics',
      name: 'Orthopedics',
      doctors: [
        { id: 5, name: 'Dr. Khaled Ali', specialization: 'Orthopedic Surgeon' },
        { id: 6, name: 'Dr. Emily Davis', specialization: 'Sports Medicine' }
      ]
    },
    {
      id: 'pediatrics',
      name: 'Pediatrics',
      doctors: [
        { id: 7, name: 'Dr. Jennifer Lee', specialization: 'Pediatrician' },
        { id: 8, name: 'Dr. Thomas Clark', specialization: 'Child Specialist' }
      ]
    },
    {
      id: 'emergency',
      name: 'Emergency (Urgent)',
      doctors: [
        { id: 99, name: 'Emergency Response Team', specialization: 'ER Specialist' }
      ]
    }
  ]);

  isEmergency = computed(() => this.selectedDepartment() === 'emergency');

  availableDoctors = computed(() => {
    const dept = this.departments().find(d => d.id === this.selectedDepartment());
    return dept ? dept.doctors : [];
  });

  minDate = computed(() => new Date().toISOString().split('T')[0]);

  constructor(private router: Router, private route: ActivatedRoute) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      // Prioritize department query param for emergency link
      if (params['department']) {
        const deptId = params['department'].toLowerCase();
        this.selectedDepartment.set(deptId);
        
        // Auto-select ER team if emergency
        if (deptId === 'emergency') {
          this.formData.doctorId = '99';
          this.formData.appointmentDate = new Date().toISOString().split('T')[0];
          this.selectedTimeSlot.set('Immediate');
        }
      }

      if (params['doctorId']) {
        this.formData.doctorId = params['doctorId'];
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

  selectTimeSlot(slot: string) {
    this.selectedTimeSlot.set(slot);
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

  confirmBooking() {
    this.onSubmit();
    this.isSuccess.set(true);
  }

  resetForm() {
    this.isSuccess.set(false);
    this.formData.firstName = '';
    this.formData.lastName = '';
    this.formData.email = '';
    // reset other fields if needed
  }

  onSubmit() {
    const appointments = JSON.parse(localStorage.getItem('appointments') || '[]');
    appointments.push({
      ...this.formData,
      id: Date.now(),
      departmentId: this.selectedDepartment(),
      timeSlot: this.selectedTimeSlot(),
      status: 'Scheduled',
      createdAt: new Date().toISOString()
    });
    localStorage.setItem('appointments', JSON.stringify(appointments));
    // Navigation removed to show the success state in-place as per design
  }
}
