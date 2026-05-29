import { Component, OnInit, inject, signal, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from '../../services/auth.service';
import { LanguageService } from '../../services/language.service';
import { EndPoints } from '../../services/endpoints';
import { resolveMediaUrl } from '../../shared/media-url.util';
import { resolveDoctorPhoto } from '../../shared/doctor-assets';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  private endpoint = inject(EndPoints);

  public language = inject(LanguageService);
  isMenuOpen = signal(false);
  isScrolled = signal(false);
  isLoggedIn = signal(false);
  userRole = signal('');
  userName = signal('');
  userImgUrl = signal<string | null>(null);

  @HostListener('window:scroll')
  onScroll() {
    this.isScrolled.set(window.scrollY > 20);
  }

  ngOnInit() {
    this.checkAuth();
    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe(() => this.checkAuth());
  }

  @HostListener('window:user-profile-updated')
  onProfileUpdated() {
    this.loadUserAvatar();
  }

  checkAuth() {
    const user = this.authService.getCurrentUser();
    if (user) {
      this.isLoggedIn.set(true);
      this.userRole.set(user.role);
      this.userName.set(user.fullName);
      this.loadUserAvatar();
    } else {
      this.userImgUrl.set(null);
    }
  }

  loadUserAvatar() {
    const userId = this.authService.getUserIdFromToken();
    if (!userId) {
      return;
    }

    const role = this.userRole();
    if (role === 'Patient') {
      this.endpoint.patients.getByUserId(userId).subscribe({
        next: (patient) => {
          const url = resolveMediaUrl(patient.imgPath);
          this.userImgUrl.set(url || null);
        },
        error: () => this.userImgUrl.set(null)
      });
      return;
    }

    if (role === 'Doctor') {
      this.endpoint.doctors.getByUserId(userId).subscribe({
        next: (doctor) => {
          const url = resolveDoctorPhoto(doctor.imgPath, doctor.fullName);
          this.userImgUrl.set(url || null);
        },
        error: () => this.userImgUrl.set(null)
      });
    }
  }

  toggleMenu() {
    this.isMenuOpen.update(v => !v);
  }

  closeMenu() {
    this.isMenuOpen.set(false);
  }

  getDashboardRoute(): string {
    switch (this.userRole()) {
      case 'Admin': return '/admin-dashboard';
      case 'Doctor': return '/doctor-dashboard';
      case 'Patient': return '/patient-dashboard';
      default: return '/';
    }
  }

  logout() {
    this.authService.logout();
    this.isLoggedIn.set(false);
    this.userImgUrl.set(null);
    this.closeMenu();
  }
}