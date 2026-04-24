import { Component, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { EndPoints } from '../../../Services/endpoints';

interface Stat {
  title: string;
  value: number;
  icon: string;
  color: string;
  change: string;
}

interface Appointment {
  patient: string;
  doctor: string;
  date: string;
  time: string;
  status: string;
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {
  private endpoint = inject(EndPoints);

  stats = signal<Stat[]>([
    { title: 'Total Doctors', value: 0, icon: 'fas fa-user-md', color: '#0d6efd', change: 'Loading...' },
    { title: 'Total Patients', value: 0, icon: 'fas fa-users', color: '#17a2b8', change: 'Loading...' },
    { title: "Today's Appointments", value: 0, icon: 'fas fa-calendar-check', color: '#28a745', change: 'Loading...' },
    { title: 'Monthly Revenue', value: 0, icon: 'fas fa-dollar-sign', color: '#ffc107', change: 'Loading...' }
  ]);

  recentAppointments = signal<Appointment[]>([]);

  ngOnInit() {
    this.loadStats();
    this.loadRecentAppointments();
  }

  loadStats() {
    this.endpoint.doctors.getAll().subscribe(doctors => {
      this.updateStat('Total Doctors', doctors.length, `+${doctors.length} active`);
    });

    this.endpoint.patients.getAll().subscribe(patients => {
      this.updateStat('Total Patients', patients.length, `+${patients.length} total`);
    });

    this.endpoint.appointments.getAll().subscribe(appointments => {
      const today = new Date().toISOString().split('T')[0];
      const todayCount = appointments.filter(a => a.appointmentDate.startsWith(today)).length;
      this.updateStat("Today's Appointments", todayCount, `${appointments.length} total`);
    });
  }

  updateStat(title: string, value: number, change: string) {
    this.stats.update(current => current.map(s => s.title === title ? { ...s, value, change } : s));
  }

  loadRecentAppointments() {
    this.endpoint.appointments.getAll().subscribe({
      next: (data) => {
        const mapped = data.slice(-5).map(a => ({
          patient: `Patient #${a.patientId}`,
          doctor: `Doctor #${a.doctorId}`,
          date: new Date(a.appointmentDate).toLocaleDateString(),
          time: new Date(a.appointmentDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          status: a.status
        }));
        this.recentAppointments.set(mapped);
      },
      error: (err) => console.error('Error loading appointments', err)
    });
  }
}
