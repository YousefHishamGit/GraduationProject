import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { EndPoints } from '../../../services/endpoints';
import { AuthService } from '../../../services/auth.service';
import { LanguageService } from '../../../services/language.service';
import { getDepartmentImage } from '../../../shared/department-assets';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, DatePipe],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {
  private endpoint = inject(EndPoints);
  private authService = inject(AuthService);
  private router = inject(Router);
  public language = inject(LanguageService);

  activeTab = signal('dashboard');
  sidebarOpen = signal(false);
  isLoading = signal(true);
  currentUser = signal<any>(null);

  // Data
  doctors = signal<any[]>([]);
  patients = signal<any[]>([]);
  appointments = signal<any[]>([]);
  departments = signal<any[]>([]);
  confirmedCount = computed(() => this.appointments().filter(a => a.status === 'Confirmed').length);
  pendingCount = computed(() => this.appointments().filter(a => a.status === 'Pending').length);
  completedCount = computed(() => this.appointments().filter(a => a.status === 'Completed').length);
  cancelledCount = computed(() => this.appointments().filter(a => a.status === 'Cancelled').length);

  // Modals
  showDoctorModal = signal(false);
  showDeptModal = signal(false);
  isSubmitting = signal(false);
  successMsg = signal('');
  errorMsg = signal('');

  // New Doctor Form
  newDoctor = this.getEmptyDoctor();

  // New Department Form
  newDept = { departmentName: '', description: '' };

  getEmptyDoctor() {
    return {
      firstName: '', lastName: '', email: '', password: '',
      nationalID: '', birthDate: '', gender: 0, phone: '', address: '',
      licenseNumber: '', specialization: '', departmentId: 0,
      yearsOfExperience: 0, consultationFee: 0,
      hireDate: new Date().toISOString().split('T')[0], bio: ''
    };
  }

  ngOnInit() {
    this.currentUser.set(this.authService.getCurrentUser());
    this.loadAll();
  }

  loadAll() {
    this.isLoading.set(true);

    this.endpoint.doctors.getAll().subscribe({
      next: (d) => this.doctors.set(d),
      error: () => { }
    });

    this.endpoint.patients.getAll().subscribe({
      next: (p) => this.patients.set(p),
      error: () => { }
    });

    this.endpoint.departments.getAll().subscribe({
      next: (d) => this.departments.set(d),
      error: () => { }
    });

    this.endpoint.appointments.getAll().subscribe({
      next: (a) => {
        this.appointments.set(a);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  setTab(tab: string) {
    this.activeTab.set(tab);
    this.sidebarOpen.set(false);
  }

  // Stats
  getTodayAppointments() {
    const today = new Date().toISOString().split('T')[0];
    return this.appointments().filter(a => a.appointmentDate?.startsWith(today)).length;
  }

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      Confirmed: 'badge-success', Pending: 'badge-warning',
      Cancelled: 'badge-danger', Completed: 'badge-info',
      Active: 'badge-success', Inactive: 'badge-secondary', OnLeave: 'badge-warning'
    };
    return map[status] || 'badge-secondary';
  }

  getInitials(name: string): string {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '??';
  }

  // ── Add Doctor ──
  openDoctorModal() {
    this.newDoctor = this.getEmptyDoctor();
    this.successMsg.set('');
    this.errorMsg.set('');
    this.showDoctorModal.set(true);
  }

  closeDoctorModal() {
    this.showDoctorModal.set(false);
  }

  submitDoctor() {
    if (!this.newDoctor.firstName || !this.newDoctor.email || !this.newDoctor.password) {
      this.errorMsg.set('Please fill all required fields');
      return;
    }

    this.isSubmitting.set(true);
    this.errorMsg.set('');

    const dto = {
      ...this.newDoctor,
      gender: Number(this.newDoctor.gender),
      departmentId: Number(this.newDoctor.departmentId),
      yearsOfExperience: Number(this.newDoctor.yearsOfExperience),
      consultationFee: Number(this.newDoctor.consultationFee),
      address: this.newDoctor.address || 'N/A',
      phone: this.newDoctor.phone || '00000000000'
    };

    this.endpoint.auth.registerDoctor(dto as any).subscribe({
      next: () => {
        this.successMsg.set('Doctor added successfully!');
        this.isSubmitting.set(false);
        this.endpoint.doctors.getAll().subscribe(d => this.doctors.set(d));
        setTimeout(() => this.closeDoctorModal(), 1500);
      },
      error: (err) => {
        this.errorMsg.set(err.error?.message || 'Failed to add doctor.');
        this.isSubmitting.set(false);
      }
    });
  }

  // ── Add Department ──
  openDeptModal() {
    this.newDept = { departmentName: '', description: '' };
    this.successMsg.set('');
    this.errorMsg.set('');
    this.showDeptModal.set(true);
  }

  closeDeptModal() {
    this.showDeptModal.set(false);
  }

  submitDept() {
    if (!this.newDept.departmentName) {
      this.errorMsg.set('Department name is required');
      return;
    }

    this.isSubmitting.set(true);
    this.errorMsg.set('');

    this.endpoint.departments.create(this.newDept).subscribe({
      next: () => {
        this.successMsg.set('Department created successfully!');
        this.isSubmitting.set(false);
        this.endpoint.departments.getAll().subscribe(d => this.departments.set(d));
        setTimeout(() => this.closeDeptModal(), 1500);
      },
      error: (err) => {
        this.errorMsg.set(err.error?.message || 'Failed to create department.');
        this.isSubmitting.set(false);
      }
    });
  }

  deleteDoctor(id: number) {
    if (!confirm('Are you sure you want to delete this doctor?')) return;
    this.endpoint.doctors.delete(id).subscribe({
      next: () => this.doctors.update(d => d.filter(doc => doc.id !== id))
    });
  }

// admin-dashboard.component.ts

confirmDoctor(id: number) {
  if (!confirm('Are you sure you want to confirm and activate this doctor account?')) return;

  // البحث عن الطبيب من القائمة الحالية
  const doctor = this.doctors().find(d => d.id === id);
  if (!doctor) {
    alert('Doctor not found');
    return;
  }

  // البحث عن القسم الذي ينتمي إليه الطبيب باستخدام departmentName
  const department = this.departments().find(d => d.departmentName === doctor.departmentName);
  if (!department) {
    alert('Department not found for this doctor. Please check department list.');
    return;
  }

  // بناء كائن التحديث مع جميع الحقول المطلوبة (خاصة departmentId)
  const updateData: any = {
    specialization: doctor.specialization,
    departmentId: department.id,          // المفتاح الأساسي لحل المشكلة
    yearsOfExperience: doctor.yearsOfExperience,
    consultationFee: doctor.consultationFee,
    bio: doctor.bio,
    status: 'Active',                    // الحالة المطلوب تغييرها
    phone: doctor.phone,
    address: doctor.address
  };

  // إرسال طلب التحديث
  this.endpoint.doctors.update(id, updateData).subscribe({
    next: () => {
      alert('Doctor account confirmed successfully!');
      // إعادة تحميل قائمة الأطباء لتحديث الحالة في الواجهة
      this.endpoint.doctors.getAll().subscribe(d => this.doctors.set(d));
    },
    error: (err) => {
      console.error('Error confirming doctor:', err);
      alert(err.error?.message || 'Failed to confirm doctor. Please try again.');
    }
  });
}

  logout() {
    this.authService.logout();
  }


 
// ── Toggle Doctor Active/Inactive ──
toggleDoctorStatus(doctor: any) {
  const newStatus = doctor.status === 'Active' ? 'Inactive' : 'Active';
  const actionText = newStatus === 'Active' ? 'activate' : 'deactivate';

  if (!confirm(`Are you sure you want to ${actionText} Dr. ${doctor.fullName}?`)) return;

  // البحث عن القسم باستخدام departmentName (كما في confirmDoctor)
  const department = this.departments().find(d => d.departmentName === doctor.departmentName);
  if (!department) {
    alert('Department not found for this doctor. Cannot update status.');
    return;
  }

  // تجهيز بيانات التحديث بنفس حقول confirmDoctor + أي حقول إضافية مطلوبة
  const updateData: any = {
    specialization: doctor.specialization,
    departmentId: department.id,
    yearsOfExperience: doctor.yearsOfExperience,
    consultationFee: doctor.consultationFee,
    bio: doctor.bio,
    status: newStatus,
    phone: doctor.phone || '',
    address: doctor.address || '',
    // إضافة حقول أخرى قد يتطلبها الـ API
    licenseNumber: doctor.licenseNumber || '',
    nationalID: doctor.nationalID || '',
    birthDate: doctor.birthDate || '',
    gender: doctor.gender ?? 0,
    hireDate: doctor.hireDate || new Date().toISOString().split('T')[0],
    email: doctor.email || '',
    // قد يحتاج الـ API إلى firstName و lastName إذا لم يكن fullName موجوداً
    firstName: doctor.fullName?.split(' ')[0] || '',
    lastName: doctor.fullName?.split(' ').slice(1).join(' ') || '',
  };

  this.endpoint.doctors.update(doctor.id, updateData).subscribe({
    next: () => {
      alert(`Doctor ${actionText}d successfully!`);
      // تحديث القائمة المحلية مباشرة
      this.doctors.update(doctors =>
        doctors.map(d => d.id === doctor.id ? { ...d, status: newStatus } : d)
      );
    },
    error: (err) => {
      console.error('Error toggling status:', err);
      alert(err.error?.message || `Failed to ${actionText} doctor. Please try again.`);
    }
  });
}

  private readonly deptIcons: Record<string, string> = {
    Cardiology: 'fas fa-heartbeat',
    Neurology: 'fas fa-brain',
    Orthopedics: 'fas fa-bone',
    Pediatrics: 'fas fa-baby',
    Dermatology: 'fas fa-allergies',
    Ophthalmology: 'fas fa-eye',
    'General Surgery': 'fas fa-user-md',
    'Internal Medicine': 'fas fa-stethoscope',
  };

  getDeptImage(name: string): string | null {
    return getDepartmentImage(name);
  }

  getDeptIcon(name: string): string {
    return this.deptIcons[name] || 'fas fa-hospital-user';
  }
}