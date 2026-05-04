import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { EndPoints } from '../../services/endpoints';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-doctor-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, DatePipe],
  templateUrl: './doctor-dashboard.component.html',
  styleUrls: ['./doctor-dashboard.component.css']
})
export class DoctorDashboardComponent implements OnInit {
  private endpoint = inject(EndPoints);
  private authService = inject(AuthService);
  private router = inject(Router);

  activeTab = signal('overview');
  doctor = signal<any>(null);
  appointments = signal<any[]>([]);
  schedule = signal<any[]>([]);
  leaves = signal<any[]>([]);
  timeSlots = signal<any[]>([]);
  reviews = signal<any[]>([]);
  isLoading = signal(true);
  sidebarOpen = signal(false);
  currentUser = signal<any>(null);

  // Create Medical Record
  showRecordModal = signal(false);
  selectedAppointment = signal<any>(null);
  newRecord = { diagnosis: '', notes: '', vitalSigns: '' };
  isSubmitting = signal(false);
  successMsg = signal('');
  errorMsg = signal('');

  dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  ngOnInit() {
    const user = this.authService.getCurrentUser();
    this.currentUser.set(user);
    this.loadDoctor();
  }

  loadDoctor() {
    const userId = this.authService.getUserIdFromToken();
    if (!userId) { this.isLoading.set(false); return; }

    this.endpoint.doctors.getAll().subscribe({
      next: (doctors) => {
        const doc = doctors.find(d => d.phone !== undefined) || doctors[0];
        if (!doc) { this.isLoading.set(false); return; }
        this.doctor.set(doc);
        this.loadDoctorData(doc.id);
      },
      error: () => this.isLoading.set(false)
    });
  }

  loadDoctorData(doctorId: number) {
    this.endpoint.appointments.getByDoctor(doctorId).subscribe({
      next: (data) => this.appointments.set(data),
      error: () => {}
    });

    this.endpoint.doctors.getSchedule(doctorId).subscribe({
      next: (data) => this.schedule.set(data),
      error: () => {}
    });

    this.endpoint.doctors.getLeaves(doctorId).subscribe({
      next: (data) => this.leaves.set(data),
      error: () => {}
    });

    this.endpoint.doctors.getTimeSlots(doctorId).subscribe({
      next: (data) => this.timeSlots.set(data),
      error: () => {}
    });

    this.endpoint.doctors.getReviews(doctorId).subscribe({
      next: (data) => {
        this.reviews.set(data);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  setTab(tab: string) {
    this.activeTab.set(tab);
    this.sidebarOpen.set(false);
  }

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      Confirmed: 'badge-success', Pending: 'badge-warning',
      Cancelled: 'badge-danger', Completed: 'badge-info'
    };
    return map[status] || 'badge-secondary';
  }

  getTodayAppointments() {
    const today = new Date().toISOString().split('T')[0];
    return this.appointments().filter(a => a.appointmentDate?.startsWith(today));
  }

  getPendingCount() {
    return this.appointments().filter(a => a.status === 'Pending').length;
  }

  getAvgRating() {
    if (!this.reviews().length) return 0;
    const avg = this.reviews().reduce((s, r) => s + r.rating, 0) / this.reviews().length;
    return Math.round(avg * 10) / 10;
  }

  getStars(rating: number) {
    return Array(5).fill(0).map((_, i) => i < Math.round(rating) ? 1 : 0);
  }

  getDayName(day: number): string {
    return this.dayNames[day] || `Day ${day}`;
  }

  openRecordModal(apt: any) {
    this.selectedAppointment.set(apt);
    this.showRecordModal.set(true);
    this.newRecord = { diagnosis: '', notes: '', vitalSigns: '' };
    this.successMsg.set('');
    this.errorMsg.set('');
  }

  closeRecordModal() {
    this.showRecordModal.set(false);
    this.selectedAppointment.set(null);
  }

  submitRecord() {
    if (!this.newRecord.diagnosis) {
      this.errorMsg.set('Diagnosis is required');
      return;
    }

    this.isSubmitting.set(true);
    const apt = this.selectedAppointment();

    this.endpoint.medicalRecords.create({
      appointmentId: apt.id,
      patientId: apt.patientId,
      doctorId: apt.doctorId,
      diagnosis: this.newRecord.diagnosis,
      notes: this.newRecord.notes,
      vitalSigns: this.newRecord.vitalSigns
    }).subscribe({
      next: () => {
        this.successMsg.set('Medical record created successfully!');
        this.isSubmitting.set(false);
        setTimeout(() => this.closeRecordModal(), 1500);
      },
      error: (err) => {
        this.errorMsg.set(err.error?.message || 'Failed to create record');
        this.isSubmitting.set(false);
      }
    });
  }

  confirmAppointment(id: number) {
    this.endpoint.appointments.confirm(id).subscribe({
      next: () => {
        this.appointments.update(apts =>
          apts.map(a => a.id === id ? { ...a, status: 'Confirmed' } : a)
        );
      }
    });
  }

  completeAppointment(id: number) {
    this.endpoint.appointments.complete(id).subscribe({
      next: () => {
        this.appointments.update(apts =>
          apts.map(a => a.id === id ? { ...a, status: 'Completed' } : a)
        );
      }
    });
  }

  getInitials(name: string): string {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'DR';
  }

  logout() {
    this.authService.logout();
  }
}