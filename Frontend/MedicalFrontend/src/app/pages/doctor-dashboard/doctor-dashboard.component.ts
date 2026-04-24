import { Component, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { EndPoints } from '../../Services/endpoints';

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
  private endpoint = inject(EndPoints);

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
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const doctorId = currentUser.userId ? parseInt(currentUser.userId) : 1;

    this.loadDoctorProfile(doctorId);
    this.loadAppointments(doctorId);
  }

  loadDoctorProfile(id: number) {
    this.endpoint.doctors.getById(id).subscribe({
      next: (d) => {
        this.doctor.set({
          id: d.id,
          name: d.fullName,
          specialization: d.specialization,
          phone: d.phone,
          email: 'doctor@clinic.com',
          birthDate: '1980-05-15',
          address: '123 Health Street',
          licenseNumber: d.licenseNumber,
          yearsOfExperience: d.yearsOfExperience,
          hireDate: d.hireDate,
          status: d.status,
          consultationFee: d.consultationFee,
          image: d.imgPath || '/assets/img/person/person-f-11.webp'
        });
      },
      error: (err) => console.error('Error loading doctor profile', err)
    });
  }

  loadAppointments(doctorId: number) {
    this.endpoint.appointments.getByDoctor(doctorId).subscribe({
      next: (data) => {
        this.appointments = data.map(a => ({
          id: a.id,
          firstName: 'Patient',
          lastName: `#${a.patientId}`,
          appointmentDate: a.appointmentDate,
          status: a.status,
          phone: 'N/A',
          email: 'N/A'
        }));
      },
      error: (err) => console.error('Error loading appointments', err)
    });
  }

  setActiveTab(tab: string) {
    this.activeTab = tab;
  }

  getInitials(name: string | undefined): string {
    if (!name) return '';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }
}
