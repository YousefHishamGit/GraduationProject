import { Routes } from '@angular/router';
import { authGuard } from './guard/auth.guard';
import { roleGuard } from './guard/role.guard';

export const routes: Routes = [
  // ── Public ───────────────────────────────────────────
  {
    path: '',
    loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'signup',
    loadComponent: () => import('./pages/signup/signup.component').then(m => m.SignupComponent)
  },
  {
    path: 'doctors',
    loadComponent: () => import('./pages/doctors/doctors.component').then(m => m.DoctorsComponent)
  },
  {
    path: 'departments',
    loadComponent: () => import('./pages/departments/departments.component').then(m => m.DepartmentsComponent)
  },

  // ── Patient ───────────────────────────────────────────
  {
    path: 'patient-dashboard',
    loadComponent: () => import('./pages/patient-dashboard/patient-dashboard.component').then(m => m.PatientDashboardComponent),
    // canActivate: [authGuard, roleGuard(['Patient'])]
  },
  {
    path: 'appointment',
    loadComponent: () => import('./pages/appointment/appointment.component').then(m => m.AppointmentComponent),
    canActivate: [authGuard]
  },
  {
    path: 'chatbot',
    loadComponent: () => import('./pages/chatbot/chatbot.component').then(m => m.ChatbotComponent),
    canActivate: [authGuard]
  },

  // ── Doctor ────────────────────────────────────────────
  {
    path: 'doctor-dashboard',
    loadComponent: () => import('./pages/doctor-dashboard/doctor-dashboard.component').then(m => m.DoctorDashboardComponent),
    canActivate: [authGuard, roleGuard(['Doctor'])]
  },

  // ── Admin ─────────────────────────────────────────────
  {
    path: 'admin',
    loadComponent: () => import('./pages/admin/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [authGuard, roleGuard(['Admin'])]
  },

  // ── Fallback ──────────────────────────────────────────
  { path: '**', redirectTo: '' }
];