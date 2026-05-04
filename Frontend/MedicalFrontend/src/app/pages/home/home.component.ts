import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { EndPoints } from '../../services/endpoints';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  private endpoint = inject(EndPoints);

  departments = signal<any[]>([]);
  doctors = signal<any[]>([]);
  isLoadingDepts = signal(true);
  isLoadingDoctors = signal(true);

  stats = [
    { value: '15+', label: 'Years Experience', icon: 'fas fa-award' },
    { value: '50+', label: 'Expert Doctors', icon: 'fas fa-user-md' },
    { value: '10K+', label: 'Happy Patients', icon: 'fas fa-smile' },
    { value: '24/7', label: 'Emergency Care', icon: 'fas fa-ambulance' }
  ];

  services = [
    { icon: 'fas fa-heartbeat', title: 'Cardiology', desc: 'Advanced heart care with cutting-edge diagnostics.', color: '#ef4444' },
    { icon: 'fas fa-brain', title: 'Neurology', desc: 'Expert treatment for brain & nervous system.', color: '#8b5cf6' },
    { icon: 'fas fa-bone', title: 'Orthopedics', desc: 'Comprehensive bone and joint treatments.', color: '#f59e0b' },
    { icon: 'fas fa-baby', title: 'Pediatrics', desc: 'Specialized care for children of all ages.', color: '#10b981' },
    { icon: 'fas fa-eye', title: 'Ophthalmology', desc: 'Complete eye care and vision solutions.', color: '#3b82f6' },
    { icon: 'fas fa-robot', title: 'AI Diagnosis', desc: 'Smart symptom analysis powered by AI.', color: '#1a6fc4' }
  ];

  ngOnInit() {
    this.loadDepartments();
    this.loadDoctors();
  }

  loadDepartments() {
    this.endpoint.departments.getAll().subscribe({
      next: (data) => {
        this.departments.set(data.slice(0, 6));
        this.isLoadingDepts.set(false);
      },
      error: () => this.isLoadingDepts.set(false)
    });
  }

  loadDoctors() {
    this.endpoint.doctors.getAll().subscribe({
      next: (data) => {
        this.doctors.set(data.slice(0, 4));
        this.isLoadingDoctors.set(false);
      },
      error: () => this.isLoadingDoctors.set(false)
    });
  }

  getDoctorInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }
}