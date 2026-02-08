import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
  mobileMenuOpen = false;
  contactEmail = 'contact@clinic.com';
  phoneNumber = '+1 (555) 123-4567';
  navLinks = [
    { path: '/', text: 'Home' },
    { path: '/about', text: 'About' },
    { path: '/departments', text: 'Departments' },
    { path: '/services', text: 'Services' },
    { path: '/doctors', text: 'Doctors' },
    { path: '/appointment', text: 'Appointment' },
    { path: '/chatbot', text: 'Health Assistant' }
  ];
  socialLinks = [
    { icon: 'fab fa-facebook', link: '#' },
    { icon: 'fab fa-twitter', link: '#' },
    { icon: 'fab fa-instagram', link: '#' },
    { icon: 'fab fa-linkedin', link: '#' }
  ];

  toggleMobileMenu() {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }
}
