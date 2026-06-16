import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { EndPoints } from '../../services/endpoints';
import { AuthService } from '../../services/auth.service';
import { LanguageService } from '../../services/language.service';
import { parseApiError } from '../../shared/api-error.util';
import { resolveMediaUrl } from '../../shared/media-url.util';

@Component({
  selector: 'app-patient-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, DatePipe],
  templateUrl: './patient-dashboard.component.html',
  styleUrls: ['./patient-dashboard.component.css']
})
export class PatientDashboardComponent implements OnInit {
  private endpoint = inject(EndPoints);
  private authService = inject(AuthService);
  private router = inject(Router);
  public language = inject(LanguageService);

  activeTab = signal('overview');
  patient = signal<any>(null);
  appointments = signal<any[]>([]);
  medicalRecords = signal<any[]>([]);
  prescriptions = signal<any[]>([]);
  labRequests = signal<any[]>([]);
  notifications = signal<any[]>([]);
  unreadNotificationsCount = signal(0);
  isLoading = signal(true);
  sidebarOpen = signal(false);
  currentUser = signal<any>(null);
  uploadingLabId = signal<number | null>(null);
  uploadingProfilePhoto = signal(false);
  profilePhotoMessage = signal('');
  profilePhotoError = signal('');

  ngOnInit() {
    const user = this.authService.getCurrentUser();
    this.currentUser.set(user);
    this.loadPatient();
  }

  loadPatient() {
    const userId = this.authService.getUserIdFromToken();
    if (!userId) { this.isLoading.set(false); return; }

    this.endpoint.patients.getByUserId(userId).subscribe({
      next: (p) => {
        this.patient.set(p);
        this.loadAllData(p.id);
      },
      error: () => this.isLoading.set(false)
    });
  }

