import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { EndPoints } from '../../services/endpoints';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-appointment',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './appointment.component.html',
  styleUrls: ['./appointment.component.css']
})
export class AppointmentComponent implements OnInit {
  private endpoint = inject(EndPoints);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  // State
  currentStep = signal(1);
  isLoading = signal(false);
  isSubmitting = signal(false);
  successMsg = signal('');
  errorMsg = signal('');

  // Data
  departments = signal<any[]>([]);
  doctors = signal<any[]>([]);
  timeSlots = signal<any[]>([]);
  patient = signal<any>(null);

  // Filters
  searchTerm = '';
  selectedDeptFilter = '';

  // Selections
  selectedDoctorId = signal<number | null>(null);
  selectedDoctor = signal<any>(null);
  selectedSlotId = signal<number | null>(null);
  selectedSlot = signal<any>(null);
  selectedDate = signal('');
  appointmentType = signal<'InPerson' | 'Online'>('InPerson');
  notes = signal('');

  filteredDoctors = computed(() => {
    return this.doctors().filter(d => {
      const matchSearch = !this.searchTerm ||
        d.fullName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        d.specialization.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchDept = !this.selectedDeptFilter ||
        d.departmentName === this.selectedDeptFilter;
      return matchSearch && matchDept;
    });
  });

  specializations = computed(() => {
    return [...new Set(this.doctors().map(d => d.specialization))].sort();
  });

  ngOnInit() {
    this.loadData();
    this.handleQueryParams();
    const urlParams = new URLSearchParams(window.location.search);
    this.searchTerm=urlParams.get('specialty')!
  }

  loadData() {
    this.isLoading.set(true);

    this.endpoint.departments.getAll().subscribe({
      next: (d) => this.departments.set(d)
    });

    this.endpoint.doctors.getAll().subscribe({
      next: (d) => {
        this.doctors.set(d.filter(doc => doc.status === 'Active' || doc.status !== 'Inactive'));
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });

    const userId = this.authService.getUserIdFromToken();
    if (userId) {
      this.endpoint.patients.getByUserId(userId).subscribe({
        next: (p) => this.patient.set(p),
        error: () => { }
      });
    }
  }

  handleQueryParams() {
    this.route.queryParams.subscribe(params => {
      if (params['doctorId']) {
        const doctorId = Number(params['doctorId']);
        this.endpoint.doctors.getById(doctorId).subscribe({
          next: (doc) => {
            this.selectedDoctorId.set(doc.id);
            this.selectedDoctor.set(doc);
            this.currentStep.set(2);
            this.loadTimeSlots(doc.id);
          }
        });
      }
    });
  }

  selectDoctor(doc: any) {
    this.selectedDoctorId.set(doc.id);
    this.selectedDoctor.set(doc);
    this.selectedSlotId.set(null);
    this.selectedSlot.set(null);
    this.timeSlots.set([]);
    this.errorMsg.set('');
    this.nextStep();
    this.loadTimeSlots(doc.id);
  }

  loadTimeSlots(doctorId: number) {
    const today = new Date().toISOString().split('T')[0];
     this.endpoint.doctors.getTimeSlots(doctorId,today).subscribe({
    next: (slots) => {
      this.timeSlots.set(slots.slice(0, 8));
      },
      error: () => this.timeSlots.set([])
    });
  }

  selectSlot(slot: any) {
    this.selectedSlotId.set(slot.id);
    this.selectedSlot.set(slot);
    this.selectedDate.set(new Date(slot.slotStart).toISOString().split('T')[0]);
    this.errorMsg.set('');
  }

  nextStep() {
    this.errorMsg.set('');
    if (this.currentStep() === 1 && !this.selectedDoctorId()) {
      this.errorMsg.set('Please select a doctor first');
      return;
    }
    if (this.currentStep() === 2 && !this.selectedSlotId()) {
      this.errorMsg.set('Please select a time slot');
      return;
    }
    if (this.currentStep() < 3) {
      this.currentStep.update(s => s + 1);
    }
  }

  prevStep() {
    if (this.currentStep() > 1) {
      this.currentStep.update(s => s - 1);
    }
  }

  submitAppointment() {
    if (!this.patient()) {
      this.errorMsg.set('Patient profile not found. Please login again.');
      return;
    }
    if (!this.selectedDoctorId() || !this.selectedSlotId()) {
      this.errorMsg.set('Please complete all steps');
      return;
    }

    this.isSubmitting.set(true);
    this.errorMsg.set('');

    const dto = {
      patientId: this.patient().id,
      doctorId: this.selectedDoctorId()!,
      timeSlotId: this.selectedSlotId()!,
      appointmentDate: this.selectedSlot().slotStart,
      type: this.appointmentType(),
      notes: this.notes() || undefined
    };

    this.endpoint.appointments.create(dto).subscribe({
      next: () => {
        this.successMsg.set('Appointment booked successfully!');
        this.isSubmitting.set(false);
        setTimeout(() => {
          this.router.navigate(['/patient-dashboard']);
        }, 2000);
      },
      error: (err) => {
        this.errorMsg.set(err.error?.message || 'Failed to book appointment. Please try again.');
        this.isSubmitting.set(false);
      }
    });
  }

  getInitials(name: string): string {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'DR';
  }

  formatTime(time: string): string {
    if (!time) return '';
    return new Date(time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  formatDate(time: string): string {
    if (!time) return '';
    return new Date(time).toLocaleDateString('en-US', {
      weekday: 'short', month: 'short', day: 'numeric'
    });
  }

  clearFilters() {
    this.searchTerm = '';
    this.selectedDeptFilter = '';
  }
}