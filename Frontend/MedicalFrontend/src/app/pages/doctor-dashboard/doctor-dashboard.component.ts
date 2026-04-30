import { Component, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { EndPoints } from '../../Services/endpoints';
import { forkJoin } from 'rxjs';
import { FormsModule } from '@angular/forms';

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
  imports: [CommonModule, RouterLink, FormsModule],
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
  doctorId = signal<number | null>(null);
  processingAppointmentId = signal<number | null>(null);
  processingSlotAction = signal<boolean>(false);
  cancelReasons: Record<number, string> = {};
  slotDate = '';

  currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  ngOnInit() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const userId = currentUser.userId as string | undefined;
    if (!userId) {
      this.isLoading.set(false);
      return;
    }

    this.endpoint.doctors.getByUserId(userId).subscribe({
      next: (doctor) => {
        this.doctorId.set(doctor.id);
        this.loadDashboardData(doctor.id);
      },
      error: () => this.isLoading.set(false)
    });
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

  confirmAppointment(appointmentId: number) {
    this.processingAppointmentId.set(appointmentId);
    this.endpoint.appointments.confirm(appointmentId).subscribe({
      next: () => this.reloadCurrentDoctorData(),
      error: () => this.processingAppointmentId.set(null)
    });
  }

  completeAppointment(appointmentId: number) {
    this.processingAppointmentId.set(appointmentId);
    this.endpoint.appointments.complete(appointmentId).subscribe({
      next: () => this.reloadCurrentDoctorData(),
      error: () => this.processingAppointmentId.set(null)
    });
  }

  cancelAppointment(appointmentId: number) {
    this.processingAppointmentId.set(appointmentId);
    const reason = this.cancelReasons[appointmentId] || 'Cancelled by doctor';
    this.endpoint.appointments.cancel(appointmentId, { reason }).subscribe({
      next: () => {
        delete this.cancelReasons[appointmentId];
        this.reloadCurrentDoctorData();
      },
      error: () => this.processingAppointmentId.set(null)
    });
  }

  generateSlotsForDate() {
    const doctorId = this.doctorId();
    if (!doctorId || !this.slotDate) return;

    this.processingSlotAction.set(true);
    this.endpoint.doctors.generateTimeSlots(doctorId, { date: this.slotDate }).subscribe({
      next: () => this.reloadCurrentDoctorData(),
      error: () => this.processingSlotAction.set(false)
    });
  }

  removeSlot(slotId: number) {
    this.processingSlotAction.set(true);
    this.endpoint.doctors.deleteTimeSlot(slotId).subscribe({
      next: () => this.reloadCurrentDoctorData(),
      error: () => this.processingSlotAction.set(false)
    });
  }

  canConfirm(status: string): boolean {
    return status === 'Pending';
  }

  canComplete(status: string): boolean {
    return status === 'Confirmed';
  }

  canCancel(status: string): boolean {
    return status === 'Pending' || status === 'Confirmed';
  }

  private reloadCurrentDoctorData() {
    const id = this.doctorId();
    if (!id) return;
    this.processingAppointmentId.set(null);
    this.processingSlotAction.set(false);
    this.loadDashboardData(id);
  }
}
