import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { EndPoints } from '../../services/endpoints';
import { AuthService } from '../../services/auth.service';

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

  activeTab = signal('overview');
  patient = signal<any>(null);
  appointments = signal<any[]>([]);
  medicalRecords = signal<any[]>([]);
  prescriptions = signal<any[]>([]);
  labRequests = signal<any[]>([]);
  isLoading = signal(true);
  sidebarOpen = signal(false);

  currentUser = signal<any>(null);

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
    forkJoin({
      appointments: this.endpoint.appointments.getByPatient(patientId),
      medicalRecords: this.endpoint.medicalRecords.getByPatient(patientId),
      prescriptions: this.endpoint.prescriptions.getByPatient(patientId),
      labRequests: this.endpoint.labRequests.getByPatient(patientId)
    }).subscribe({
      next: (res) => {
        this.appointments.set(res.appointments);
        this.medicalRecords.set(res.medicalRecords);
        this.prescriptions.set(res.prescriptions.map(p => ({
          ...p, medicineName: p.medicineName || (p as any).medicationName
        })));
        this.labRequests.set(res.labRequests);
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
}