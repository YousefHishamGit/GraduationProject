import { Component, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { EndPoints } from '../../Services/endpoints';
import { forkJoin } from 'rxjs';

interface Appointment {
  id: number;
  patientName: string;
  appointmentDate: string;
  status: string;
  phone: string;
  timeSlotId: number;
}

interface Patient {
  id: number;
  fullName: string;
  phone: string;
  gender: string;
  bloodType?: string;
  address?: string;
  imgPath?: string;
}

interface TimeSlot {
  id: number;
  slotStart: string;
  slotEnd: string;
  isBooked: boolean;
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
  appointments = signal<Appointment[]>([]);
  patients = signal<Patient[]>([]);
  availableSlots = signal<TimeSlot[]>([]);
  
  activeTab = 'dashboard';
  isLoading = signal(true);

  currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  ngOnInit() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const doctorId = currentUser.userId ? parseInt(currentUser.userId) : 1;

    this.loadDashboardData(doctorId);
  }

  loadDashboardData(doctorId: number) {
    this.isLoading.set(true);
    
    // Load doctor profile, appointments, patients, and available slots in parallel
    forkJoin({
      doctor: this.endpoint.doctors.getById(doctorId),
      appointments: this.endpoint.appointments.getByDoctor(doctorId),
      patients: this.endpoint.doctors.getPatients(doctorId),
      slots: this.endpoint.doctors.getTimeSlots(doctorId)
    }).subscribe({
      next: (data) => {
        // Set doctor profile
        const doctor = data.doctor;
        this.doctor.set({
          id: doctor.id,
          name: doctor.fullName,
          specialization: doctor.specialization,
          phone: doctor.phone,
          email: 'doctor@clinic.com',
          birthDate: '1980-05-15',
          address: '123 Health Street',
          licenseNumber: doctor.licenseNumber,
          yearsOfExperience: doctor.yearsOfExperience,
          hireDate: doctor.hireDate,
          status: doctor.status,
          consultationFee: doctor.consultationFee,
          image: doctor.imgPath || '/assets/img/person/person-f-11.webp'
        });

        // Set appointments with patient names
        this.appointments.set(
          data.appointments.map(a => ({
            id: a.id,
            patientName: `Patient #${a.patientId}`,
            appointmentDate: a.appointmentDate,
            status: a.status,
            phone: 'N/A',
            timeSlotId: a.timeSlotId
          }))
        );

        // Set patients
        this.patients.set(data.patients);

        // Set available time slots
        this.availableSlots.set(data.slots);

        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading dashboard data', err);
        this.isLoading.set(false);
      }
    });
  }

  getInitials(name: string | null | undefined): string {
    if (!name) return 'DR';
    return name.split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }

  // Getters for statistics
  getTotalPatients(): number {
    return this.patients().length;
  }

  getTotalAppointments(): number {
    return this.appointments().length;
  }

  getAvailableSlots(): number {
    return this.availableSlots().filter(s => !s.isBooked).length;
  }

  getUpcomingAppointments(): Appointment[] {
    const now = new Date();
    return this.appointments().filter(a => {
      const apptDate = new Date(a.appointmentDate);
      return apptDate > now && (a.status === 'Confirmed' || a.status === 'Pending');
    }).slice(0, 5);
  }

  getBookedSlots(): number {
    return this.availableSlots().filter(s => s.isBooked).length;
  }

  setActiveTab(tab: string) {
    this.activeTab = tab;
  }
}
