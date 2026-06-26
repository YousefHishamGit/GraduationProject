import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { EndPoints } from '../../../services/endpoints';
import { AuthService } from '../../../services/auth.service';
import { LanguageService } from '../../../services/language.service';
import { getDepartmentImage } from '../../../shared/department-assets';
import { RevenueReport } from '../../../interfaces/admin.interface';

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
  revenueReport = signal<RevenueReport | null>(null);
  revenueLoading = signal(false);

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

    this.loadRevenueReport();

    this.endpoint.appointments.getAll().subscribe({
      next: (a) => {
        this.appointments.set(a);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  loadRevenueReport() {
    this.revenueLoading.set(true);
    this.endpoint.admin.getRevenueReport().subscribe({
      next: (report) => {
        this.revenueReport.set(report);
        this.revenueLoading.set(false);
      },
      error: (err) => {
        console.error('Error fetching revenue report:', err);
        this.revenueLoading.set(false);
      }
    });
  }

  getChartPoints(): string {
    const report = this.revenueReport();
    if (!report || report.revenueByDate.length === 0) return '';
    
    const dates = [...report.revenueByDate].reverse(); // oldest to newest
    const maxVal = Math.max(...dates.map(d => d.amount), 100);
    const width = 600;
    const height = 150;
    const padding = 20;

    return dates.map((d, index) => {
      const x = padding + (index / (dates.length - 1)) * (width - padding * 2);
      const y = height - padding - (d.amount / maxVal) * (height - padding * 2);
      return `${x},${y}`;
    }).join(' ');
  }

  getChartFillPoints(): string {
    const points = this.getChartPoints();
    if (!points) return '';
    const width = 600;
    const height = 150;
    const padding = 20;
    
    const firstPointX = points.split(' ')[0].split(',')[0];
    const lastPointX = points.split(' ')[points.split(' ').length - 1].split(',')[0];
    
    return `${firstPointX},${height - padding} ${points} ${lastPointX},${height - padding}`;
  }

  getChartStartDate(): string {
    const report = this.revenueReport();
    if (!report || report.revenueByDate.length === 0) return '';
    return report.revenueByDate[report.revenueByDate.length - 1].date;
  }

  getChartMiddleDate(): string {
    const report = this.revenueReport();
    if (!report || report.revenueByDate.length === 0) return '';
    const midIndex = Math.floor(report.revenueByDate.length / 2);
    return report.revenueByDate[midIndex].date;
  }

  getChartEndDate(): string {
    const report = this.revenueReport();
    if (!report || report.revenueByDate.length === 0) return '';
    return report.revenueByDate[0].date;
  }

  setTab(tab: string) {
    this.activeTab.set(tab);
    this.sidebarOpen.set(false);

    // Record last opened timestamps so "new" badges clear when user opens the section
    const now = new Date().toISOString();
    if (tab === 'doctors') localStorage.setItem('adminLastOpenedDoctors', now);
    if (tab === 'patients') localStorage.setItem('adminLastOpenedPatients', now);
    if (tab === 'appointments') localStorage.setItem('adminLastOpenedAppointments', now);
    if (tab === 'departments') localStorage.setItem('adminLastOpenedDepartments', now);
  }

  // --- New item counters (show unread/new badges only) ---
  private parseDateSafe(item: any, keys: string[]) {
    for (const k of keys) {
      if (!item) continue;
      const v = item[k];
      if (!v) continue;
      const d = new Date(v);
      if (!isNaN(d.getTime())) return d;
    }
    return null;
  }

  getNewDoctorsCount(): number {
    const last = localStorage.getItem('adminLastOpenedDoctors');
    if (!last) return this.doctors().length;
    const lastDate = new Date(last);
    return this.doctors().filter(d => {
      const dt = this.parseDateSafe(d, ['createdOn', 'hireDate', 'createdAt']);
      return dt ? dt > lastDate : false;
    }).length;
  }

  getNewPatientsCount(): number {
    const last = localStorage.getItem('adminLastOpenedPatients');
    if (!last) return this.patients().length;
    const lastDate = new Date(last);
    return this.patients().filter(p => {
      const dt = this.parseDateSafe(p, ['createdOn', 'registeredOn', 'createdAt']);
      return dt ? dt > lastDate : false;
    }).length;
  }

  getNewAppointmentsCount(): number {
    const last = localStorage.getItem('adminLastOpenedAppointments');
    if (!last) return 0;
    const lastDate = new Date(last);
    return this.appointments().filter(a => {
      const dt = this.parseDateSafe(a, ['createdOn', 'createdAt']);
      return dt ? dt > lastDate : false;
    }).length;
  }

  getNewDepartmentsCount(): number {
    const last = localStorage.getItem('adminLastOpenedDepartments');
    if (!last) return 0;
    const lastDate = new Date(last);
    return this.departments().filter(d => {
      const dt = this.parseDateSafe(d, ['createdOn', 'createdAt']);
      return dt ? dt > lastDate : false;
    }).length;
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