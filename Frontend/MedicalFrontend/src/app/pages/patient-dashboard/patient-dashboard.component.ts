import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

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
  activeTab = signal<string>('about');
  patient = signal<Patient | null>(null);
  appointments = signal<Appointment[]>([]);

  ngOnInit() {
    this.loadPatientData();
  }

  loadPatientData() {
    this.patient.set({
      id: 1,
      fullName: 'John Doe',
      email: 'john.doe@email.com',
      phone: '+1 (555) 987-6543',
      birthDate: '1985-03-15',
      address: '123 Patient Street, Health City',
      bloodType: 'O+',
      allergies: 'Penicillin, Peanuts',
      emergencyContactPhone: '+1 (555) 123-4567',
      medicalHistory: 'No major surgeries. Hypertension diagnosed 2020. Regular checkups.',
      image: '/assets/img/person/person-m-3.webp'
    });

    this.appointments.set([
      {
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        appointmentDate: '2024-02-25T09:00:00',
        status: 'Confirmed',
        phone: '+1 (555) 987-6543',
        email: 'john.doe@email.com',
        doctorName: 'Dr. Sarah Johnson'
      },
      {
        id: 2,
        firstName: 'John',
        lastName: 'Doe',
        appointmentDate: '2024-03-10T14:30:00',
        status: 'Pending',
        phone: '+1 (555) 987-6543',
        email: 'john.doe@email.com',
        doctorName: 'Dr. Michael Brown'
      }
    ]);
  }

  setTab(tab: string) {
    this.activeTab.set(tab);
  }
}
