import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

interface Appointment {
  id: number;
  firstName: string;
  lastName: string;
  doctorId: string;
  appointmentDate: string;
  departmentId: string;
}

@Component({
  selector: 'app-appointment-success',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './appointment-success.component.html',
  styleUrls: ['./appointment-success.component.css']
})
export class AppointmentSuccessComponent implements OnInit {
  appointment = signal<Appointment | null>(null);

  ngOnInit() {
    const appointments = JSON.parse(localStorage.getItem('appointments') || '[]');
    if (appointments.length > 0) {
      this.appointment.set(appointments[appointments.length - 1]);
    }
  }

  print() {
    window.print();
  }
}
