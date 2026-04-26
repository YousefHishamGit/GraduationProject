import { Component, signal, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { EndPoints } from '../../Services/endpoints';
import { AuthService } from '../../Services/auth.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-patient-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, DatePipe],
  templateUrl: './patient-dashboard.component.html',
  styleUrls: ['./patient-dashboard.component.css']
})
export class PatientDashboardComponent implements OnInit {
  private endpoint = inject(EndPoints);
  private router = inject(Router);
  private authService = inject(AuthService);

  activeTab = signal<string>('about');
  patient = signal<any>(null);
  appointments = signal<any[]>([]);
  medicalRecords = signal<any[]>([]);
  prescriptions = signal<any[]>([]);
  labRequests = signal<any[]>([]);
  isLoading = signal<boolean>(true);

  userName = signal<string>('');
  userEmail = signal<string>('');
  userRole = signal<string>('');

  ngOnInit() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');

    this.userName.set(currentUser.fullName || 'Patient');
    this.userEmail.set(currentUser.email || '');
    this.userRole.set(currentUser.role || '');

    this.loadPatient();
  }

  loadPatient() {
    const userId = this.authService.getUserIdFromToken();
    const currentUser = this.authService.getCurrentUser();

    if (!userId) {
      console.error('No user ID found');
      this.isLoading.set(false);
      return;
    }

    this.endpoint.patients.getByUserId(userId).subscribe({
      next: (p) => {
        this.patient.set({
          id: p.id,
          fullName: p.fullName,
          email: currentUser?.email || 'N/A',
          phone: p.phone || 'N/A',
          gender: p.gender || 'N/A',
          bloodType: p.bloodType || 'N/A',
          allergies: p.allergies || 'None',
          emergencyContactName: p.emergencyContactName || 'N/A',
          emergencyContactPhone: p.emergencyContactPhone || 'N/A',
          medicalHistory: p.medicalHistory || 'No medical history recorded.',
          image: p.imgPath || '/assets/img/person/person-m-3.webp',
          birthDate: p.birthDate || 'N/A',
          address: p.address || 'N/A'
        });

        this.loadAllPatientData(p.id);
      },
      error: (err) => {
        console.error('Error loading patient:', err);
        this.isLoading.set(false);
      }
    });
  }

  loadAllPatientData(patientId: number) {
    this.isLoading.set(true);

    forkJoin({
      appointments: this.endpoint.appointments.getByPatient(patientId),
      medicalRecords: this.endpoint.medicalRecords.getByPatient(patientId),
      prescriptions: this.endpoint.prescriptions.getByPatient(patientId),
      labRequests: this.endpoint.labRequests.getByPatient(patientId)
    }).subscribe({
      next: (res) => {
        this.appointments.set(this.mapAppointments(res.appointments));
        this.medicalRecords.set(this.mapMedicalRecords(res.medicalRecords));
        this.prescriptions.set(this.mapPrescriptions(res.prescriptions));
        this.labRequests.set(this.mapLabRequests(res.labRequests));

        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading patient data', err);
        this.isLoading.set(false);
      }
    });
  }

  // ================== MAPPERS ==================

  private mapAppointments(data: any[]) {
    return data.map(a => ({
      id: a.id,
      doctorName: `Doctor #${a.doctorId}`,
      appointmentDate: a.appointmentDate,
      status: a.status,
      type: a.type
    }));
  }

  private mapMedicalRecords(data: any[]) {
    return data.map(r => ({
      id: r.id,
      diagnosis: r.diagnosis || 'N/A',
      treatment: r.treatment || 'N/A',
      recordDate: r.recordDate || 'N/A'
    }));
  }

  private mapPrescriptions(data: any[]) {
    return data.map(p => ({
      id: p.id,
      medicationName: p.medicationName || 'N/A',
      dosage: p.dosage || 'N/A',
      frequency: p.frequency || 'N/A',
      startDate: p.startDate || 'N/A',
      endDate: p.endDate
    }));
  }

  private mapLabRequests(data: any[]) {
    return data.map(l => ({
      id: l.id,
      testName: l.testName || 'N/A',
      requestedOn: l.requestDate || 'N/A', // fix naming
      status: l.status || 'N/A',
      resultFilePath: l.result
    }));
  }

  // ================== UI ==================

  setTab(tab: string) {
    this.activeTab.set(tab);
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'Confirmed': return 'badge-success';
      case 'Pending': return 'badge-warning';
      case 'Cancelled': return 'badge-danger';
      case 'Completed': return 'badge-info';
      default: return 'badge-secondary';
    }
  }

  logout() {
    localStorage.clear();
    this.router.navigate(['/login']);
  }
}