import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
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
export class HomeComponent implements OnInit, OnDestroy {
  private endpoint = inject(EndPoints);
  private promotionTimer?: number;

  departments = signal<any[]>([]);
  doctors = signal<any[]>([]);
  isLoadingDepts = signal(true);
  isLoadingDoctors = signal(true);
  activePromotion = signal(0);
  tickerState = 'running';

  promotions = [
    {
      tag: 'Sponsored',
      title: 'Doliprane Adult 1000mg',
      desc: 'Fast relief from pain and fever. Tap to view the product on Vezeeta.',
      image: '/assets/advertisement/2.jpg',
      link: 'https://www.vezeeta.com/en-eg/pharmacy/doliprane-adult-1000-mg-8-tablets',
      button: 'View Product'
    },
    {
      tag: 'Sponsored',
      title: 'Dozova MAN Max',
      desc: 'Support men’s health with vitamins and minerals. Tap to view the product on Amazon.',
      image: '/assets/advertisement/3.jpg',
      link: 'https://www.amazon.eg/%D9%85%D9%83%D9%85%D9%84-%D8%BA%D8%B0%D8%A7%D8%A6%D9%8A-%D8%A8%D8%B1%D9%8A%D9%85%D9%8A%D9%88%D9%85-%D9%84%D9%84%D8%B1%D8%AC%D8%A7%D9%84-%D8%AF%D9%88%D8%B2%D9%88%D9%81%D8%A7/dp/B0DQYP4XC7',
      button: 'Shop on Amazon'
    }
  ];

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
    this.startPromotionRotation();
  }

  ngOnDestroy() {
    if (this.promotionTimer) {
      window.clearInterval(this.promotionTimer);
    }
  }

  startPromotionRotation() {
    this.promotionTimer = window.setInterval(() => {
      this.activePromotion.update(index => (index + 1) % this.promotions.length);
    }, 5000);
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