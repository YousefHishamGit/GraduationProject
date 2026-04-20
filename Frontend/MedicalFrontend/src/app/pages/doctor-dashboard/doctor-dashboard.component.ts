import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

interface Appointment {
  id: number;
  firstName: string;
  lastName: string;
  appointmentDate: string;
  status: string;
  phone: string;
  email: string;
}

interface Doctor {
  id: number;
  name: string;
  specialization: string;
  phone: string;
  email: string;
  birthDate: string;
  address: string;
  licenseNumber: string;
  yearsOfExperience: number;
  hireDate: string;
  status: string;
  consultationFee: number;
  image: string;
}

@Component({
  selector: 'app-doctor-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './doctor-dashboard.component.html',
  styleUrls: ['./doctor-dashboard.component.css']
})
export class DoctorDashboardComponent implements OnInit {
  doctor = signal<Doctor | null>(null);
  appointments: Appointment[] = [];
  activeTab = 'about';

  currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  ngOnInit() {
    this.loadDoctorProfile();
    this.loadAppointments();
  }

  loadDoctorProfile() {
    this.doctor.set({
      id: 1,
      name: 'Dr. Sarah Johnson',
      specialization: 'Cardiologist',
      phone: '+1 (555) 123-4567',
      email: 'sarah.johnson@clinic.com',
      birthDate: '1980-05-15',
      address: '123 Health Street, Medical City, MC 12345',
      licenseNumber: 'MD-12345-CA',
      yearsOfExperience: 15,
      hireDate: '2010-01-15',
      status: 'Active',
      consultationFee: 200,
      image: '/assets/img/person/person-f-11.webp'
    });
  }

  loadAppointments() {
    this.appointments = [
      {
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        appointmentDate: '2024-02-25T09:00:00',
        status: 'Confirmed',
        phone: '+1 (555) 987-6543',
        email: 'john.doe@email.com'
      },
      {
        id: 2,
        firstName: 'Jane',
        lastName: 'Smith',
        appointmentDate: '2024-02-26T10:30:00',
        status: 'Pending',
        phone: '+1 (555) 456-7890',
        email: 'jane.smith@email.com'
      },
      {
        id: 3,
        firstName: 'Robert',
        lastName: 'Johnson',
        appointmentDate: '2024-02-27T14:00:00',
        status: 'Confirmed',
        phone: '+1 (555) 234-5678',
        email: 'robert.j@email.com'
      }
    ];
  }

  setActiveTab(tab: string) {
    this.activeTab = tab;
  }

  getInitials(name: string | undefined): string {
    if (!name) return '';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }
}
