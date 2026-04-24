import { Component, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { EndPoints } from '../../Services/endpoints';

interface Patient {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  birthDate: string;
  address: string;
  bloodType: string;
  allergies: string;
  emergencyContactPhone: string;
  medicalHistory: string;
  image: string;
}

interface Appointment {
  id: number;
  firstName: string;
  lastName: string;
  appointmentDate: string;
  status: string;
  phone: string;
  email: string;
  doctorName: string;
}

@Component({
  selector: 'app-patient-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './patient-dashboard.component.html',
  styleUrls: ['./patient-dashboard.component.css']
})
export class PatientDashboardComponent implements OnInit {
  private endpoint = inject(EndPoints);

  activeTab = signal<string>('about');
  patient = signal<Patient | null>(null);
  appointments = signal<Appointment[]>([]);

  ngOnInit() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const patientId = currentUser.userId ? parseInt(currentUser.userId) : 1;

    this.loadPatientData(patientId);
  }

  loadPatientData(id: number) {
    this.endpoint.patients.getById(id).subscribe({
      next: (p) => {
        this.patient.set({
          id: p.id,
          fullName: p.fullName,
          email: 'patient@email.com',
          phone: p.phone,
          birthDate: p.birthDate,
          address: p.address || 'N/A',
          bloodType: 'N/A',
          allergies: 'N/A',
          emergencyContactPhone: 'N/A',
          medicalHistory: 'N/A',
          image: '/assets/img/person/person-m-3.webp'
        });
      },
      error: (err) => console.error('Error loading patient profile', err)
    });

    this.endpoint.appointments.getByPatient(id).subscribe({
      next: (data) => {
        this.appointments.set(data.map(a => ({
          id: a.id,
          firstName: 'Patient',
          lastName: `#${a.patientId}`,
          appointmentDate: a.appointmentDate,
          status: a.status,
          phone: 'N/A',
          email: 'N/A',
          doctorName: `Doctor #${a.doctorId}`
        })));
      },
      error: (err) => console.error('Error loading appointments', err)
    });
  }

  setTab(tab: string) {
    this.activeTab.set(tab);
  }
}