  loadAllData(patientId: number) {
    // Load doctors list for review display
    this.endpoint.doctors.getAll().subscribe({
      next: (docs) => this.doctors.set(docs.filter((d: any) => d.status !== 'Inactive')),
      error: () => {}
    });

    forkJoin({
      appointments: this.endpoint.appointments.getByPatient(patientId),
      medicalRecords: this.endpoint.medicalRecords.getByPatient(patientId),
      prescriptions: this.endpoint.prescriptions.getByPatient(patientId),
      labRequests: this.endpoint.labRequests.getByPatient(patientId),
      notifications: this.endpoint.notifications.getByPatient(patientId)
    }).subscribe({
      next: (res) => {
        this.appointments.set(res.appointments);
        this.medicalRecords.set(res.medicalRecords);
        this.prescriptions.set(res.prescriptions.map(p => ({
          ...p, medicineName: p.medicineName || (p as any).medicationName
        })));
        this.labRequests.set(res.labRequests);
        this.notifications.set(res.notifications);
        this.updateTotalBadgeCount();
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  setTab(tab: string) {
    this.activeTab.set(tab);
    this.sidebarOpen.set(false);
    if (tab === 'appointments') {
      localStorage.setItem('lastOpenedAppointments', new Date().toISOString());
      this.updateTotalBadgeCount();
    } else if (tab === 'prescriptions') {
      localStorage.setItem('lastOpenedPrescriptions', new Date().toISOString());
      this.updateTotalBadgeCount();
    } else if (tab === 'lab') {
      localStorage.setItem('lastOpenedLab', new Date().toISOString());
      this.updateTotalBadgeCount();
    } else if (tab === 'medical') {
      localStorage.setItem('lastOpenedMedical', new Date().toISOString());
      this.updateTotalBadgeCount();
    } else if (tab === 'overview') {
      // When patient opens Dashboard/Overview, clear notifications and mark items as seen
      const patientId = this.patient()?.id;
      if (patientId) {
        this.endpoint.notifications.markAllAsRead(patientId).subscribe({ next: () => {
          this.notifications.update(n => n.map(x => ({ ...x, isRead: true })));
          // mark item sections as opened so red dots disappear
          const now = new Date().toISOString();
          localStorage.setItem('lastOpenedAppointments', now);
          localStorage.setItem('lastOpenedPrescriptions', now);
          localStorage.setItem('lastOpenedLab', now);
          localStorage.setItem('lastOpenedMedical', now);
          this.updateTotalBadgeCount();
        }, error: () => { /* ignore errors for UX */ } });
      }
    } else if (tab === 'reviews') {
      this.loadReviewsData();
    }
  }

  updateTotalBadgeCount() {
    const newPresc = this.hasNewPrescriptions() ? 1 : 0;
    const newLab = this.hasNewLabRequests() ? 1 : 0;
    const newMed = this.hasNewMedicalRecords() ? 1 : 0;
    const unreadNotifications = this.notifications().filter(n => !n.isRead).length;

    const totalCount = newPresc + newLab + newMed + unreadNotifications;
    this.unreadNotificationsCount.set(unreadNotifications);

    // Dispatch custom event to update navbar badge count
    window.dispatchEvent(new CustomEvent('notifications-updated', {
      detail: { count: totalCount }
    }));
  }

  dismissNotification(id: number) {
    this.endpoint.notifications.delete(id).subscribe({
      next: () => {
        this.notifications.update(notifs => notifs.filter(n => n.id !== id));
        this.updateTotalBadgeCount();
      }
    });
  }

  markAsRead(id: number) {
    this.endpoint.notifications.markAsRead(id).subscribe({
      next: () => {
        this.notifications.update(notifs =>
          notifs.map(n => n.id === id ? { ...n, isRead: true } : n)
        );
        this.updateTotalBadgeCount();
      }
    });
  }

  deleteNotification(id: number) {
    if (!confirm('Are you sure you want to delete this notification?')) return;
    this.endpoint.notifications.delete(id).subscribe({
      next: () => {
        this.notifications.update(notifs => notifs.filter(n => n.id !== id));
        this.updateTotalBadgeCount();
      }
    });
  }

  clearAllNotifications() {
    const patientId = this.patient()?.id;
    if (!patientId) return;
    if (!confirm('Are you sure you want to clear all notifications?')) return;

    this.endpoint.notifications.clearAll(patientId).subscribe({
      next: () => {
        this.notifications.set([]);
        this.updateTotalBadgeCount();
      }
    });
  }

  hasNewPrescriptions(): boolean {
    const lastOpened = localStorage.getItem('lastOpenedPrescriptions');
    if (!lastOpened) return this.prescriptions().length > 0;
    return this.prescriptions().some(p => {
      const pDate = p.createdOn || p.requestedOn;
      return pDate && new Date(pDate) > new Date(lastOpened);
    });
  }

  hasNewLabRequests(): boolean {
    const lastOpened = localStorage.getItem('lastOpenedLab');
    if (!lastOpened) return this.labRequests().length > 0;
    return this.labRequests().some(l => {
      const lDate = l.createdOn || l.requestedOn;
      return lDate && new Date(lDate) > new Date(lastOpened);
    });
  }

  hasNewMedicalRecords(): boolean {
    const lastOpened = localStorage.getItem('lastOpenedMedical');
    if (!lastOpened) return this.medicalRecords().length > 0;
    return this.medicalRecords().some(m => {
      const mDate = m.createdOn || m.requestedOn;
      return mDate && new Date(mDate) > new Date(lastOpened);
    });
  }

  getNewPrescriptionsCount(): number {
    const lastOpened = localStorage.getItem('lastOpenedPrescriptions');
    if (!lastOpened) return this.prescriptions().length;
    return this.prescriptions().filter(p => {
      const pDate = p.createdOn || p.requestedOn;
      return pDate && new Date(pDate) > new Date(lastOpened);
    }).length;
  }

  getNewLabCount(): number {
    const lastOpened = localStorage.getItem('lastOpenedLab');
    if (!lastOpened) return this.labRequests().length;
    return this.labRequests().filter(l => {
      const lDate = l.createdOn || l.requestedOn;
      return lDate && new Date(lDate) > new Date(lastOpened);
    }).length;
  }

  getNewMedicalRecordsCount(): number {
    const lastOpened = localStorage.getItem('lastOpenedMedical');
    if (!lastOpened) return this.medicalRecords().length;
    return this.medicalRecords().filter(m => {
      const mDate = m.createdOn || m.requestedOn;
      return mDate && new Date(mDate) > new Date(lastOpened);
    }).length;
  }

  getNewAppointmentsCount(): number {
    const lastOpened = localStorage.getItem('lastOpenedAppointments');
    if (!lastOpened) return this.appointments().length;
    return this.appointments().filter(a => {
      const aDate = a.createdOn || a.scheduledDate;
      return aDate && new Date(aDate) > new Date(lastOpened);
    }).length;
  }

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      Confirmed: 'badge-success', Pending: 'badge-warning',
      Cancelled: 'badge-danger', Completed: 'badge-info',
      Done: 'badge-success', Requested: 'badge-warning'
    };
    return map[status] || 'badge-secondary';
  }

  getUpcoming() {
    return this.appointments().filter(a =>
      a.status === 'Confirmed' || a.status === 'Pending'
    ).slice(0, 3);
  }

  getInitials(name: string): string {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'P';
  }

  logout() {
    this.authService.logout();
  }

  // ═══════════════════════════════════════
  //  REVIEWS
  // ═══════════════════════════════════════
  doctors = signal<any[]>([]);
  myReviews = signal<any[]>([]);
  reviewsLoading = signal(false);
  reviewsError = signal('');
  reviewsSuccess = signal('');

  // New review form state
  showReviewForm = signal(false);
  selectedAppointmentId = signal<number | null>(null);
  reviewDoctorId = signal<number | null>(null);
  reviewRating = signal(0);
  hoverRating = signal(0);
  reviewComment = '';
  isSubmittingReview = signal(false);

  /** Appointments that are Completed and not already reviewed */
  get completedAppointments() {
    const reviewedAptIds = new Set(this.myReviews().map((r: any) => r.appointmentId));
    return this.appointments().filter(
      (a: any) => a.status === 'Completed' && !reviewedAptIds.has(a.id)
    );
  }

  getAptDoctorName(apt: any): string {
    return this.doctors().find((d: any) => d.id === apt.doctorId)?.fullName || `Doctor #${apt.doctorId}`;
  }

  getAptDoctorSpec(apt: any): string {
    return this.doctors().find((d: any) => d.id === apt.doctorId)?.specialization || '';
  }

  loadReviewsData() {
    this.reviewsLoading.set(true);
    this.reviewsError.set('');

    this.endpoint.doctors.getAll().subscribe({
      next: (docs) => this.doctors.set(docs.filter((d: any) => d.status !== 'Inactive')),
      error: () => {}
    });

    const patientId = this.patient()?.id;
    if (!patientId) { this.reviewsLoading.set(false); return; }

    this.endpoint.reviews.getByPatient(patientId).subscribe({
      next: (reviews) => {
        this.myReviews.set(reviews);
        this.reviewsLoading.set(false);
      },
      error: () => {
        this.myReviews.set([]);
        this.reviewsLoading.set(false);
      }
    });
  }

  openReviewForm() {
    this.showReviewForm.set(true);
    this.selectedAppointmentId.set(null);
    this.reviewDoctorId.set(null);
    this.reviewRating.set(0);
    this.hoverRating.set(0);
    this.reviewComment = '';
    this.reviewsError.set('');
    this.reviewsSuccess.set('');
  }

  selectAppointmentForReview(apt: any) {
    this.selectedAppointmentId.set(apt.id);
    this.reviewDoctorId.set(apt.doctorId);
  }

  closeReviewForm() {
    this.showReviewForm.set(false);
  }

  setReviewStar(star: number) {
    this.reviewRating.set(star);
  }

  setHoverStar(star: number) {
    this.hoverRating.set(star);
  }

  clearHoverStar() {
    this.hoverRating.set(0);
  }

  getDisplayRating(): number {
    return this.hoverRating() || this.reviewRating();
  }

  submitReview() {
    if (!this.selectedAppointmentId()) {
      this.reviewsError.set('Please select an appointment to review.');
      return;
    }
    if (!this.reviewRating()) {
      this.reviewsError.set('Please select a rating (1-5 stars).');
      return;
    }
    const patientId = this.patient()?.id;
    if (!patientId) {
      this.reviewsError.set('Patient profile not found.');
      return;
    }

    this.isSubmittingReview.set(true);
    this.reviewsError.set('');
    this.reviewsSuccess.set('');

    const dto = {
      appointmentId: this.selectedAppointmentId()!,
      patientId,
      doctorId: this.reviewDoctorId()!,
      rating: this.reviewRating(),
      comment: this.reviewComment || undefined
    };

    this.endpoint.reviews.create(dto).subscribe({
      next: (created) => {
        this.myReviews.update(r => [created, ...r]);
        this.reviewsSuccess.set('Review submitted successfully!');
        this.isSubmittingReview.set(false);
        setTimeout(() => this.closeReviewForm(), 1500);
      },
      error: (err) => {
        this.reviewsError.set(err.error?.message || 'Failed to submit review.');
        this.isSubmittingReview.set(false);
      }
    });
  }

  deleteReview(id: number) {
    if (!confirm('Are you sure you want to delete this review?')) return;
    this.endpoint.reviews.delete(id).subscribe({
      next: () => this.myReviews.update(r => r.filter(x => x.id !== id)),
      error: (err) => this.reviewsError.set(err.error?.message || 'Failed to delete review.')
    });
  }

  getDoctorName(doctorId: number): string {
    return this.doctors().find(d => d.id === doctorId)?.fullName || `Doctor #${doctorId}`;
  }

  getDoctorSpec(doctorId: number): string {
    return this.doctors().find(d => d.id === doctorId)?.specialization || '';
  }

  getStars(rating: number) {
    return Array(5).fill(0).map((_, i) => i < Math.round(rating) ? 1 : 0);
  }

  getFileUrl(path: string): string {
    return resolveMediaUrl(path);
  }

  getProfileImageUrl(): string {
    return resolveMediaUrl(this.patient()?.imgPath);
  }

  onProfileImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    const patientId = this.patient()?.id;

    this.profilePhotoMessage.set('');
    this.profilePhotoError.set('');

    if (!file || !patientId) {
      return;
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      this.profilePhotoError.set('Please upload a JPG, PNG, or WEBP image.');
      input.value = '';
      return;
    }

    this.uploadingProfilePhoto.set(true);

    this.endpoint.patients.uploadProfileImage(patientId, file).subscribe({
      next: (updated) => {
        this.patient.set(updated);
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

  deleteRecord(id: number) {
    if (!confirm('Are you sure you want to delete this medical record?')) return;
    this.endpoint.medicalRecords.delete(id).subscribe({
      next: () => {
        this.medicalRecords.update(records => records.filter(r => r.id !== id));
      },
      error: (err) => {
        alert(err.error?.message || 'Failed to delete medical record.');
      }
    });
  }

  // ═══════════════════════════════════════
  //  PATIENT LAB UPLOAD
  // ═══════════════════════════════════════
  showLabUploadForm = signal(false);
  newLabTestName = '';
  newLabFile: File | null = null;
  isSubmittingLabUpload = signal(false);

  openLabUploadForm() {
    this.showLabUploadForm.set(true);
    this.newLabTestName = '';
    this.newLabFile = null;
  }

  closeLabUploadForm() {
    this.showLabUploadForm.set(false);
  }

  onNewLabFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;
    if (file.type !== 'application/pdf') {
      alert('Only PDF files are allowed.');
      return;
    }
    this.newLabFile = file;
  }

  submitPatientLabUpload() {
    if (!this.newLabTestName.trim()) {
      alert('Please enter the test name.');
      return;
    }
    if (!this.newLabFile) {
      alert('Please select a PDF file to upload.');
      return;
    }

    const patientId = this.patient()?.id;
    if (!patientId) return;

    this.isSubmittingLabUpload.set(true);

    this.endpoint.labRequests.uploadPatientLabResult(patientId, this.newLabTestName.trim(), this.newLabFile)
      .subscribe({
        next: (createdLab) => {
          this.labRequests.update(labs => [createdLab, ...labs]);
          this.isSubmittingLabUpload.set(false);
          this.closeLabUploadForm();
          alert('Lab test uploaded successfully.');
        },
        error: (err) => {
          alert(err.error?.message || 'Failed to upload lab test.');
          this.isSubmittingLabUpload.set(false);
        }
      });
  }

  onLabFileSelected(event: any, labId: number) {
    const file = event.target.files[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      alert('Only PDF/JPG/PNG files are allowed. Please select a valid PDF.');
      return;
    }

    this.uploadingLabId.set(labId);

    this.endpoint.labRequests.uploadResultFile(labId, file).subscribe({
      next: (updatedLab) => {
        this.labRequests.update(labs =>
          labs.map(l => l.id === labId ? updatedLab : l)
        );
        this.uploadingLabId.set(null);
      },
      error: (err) => {
        alert(err.error?.message || 'Failed to upload lab result.');
        this.uploadingLabId.set(null);
      }
    });
  }
}
