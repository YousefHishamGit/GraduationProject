import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css'
})
export class FooterComponent {
  navLinks = [
    { path: '/', text: 'Home' },
    { path: '/about', text: 'About' },
    { path: '/departments', text: 'Departments' },
    { path: '/services', text: 'Services' },
    { path: '/doctors', text: 'Doctors' },
    { path: '/appointment', text: 'Appointment' },
    { path: '/chatbot', text: 'Health Assistant' }
  ];
  address = '123 Health Street';
  phoneNumber = '+1 (555) 123-4567';
  contactEmail = 'contact@clinic.com';
}
