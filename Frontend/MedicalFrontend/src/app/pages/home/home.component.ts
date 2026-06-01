import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { EndPoints } from '../../services/endpoints';
import { LanguageService } from '../../services/language.service';
import { resolveDoctorPhoto } from '../../shared/doctor-assets';
import { AuthService } from '../../services/auth.service';

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
  private partnerTimer?: number;

  public language = inject(LanguageService);
  private authService = inject(AuthService);
  notifications = signal<any[]>([]);
  unreadNotificationsCount = signal(0);
  departments = signal<any[]>([]);
  doctors = signal<any[]>([]);
  isLoadingDepts = signal(true);
  isLoadingDoctors = signal(true);
  activePromotion = signal(0);
  activePartner = signal(0);
  tickerState = 'running';

  /** Hero partner hospitals — rotates every 3s */
  partnerHospitals = [
    {
      image: '/assets/advertisement/kaserAlAiny.jpg',
      alt: 'قصر العيني',
      label: 'قصر العيني',
      link: 'https://ar.wikipedia.org/wiki/%D9%82%D8%B5%D8%B1_%D8%A7%D9%84%D8%B9%D9%8A%D9%86%D9%8A'
    },
    {
      image: '/assets/advertisement/374872.png',
      alt: 'مستشفى الرباط الحديث',
      label: 'مستشفى الرباط الحديث',
      link: '#'
    },
    {
      image: '/assets/advertisement/elrayan.png',
      alt: 'مستشفى الريان',
      label: 'مستشفى الريان',
      link: '#'
    }
  ];

  promotions = [
    {
      tag: 'Treatment',
      title: 'Doliprane Adult 1000mg',
      desc: 'Fast relief from pain and fever. Tap to view the product on Vezeeta.',
      image: '/assets/advertisement/2.jpg',
      link: 'https://www.vezeeta.com/en-eg/pharmacy/doliprane-adult-1000-mg-8-tablets',
      button: 'View Product'
    },
    {
      tag: 'Dietary Supplement',
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
    { icon: 'fas fa-heartbeat', title: 'Cardiology', desc: 'Advanced heart care with cutting-edge diagnostics.', color: '#ef4444', image: '/assets/img/Department/cardiology.png' },
    { icon: 'fas fa-brain', title: 'Neurology', desc: 'Expert treatment for brain & nervous system.', color: '#8b5cf6', image: '/assets/img/Department/neurology.png' },
    { icon: 'fas fa-bone', title: 'Orthopedics', desc: 'Comprehensive bone and joint treatments.', color: '#f59e0b', image: '/assets/img/Department/orthopedics.png' },
    { icon: 'fas fa-baby', title: 'Pediatrics', desc: 'Specialized care for children of all ages.', color: '#10b981' },
    { icon: 'fas fa-eye', title: 'Ophthalmology', desc: 'Complete eye care and vision solutions.', color: '#3b82f6', image: '/assets/img/Department/Ophthalmology.png' },
    { icon: 'fas fa-robot', title: 'AI Diagnosis', desc: 'Smart symptom analysis powered by AI.', color: '#1a6fc4' }
  ];

  ngOnInit() {
    this.loadDepartments();
    this.loadDoctors();
    this.startPromotionRotation();
    this.startPartnerRotation();
    this.loadNotificationsIfPatient();
  }

  loadNotificationsIfPatient() {
    const role = this.authService.getRole();
    if (role !== 'Patient') return;

    const userId = this.authService.getUserIdFromToken();
    if (!userId) return;

    this.endpoint.patients.getByUserId(userId).subscribe({
      next: (p) => {
        const patientId = p?.id;
        if (!patientId) return;
        this.endpoint.notifications.getByPatient(patientId).subscribe({
          next: (list: any[]) => {
            const normalized = list.map(n => {
              const msg = (n.message || '').toString();
              if (msg.includes('تم إلغاء موعدك') || msg.toLowerCase().includes('has been cancelled')) {
                return { ...n, message: 'نعتذر عن موعدنا اليوم بسبب ظرف طارئ حدث للدكتور' };
              }
              return n;
            });
            this.notifications.set(normalized);
            const unread = normalized.filter(x => !x.isRead).length;
            this.unreadNotificationsCount.set(unread);
            window.dispatchEvent(new CustomEvent('notifications-updated', { detail: { count: unread } }));
          }
        });
      }
    });
  }

  markNotificationAsRead(id: number) {
    this.endpoint.notifications.markAsRead(id).subscribe({ next: () => {
      this.notifications.update(n => n.map(x => x.id === id ? { ...x, isRead: true } : x));
      const unread = this.notifications().filter(x => !x.isRead).length;
      this.unreadNotificationsCount.set(unread);
      window.dispatchEvent(new CustomEvent('notifications-updated', { detail: { count: unread } }));
    }});
  }

  dismissNotification(id: number) {
    this.endpoint.notifications.delete(id).subscribe({ next: () => {
      this.notifications.update(n => n.filter(x => x.id !== id));
      const unread = this.notifications().filter(x => !x.isRead).length;
      this.unreadNotificationsCount.set(unread);
      window.dispatchEvent(new CustomEvent('notifications-updated', { detail: { count: unread } }));
    }});
  }

  ngOnDestroy() {
    if (this.promotionTimer) {
      window.clearInterval(this.promotionTimer);
    }
    if (this.partnerTimer) {
      window.clearInterval(this.partnerTimer);
    }
  }

  startPromotionRotation() {
    this.promotionTimer = window.setInterval(() => {
      this.activePromotion.update(index => (index + 1) % this.promotions.length);
    }, 3000);
  }

  startPartnerRotation() {
    this.partnerTimer = window.setInterval(() => {
      this.activePartner.update(index => (index + 1) % this.partnerHospitals.length);
    }, 3000);
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
        this.doctors.set(
          data.slice(0, 4).map(doc => ({
            ...doc,
            imgPath: resolveDoctorPhoto(doc.imgPath, doc.fullName)
          }))
        );
        this.isLoadingDoctors.set(false);
      },
      error: () => this.isLoadingDoctors.set(false)
    });
  }

  getDoctorInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }
}