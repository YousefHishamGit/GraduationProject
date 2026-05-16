import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { EndPoints } from '../../services/endpoints';
import { AuthService } from '../../services/auth.service';
import { LanguageService } from '../../services/language.service';
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
  public language = inject(LanguageService);
  BookCount:number=0;

  activeTab = signal('overview');
  doctor = signal<any>(null);
  appointments = signal<any[]>([]);
  schedule = signal<any[]>([]);
  leaves = signal<any[]>([]);
  timeSlots = signal<any[]>([]);
  /** yyyy-MM-dd — day shown in Time slots tab (computed from weekly schedule). */
  timeSlotsPreviewDate = signal<string>(new Date().toISOString().split('T')[0]);
  reviews = signal<any[]>([]);
  isLoading = signal(true);
  sidebarOpen = signal(false);
  currentUser = signal<any>(null);

  // Create Medical Record
  showRecordModal = signal(false);
  showScheduleModal = signal(false);
  selectedAppointment = signal<any>(null);
  newRecord = { diagnosis: '', notes: '', vitalSigns: '' };
  newSchedule = {
    dayOfWeek: 1,
    startTime: '09:00',
    endTime: '17:00',
    slotDurationMinutes: 30,
    isAvailable: true
  };
  isSubmitting = signal(false);
  successMsg = signal('');
  errorMsg = signal('');

  // Generate Slots
  showSlotsModal = signal(false);
  slotDate = '';

  dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  ngOnInit() {
    const user = this.authService.getCurrentUser();
    this.currentUser.set(user);
    this.loadDoctor();
    console.log(this.timeSlots)
  }

  loadDoctor() {
    const userId = this.authService.getUserIdFromToken();
    if (!userId) { this.isLoading.set(false); return; }

    this.endpoint.doctors.getByUserId(userId).subscribe({
      next: (doctor) => {
        if (!doctor) { this.isLoading.set(false); return; }
        this.doctor.set(doctor);
        this.loadDoctorData(doctor.id);
      },
      error: (err) => {
        console.error('Error loading doctor:', err);
        this.isLoading.set(false);
      }
    });
  }

  loadDoctorData(doctorId: number) {
    this.endpoint.appointments.getByDoctor(doctorId).subscribe({
      next: (data) => {this.appointments.set(data) 
        this.BookCount=data.length;
      }
      
       ,
      
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

    this.reloadComputedTimeSlots(doctorId);

    this.endpoint.doctors.getReviews(doctorId).subscribe({
      next: (data) => {
        this.reviews.set(data);
        this.isLoading.set(false);
        console.log(data)
        console.log(doctorId)
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

  getAvailableScheduleCount(): number {
    return this.schedule().filter(s => s.isAvailable).length;
  }

  getFreeTimeSlotsCount(): number {
    return this.timeSlots().filter(s => !s.isBooked).length;
  }

  getBookedTimeSlotsCount(): number {
    
    return this.BookCount;
  }

  reloadComputedTimeSlots(doctorId: number) {
    const date = this.timeSlotsPreviewDate();
    this.endpoint.doctors.getTimeSlots(doctorId, date).subscribe({
      next: (data) => this.timeSlots.set(data),
      error: () => this.timeSlots.set([])
    });
  }

  onTimeSlotsPreviewDateChange(date: string) {
    this.timeSlotsPreviewDate.set(date);
    const doctorId = this.doctor()?.id;
    if (doctorId) {
      this.reloadComputedTimeSlots(doctorId);
    }
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

  openScheduleModal() {
    this.newSchedule = {
      dayOfWeek: 1,
      startTime: '09:00',
      endTime: '17:00',
      slotDurationMinutes: 30,
      isAvailable: true
    };
    this.successMsg.set('');
    this.errorMsg.set('');
    this.showScheduleModal.set(true);
  }

  closeScheduleModal() {
    this.showScheduleModal.set(false);
  }

  submitSchedule() {
    const doctorId = this.doctor()?.id;
    if (!doctorId) {
      this.errorMsg.set('Doctor profile is not loaded yet.');
      return;
    }
    if (!this.newSchedule.startTime || !this.newSchedule.endTime) {
      this.errorMsg.set('Please provide schedule start and end time.');
      return;
    }

    this.isSubmitting.set(true);
    this.errorMsg.set('');
    this.successMsg.set('');

    this.endpoint.doctors.createSchedule(doctorId, this.newSchedule).subscribe({
      next: (created) => {
        this.schedule.update(items => [...items, created]);
        this.successMsg.set('Schedule added successfully.');
        this.isSubmitting.set(false);
        setTimeout(() => this.closeScheduleModal(), 900);
      },
      error: (err) => {
        this.errorMsg.set(err.error?.message || 'Failed to add schedule.');
        this.isSubmitting.set(false);
      }
    });
  }

  deleteSchedule(id: number) {
    this.endpoint.doctors.deleteSchedule(id).subscribe({
      next: () => this.schedule.update(items => items.filter(s => s.id !== id)),
      error: (err) => this.errorMsg.set(err.error?.message || 'Failed to delete schedule.')
    });
  }

  // --- Generate Time Slots ---
  openSlotsModal() {
    this.showSlotsModal.set(true);
    this.slotDate = new Date().toISOString().split('T')[0];
    this.successMsg.set('');
    this.errorMsg.set('');
  }

  closeSlotsModal() {
    this.showSlotsModal.set(false);
  }

  generateSlots() {
    const docId = this.doctor()?.id;
    if (!docId || !this.slotDate) {
      this.errorMsg.set('Please select a valid date');
      return;
    }

    this.isSubmitting.set(true);
    this.endpoint.doctors.generateTimeSlots(docId, this.slotDate).subscribe({
      next: (res) => {
        this.successMsg.set('Time slots generated successfully!');
        this.timeSlots.update(slots => [...slots, ...res]);
        this.isSubmitting.set(false);
        setTimeout(() => this.closeSlotsModal(), 1500);
      },
      error: (err) => {
        this.errorMsg.set(err.error?.message || 'Failed to generate time slots');
        this.isSubmitting.set(false);
      }
    });
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