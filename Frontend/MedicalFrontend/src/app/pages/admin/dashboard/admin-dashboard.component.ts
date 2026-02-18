import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

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
  stats = signal<Stat[]>([
    { title: 'Total Doctors', value: 48, icon: 'fas fa-user-md', color: '#0d6efd', change: '+5 this month' },
    { title: 'Total Patients', value: 1245, icon: 'fas fa-users', color: '#17a2b8', change: '+124 this month' },
    { title: "Today's Appointments", value: 324, icon: 'fas fa-calendar-check', color: '#28a745', change: '12 pending' },
    { title: 'Monthly Revenue', value: 45230, icon: 'fas fa-dollar-sign', color: '#ffc107', change: '+12% from last month' }
  ]);

  recentAppointments = signal<Appointment[]>([]);

  ngOnInit() {
    this.loadAppointments();
  }

  loadAppointments() {
    const appointments = JSON.parse(localStorage.getItem('appointments') || '[]');
    const mapped = appointments.slice(-5).map((apt: any) => ({
      patient: `${apt.firstName || ''} ${apt.lastName || ''}`.trim() || 'Unknown',
      doctor: `Dr. ${apt.doctorId || 'Unknown'}`,
      date: apt.appointmentDate ? new Date(apt.appointmentDate).toLocaleDateString() : 'N/A',
      time: apt.appointmentDate ? new Date(apt.appointmentDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
      status: apt.status || 'Scheduled'
    }));
    this.recentAppointments.set(mapped);
  }
}
