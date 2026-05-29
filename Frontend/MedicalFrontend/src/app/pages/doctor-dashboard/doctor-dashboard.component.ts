import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { EndPoints } from '../../services/endpoints';
import { AuthService } from '../../services/auth.service';
import { LanguageService } from '../../services/language.service';
import { parseApiError } from '../../shared/api-error.util';
import { resolveMediaUrl } from '../../shared/media-url.util';
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

  // Create Medical Record & Patient Info
  showRecordModal = signal(false);
  showPatientModal = signal(false);
  isReadOnly = signal(false);
  showScheduleModal = signal(false);
  selectedAppointment = signal<any>(null);
  selectedPatient = signal<any>(null);
  newMedicalHistoryEntry = '';
  newAllergiesEntry = '';
  newRecord = { diagnosis: '', notes: '', vitalSigns: '' };
  existingRecord = signal<any>(null);
  selectedRecordFile: File | null = null;
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
  uploadingProfilePhoto = signal(false);
  profilePhotoMessage = signal('');
  profilePhotoError = signal('');

  // Patient Lab Results & Requests
  patientLabRequests = signal<any[]>([]);
  isLoadingLabResults = signal(false);
  showLabResultsSection = signal(false);
  showLabModal = signal(false);
  newLabTestRequestName = '';

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
    this.isReadOnly.set(apt.status === 'Completed');
    this.showRecordModal.set(true);
    this.newRecord = { diagnosis: '', notes: '', vitalSigns: '' };
    this.existingRecord.set(null);
    this.selectedPatient.set(null);
    this.newMedicalHistoryEntry = '';
    this.newAllergiesEntry = '';
    this.selectedRecordFile = null;
    this.successMsg.set('');
    this.errorMsg.set('');

    this.endpoint.medicalRecords.getByAppointment(apt.id).subscribe({
      next: (rec) => {
        if (rec) {
          this.existingRecord.set(rec);
          this.newRecord = {
            diagnosis: rec.diagnosis || '',
            notes: rec.notes || '',
            vitalSigns: rec.vitalSigns || ''
          };
        }
      },
      error: () => {
        this.existingRecord.set(null);
      }
    });
  }

  openPatientModal(apt: any) {
    this.selectedAppointment.set(apt);
    this.isReadOnly.set(apt.status === 'Completed');
    this.showPatientModal.set(true);
    this.selectedPatient.set(null);
    this.newMedicalHistoryEntry = '';
    this.newAllergiesEntry = '';
    this.successMsg.set('');
    this.errorMsg.set('');
    this.patientLabRequests.set([]);
    this.showLabResultsSection.set(false);

    this.endpoint.patients.getById(apt.patientId).subscribe({
      next: (patient) => {
        this.selectedPatient.set(patient);
        this.newMedicalHistoryEntry = '';
        this.newAllergiesEntry = '';
        // Auto-load lab results for this patient
        this.loadPatientLabRequests(apt.patientId);
      },
      error: () => this.errorMsg.set('Failed to load patient details')
    });
  }

  loadPatientLabRequests(patientId: number) {
    this.isLoadingLabResults.set(true);
    this.endpoint.labRequests.getByPatient(patientId).subscribe({
      next: (labs) => {
        this.patientLabRequests.set(labs);
        this.isLoadingLabResults.set(false);
      },
      error: () => {
        this.patientLabRequests.set([]);
        this.isLoadingLabResults.set(false);
      }
    });
  }

  appendMedicalHistory() {
    const patient = this.selectedPatient();
    if (!patient || !this.newMedicalHistoryEntry.trim() || this.isReadOnly()) return;

    const prefix = patient.medicalHistory ? '\n' : '';
    const newEntry = prefix + this.newMedicalHistoryEntry.trim();
    const updatedHistory = (patient.medicalHistory || '') + newEntry;

    this.isSubmitting.set(true);
    this.endpoint.patients.update(patient.id, { medicalHistory: updatedHistory }).subscribe({
      next: (updatedPatient) => {
        this.selectedPatient.set(updatedPatient);
        this.newMedicalHistoryEntry = '';
        this.successMsg.set('Medical history updated successfully!');
        this.isSubmitting.set(false);
      },
      error: (err) => {
        this.errorMsg.set(err.error?.message || 'Failed to update medical history');
        this.isSubmitting.set(false);
      }
    });
  }

  closeRecordModal() {
    this.showRecordModal.set(false);
    this.selectedAppointment.set(null);
    this.existingRecord.set(null);
    this.selectedRecordFile = null;
  }

  closePatientModal() {
    this.showPatientModal.set(false);
    this.selectedPatient.set(null);
    this.newMedicalHistoryEntry = '';
    this.newAllergiesEntry = '';
    // We can keep these reset if needed, but they are also used by LabModal
    // this.patientLabRequests.set([]);
    // this.showLabResultsSection.set(false);
  }

  toggleLabResultsSection() {
    this.showLabResultsSection.set(!this.showLabResultsSection());
  }

  openLabModal(apt: any) {
    this.selectedAppointment.set(apt);
    this.isReadOnly.set(apt.status === 'Completed');
    this.showLabModal.set(true);
    this.newLabTestRequestName = '';
    this.successMsg.set('');
    this.errorMsg.set('');
    this.loadPatientLabRequests(apt.patientId);
  }

  closeLabModal() {
    this.showLabModal.set(false);
    this.selectedAppointment.set(null);
    this.newLabTestRequestName = '';
  }

  submitLabRequest() {
    const apt = this.selectedAppointment();
    if (!apt || !this.newLabTestRequestName.trim()) return;

    this.isSubmitting.set(true);
    this.endpoint.labRequests.doctorRequestLabTest(apt.patientId, this.newLabTestRequestName.trim()).subscribe({
      next: (createdLab) => {
        this.patientLabRequests.update(labs => [createdLab, ...labs]);
        this.newLabTestRequestName = '';
        this.successMsg.set('Lab test requested successfully!');
        this.isSubmitting.set(false);
      },
      error: (err) => {
        this.errorMsg.set(err.error?.message || 'Failed to request lab test');
        this.isSubmitting.set(false);
      }
    });
  }

  updateAllergies() {
    const patient = this.selectedPatient();
    if (!patient || this.isReadOnly()) return;

    this.isSubmitting.set(true);
    this.endpoint.patients.update(patient.id, { allergies: this.newAllergiesEntry.trim() }).subscribe({
      next: (updatedPatient) => {
        this.selectedPatient.set(updatedPatient);
        this.newAllergiesEntry = '';
        this.successMsg.set('Allergies updated successfully!');
        this.isSubmitting.set(false);
      },
      error: (err) => {
        this.errorMsg.set(err.error?.message || 'Failed to update allergies');
        this.isSubmitting.set(false);
      }
    });
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

    const payload = {
      ...this.newSchedule,
      startTime: this.newSchedule.startTime.length === 5 ? `${this.newSchedule.startTime}:00` : this.newSchedule.startTime,
      endTime: this.newSchedule.endTime.length === 5 ? `${this.newSchedule.endTime}:00` : this.newSchedule.endTime
    };

    this.endpoint.doctors.createSchedule(doctorId, payload).subscribe({
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

  onRecordFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedRecordFile = file;
    }
  }

  submitRecord() {
    if (!this.newRecord.diagnosis) {
      this.errorMsg.set('Diagnosis is required');
      return;
    }

    this.isSubmitting.set(true);
    const apt = this.selectedAppointment();
    const existing = this.existingRecord();

    if (existing) {
      this.endpoint.medicalRecords.update(existing.id, {
        diagnosis: this.newRecord.diagnosis,
        notes: this.newRecord.notes,
        vitalSigns: this.newRecord.vitalSigns
      }).subscribe({
        next: (updated) => {
          if (this.selectedRecordFile) {
            this.endpoint.medicalRecords.uploadAttachment(updated.id, this.selectedRecordFile).subscribe({
              next: (finalRec) => {
                this.existingRecord.set(finalRec);
                this.successMsg.set('Medical record and attachment updated successfully!');
                this.isSubmitting.set(false);
                setTimeout(() => this.closeRecordModal(), 1500);
              },
              error: (err) => {
                this.errorMsg.set(err.error?.message || 'Record updated, but failed to upload attachment');
                this.isSubmitting.set(false);
              }
            });
          } else {
            this.existingRecord.set(updated);
            this.successMsg.set('Medical record updated successfully!');
            this.isSubmitting.set(false);
            setTimeout(() => this.closeRecordModal(), 1500);
          }
        },
        error: (err) => {
          this.errorMsg.set(err.error?.message || 'Failed to update record');
          this.isSubmitting.set(false);
        }
      });
    } else {
      this.endpoint.medicalRecords.create({
        appointmentId: apt.id,
        patientId: apt.patientId,
        doctorId: apt.doctorId,
        diagnosis: this.newRecord.diagnosis,
        notes: this.newRecord.notes,
        vitalSigns: this.newRecord.vitalSigns
      }).subscribe({
        next: (created) => {
          if (this.selectedRecordFile) {
            this.endpoint.medicalRecords.uploadAttachment(created.id, this.selectedRecordFile).subscribe({
              next: (finalRec) => {
                this.existingRecord.set(finalRec);
                this.successMsg.set('Medical record and attachment created successfully!');
                this.isSubmitting.set(false);
                setTimeout(() => this.closeRecordModal(), 1500);
              },
              error: (err) => {
                this.errorMsg.set(err.error?.message || 'Record created, but failed to upload attachment');
                this.isSubmitting.set(false);
              }
            });
          } else {
            this.existingRecord.set(created);
            this.successMsg.set('Medical record created successfully!');
            this.isSubmitting.set(false);
            setTimeout(() => this.closeRecordModal(), 1500);
          }
        },
        error: (err) => {
          this.errorMsg.set(err.error?.message || 'Failed to create record');
          this.isSubmitting.set(false);
        }
      });
    }
  }

  deleteAttachment() {
    const existing = this.existingRecord();
    if (!existing || !existing.attachedFilePath) return;

    if (!confirm('Are you sure you want to remove the attached PDF?')) return;

    this.isSubmitting.set(true);
    this.endpoint.medicalRecords.deleteAttachment(existing.id).subscribe({
      next: (updated) => {
        this.existingRecord.set(updated);
        this.selectedRecordFile = null;
        this.successMsg.set('Attachment removed successfully!');
        this.isSubmitting.set(false);
      },
      error: (err) => {
        this.errorMsg.set(err.error?.message || 'Failed to remove attachment');
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

  getFileUrl(path: string): string {
    return resolveMediaUrl(path);
  }

  getProfileImageUrl(): string {
    return resolveMediaUrl(this.doctor()?.imgPath);
  }

  onProfileImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    const doctorId = this.doctor()?.id;

    this.profilePhotoMessage.set('');
    this.profilePhotoError.set('');

    if (!file || !doctorId) {
      return;
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      this.profilePhotoError.set('Please upload a JPG, PNG, or WEBP image.');
      input.value = '';
      return;
    }

    this.uploadingProfilePhoto.set(true);

    this.endpoint.doctors.uploadProfileImage(doctorId, file).subscribe({
      next: (updated) => {
        this.doctor.set(updated);
        this.uploadingProfilePhoto.set(false);
        this.profilePhotoMessage.set('Profile photo updated successfully.');
        window.dispatchEvent(new Event('user-profile-updated'));
        input.value = '';
      },
      error: (err) => {
        this.uploadingProfilePhoto.set(false);
        this.profilePhotoError.set(parseApiError(err, 'Failed to update profile photo.'));
        input.value = '';
      }
    });
  }
}
