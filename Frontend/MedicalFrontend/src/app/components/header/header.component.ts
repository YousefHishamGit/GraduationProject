import { Component, OnInit, inject, signal, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { LanguageService } from '../../services/language.service';

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

  public language = inject(LanguageService);
  isMenuOpen = signal(false);
  isScrolled = signal(false);
  isLoggedIn = signal(false);
  userRole = signal('');
  userName = signal('');

  @HostListener('window:scroll')
  onScroll() {
    this.isScrolled.set(window.scrollY > 20);
  }

  ngOnInit() {
    this.checkAuth();
  }

  checkAuth() {
    const user = this.authService.getCurrentUser();
    if (user) {
      this.isLoggedIn.set(true);
      this.userRole.set(user.role);
      this.userName.set(user.fullName);
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
    this.closeMenu();
  }
}