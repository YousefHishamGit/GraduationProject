import { Component, signal, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { EndPoints } from '../../../Services/endpoints';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, FormsModule, DatePipe],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {
  private endpoint = inject(EndPoints);
  private router = inject(Router);

  activeTab = signal<string>('dashboard');
  isLoading = signal<boolean>(true);
  showAddDoctorModal = signal<boolean>(false);
  showAddDepartmentModal = signal<boolean>(false);
  isSubmitting = signal<boolean>(false);
  successMessage = signal<string>('');
  errorMessage = signal<string>('');

  // Stats
  stats = signal([
    { title: 'Total Doctors', value: 0, icon: 'fas fa-user-md', color: '#0d6efd' },
    { title: 'Total Patients', value: 0, icon: 'fas fa-users', color: '#17a2b8' },
    { title: "Today's Appointments", value: 0, icon: 'fas fa-calendar-check', color: '#28a745' },
    { title: 'Total Appointments', value: 0, icon: 'fas fa-calendar', color: '#ffc107' }
  ]);

  // Data
  doctors = signal<any[]>([]);
  patients = signal<any[]>([]);
  appointments = signal<any[]>([]);
  departments = signal<any[]>([]);
  recentAppointments = signal<any[]>([]);

  // Add Doctor Form
  newDoctor = {
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    nationalID: '',
    birthDate: '',
    gender: 0,
    phone: '',
    address: '',
    licenseNumber: '',
    specialization: '',
    departmentId: 0,
    yearsOfExperience: 0,
    consultationFee: 0,
    hireDate: new Date().toISOString().split('T')[0],
    bio: ''
  };

  // Add Department Form
  newDepartment = {
    departmentName: '',
    description: ''
  };

  ngOnInit() {
    this.loadAll();
  }

  loadAll() {
    this.isLoading.set(true);

    this.endpoint.doctors.getAll().subscribe({
      next: (data) => {
        this.doctors.set(data);
        this.updateStat('Total Doctors', data.length);
      },
      error: (err) => console.error(err)
    });

    this.endpoint.patients.getAll().subscribe({
      next: (data) => {
        this.patients.set(data);
        this.updateStat('Total Patients', data.length);
      },
      error: (err) => console.error(err)
    });

    this.endpoint.appointments.getAll().subscribe({
      next: (data) => {
        this.appointments.set(data);
        this.updateStat('Total Appointments', data.length);
        const today = new Date().toISOString().split('T')[0];
        const todayCount = data.filter(a => a.appointmentDate?.startsWith(today)).length;
        this.updateStat("Today's Appointments", todayCount);
        this.recentAppointments.set(data.slice(-5).reverse());
        this.isLoading.set(false);
      },
      error: (err) => { console.error(err); this.isLoading.set(false); }
    });

    this.endpoint.departments.getAll().subscribe({
      next: (data) => this.departments.set(data),
      error: (err) => console.error(err)
    });
  }

  updateStat(title: string, value: number) {
    this.stats.update(current =>
      current.map(s => s.title === title ? { ...s, value } : s)
    );
  }

  setTab(tab: string) {
    this.activeTab.set(tab);
  }

  openAddDoctorModal() {
    this.showAddDoctorModal.set(true);
    this.successMessage.set('');
    this.errorMessage.set('');
  }

  closeModal() {
    this.showAddDoctorModal.set(false);
    this.resetForm();
  }

  resetForm() {
    this.newDoctor = {
      firstName: '', lastName: '', email: '', password: '',
      nationalID: '', birthDate: '', gender: 0, phone: '', address: '',
      licenseNumber: '', specialization: '', departmentId: 0,
      yearsOfExperience: 0, consultationFee: 0,
      hireDate: new Date().toISOString().split('T')[0], bio: ''
    };
  }

  addDoctor() {
    this.errorMessage.set('');
    this.isSubmitting.set(true);

    this.endpoint.auth.registerDoctor(this.newDoctor as any).subscribe({
      next: () => {
        this.successMessage.set('Doctor added successfully!');
        this.isSubmitting.set(false);
        this.endpoint.doctors.getAll().subscribe(data => this.doctors.set(data));
        setTimeout(() => this.closeModal(), 1500);
      },
      error: (err) => {
        this.errorMessage.set(err.error?.message || 'Failed to add doctor.');
        this.isSubmitting.set(false);
      }
    });
  }

  openAddDepartmentModal() {
    this.showAddDepartmentModal.set(true);
    this.successMessage.set('');
    this.errorMessage.set('');
  }

  closeDepartmentModal() {
    this.showAddDepartmentModal.set(false);
    this.resetDepartmentForm();
  }

  resetDepartmentForm() {
    this.newDepartment = {
      departmentName: '',
      description: ''
    };
  }

  addDepartment() {
    this.errorMessage.set('');
    this.isSubmitting.set(true);

    this.endpoint.departments.create(this.newDepartment as any).subscribe({
      next: () => {
        this.successMessage.set('Department added successfully!');
        this.isSubmitting.set(false);
        this.endpoint.departments.getAll().subscribe(data => this.departments.set(data));
        setTimeout(() => this.closeDepartmentModal(), 1500);
      },
      error: (err) => {
        this.errorMessage.set(err.error?.message || 'Failed to add department.');
        this.isSubmitting.set(false);
      }
    });
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'Confirmed': return 'badge-success';
      case 'Pending': return 'badge-warning';
      case 'Cancelled': return 'badge-danger';
      case 'Completed': return 'badge-info';
      default: return 'badge-secondary';
    }
  }

  logout() {
    localStorage.clear();
    this.router.navigate(['/login']);
  }
}