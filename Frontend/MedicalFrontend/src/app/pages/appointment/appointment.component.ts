import { Component, signal, computed, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { EndPoints } from '../../Services/endpoints';
import { AuthService } from '../../Services/auth.service';

interface Doctor {
  id: number;
  name: string;
  specialization: string;
}

interface TimeSlot {
  id: number;
  slotStart: string;
  slotEnd: string;
  isBooked: boolean;
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
  private authService = inject(AuthService);

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
  availableTimeSlots = signal<TimeSlot[]>([]);
  selectedTimeSlotId = signal<string>('');

  minDate = computed(() => new Date().toISOString().split('T')[0]);

  ngOnInit() {
    this.loadDepartments();
    
    this.route.queryParams.subscribe(params => {
      if (params['doctorId']) {
        this.formData.doctorId = params['doctorId'];
      }
      if (params['timeSlotId']) {
        this.selectedTimeSlotId.set(params['timeSlotId']);
      }
      if (params['department']) {
        this.selectedDepartment.set(params['department']);
        this.onDepartmentChange(params['department']);
      }
      this.loadTimeSlotsIfReady();
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
          this.loadTimeSlotsIfReady();
        },
        error: (err) => console.error('Error loading doctors', err)
      });
    } else {
      this.availableDoctors.set([]);
      this.availableTimeSlots.set([]);
      this.selectedTimeSlotId.set('');
    }
  }

  onDoctorChange() {
    this.loadTimeSlotsIfReady();
  }

  onAppointmentDateChange() {
    this.loadTimeSlotsIfReady();
  }

  private loadTimeSlotsIfReady() {
    const doctorId = Number(this.formData.doctorId);
    const date = this.formData.appointmentDate;

    if (!doctorId || !date) {
      this.availableTimeSlots.set([]);
      this.selectedTimeSlotId.set('');
      return;
    }

    this.endpoint.doctors.getAvailableTimeSlots(doctorId, date).subscribe({
      next: (slots) => {
        this.availableTimeSlots.set(slots.filter(s => !s.isBooked));
        const slotExists = slots.some(s => s.id.toString() === this.selectedTimeSlotId());
        if (!slotExists) this.selectedTimeSlotId.set('');
      },
      error: () => {
        this.availableTimeSlots.set([]);
        this.selectedTimeSlotId.set('');
      }
    });
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
      return !!(this.selectedDepartment() && this.formData.doctorId && this.formData.appointmentDate && this.selectedTimeSlotId());
    }
    return true;
  }

  onSubmit() {
    const userId = this.authService.getUserIdFromToken();
    if (!userId) {
      alert('Please login first.');
      return;
    }

    this.endpoint.patients.getByUserId(userId).subscribe({
      next: (patient) => {
        const dto = {
          patientId: patient.id,
          doctorId: parseInt(this.formData.doctorId),
          timeSlotId: parseInt(this.selectedTimeSlotId()),
          appointmentDate: this.formData.appointmentDate,
          type: 'Routine',
          notes: this.formData.message
        };

        this.endpoint.appointments.create(dto).subscribe({
          next: () => this.router.navigate(['/appointment-success']),
          error: () => alert('Failed to book appointment. Please try again.')
        });
      },
      error: () => alert('Could not load patient profile. Please login again.')
    });
  }
}
