import { Component, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { forkJoin, of } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { EndPoints } from '../../Services/endpoints';

interface Appointment {
  id: number;
  firstName: string;
  lastName: string;
  patientId: number;
  appointmentDate: string;
  status: string;
  phone: string;
  email: string;
}

interface Doctor {
  id: number;
  name: string;
  specialization: string;
  phone: string;
  email: string;
  birthDate: string;
  address: string;
  licenseNumber: string;
  yearsOfExperience: number;
  hireDate: string;
  status: string;
  consultationFee: number;
  image: string;
}

@Component({
  selector: 'app-doctor-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './doctor-dashboard.component.html',
  styleUrls: ['./doctor-dashboard.component.css']
})
export class DoctorDashboardComponent implements OnInit {
  private endpoint = inject(EndPoints);

  doctor = signal<Doctor | null>(null);
  appointments: Appointment[] = [];
  activeTab = 'about';
  activeMenu = 'dashboard';

  patients: any[] = [];
  filteredPatients: any[] = [];
  availableSlots: any[] = [];
  medicalRecords: any[] = [];
  prescriptions: any[] = [];
  selectedPatientId: number | null = null;
  searchQuery = '';
  isLoadingRecords = false;

  stats = {
    totalPatients: 0,
    todayAppointments: 0,
    pendingBookings: 0,
    availableSlots: 0
  };

  currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  ngOnInit() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const doctorId = currentUser.userId ? parseInt(currentUser.userId) : 1;

    this.loadDoctorProfile(doctorId);
    this.loadAppointmentsWithPatients(doctorId); // ✅ FIX 1: جلب أسماء المرضى الحقيقية
    this.loadAvailableSlots(doctorId);
  }

  loadDoctorProfile(id: number) {
    this.endpoint.doctors.getById(id).subscribe({
      next: (d) => {
        this.doctor.set({
          id: d.id,
          name: d.fullName,
          specialization: d.specialization,
          phone: d.phone,
          email: d.email || 'doctor@clinic.com',
          birthDate: d.birthDate || '1980-01-01',
          address: d.address || '—',
          licenseNumber: d.licenseNumber,
          yearsOfExperience: d.yearsOfExperience,
          hireDate: d.hireDate,
          status: d.status,
          consultationFee: d.consultationFee,
          image: d.imgPath || '/assets/img/person/person-f-11.webp'
        });
      },
      error: (err) => console.error('Error loading doctor profile', err)
    });
  }

  // ✅ FIX 1: بنجيب الـ appointments الأول، بعدين بنجيب بيانات كل مريض من الـ API
  loadAppointmentsWithPatients(doctorId: number) {
    this.endpoint.appointments.getByDoctor(doctorId).pipe(
      switchMap((appts) => {
        // جيب الـ unique patient IDs
        const uniquePatientIds = [...new Set(appts.map((a: any) => a.patientId))];

        // جيب بيانات كل مريض بـ forkJoin (كلهم بالتوازي)
        const patientRequests = uniquePatientIds.map((pid: any) =>
          this.endpoint.patients.getById(pid).pipe(
            catchError(() => of({ id: pid, firstName: 'Patient', lastName: `#${pid}`, phone: 'N/A', email: 'N/A' }))
          )
        );

        return forkJoin({
          appointments: of(appts),
          patientDetails: patientRequests.length > 0 ? forkJoin(patientRequests) : of([])
        });
      })
    ).subscribe({
      next: ({ appointments, patientDetails }) => {
        // ابني map من patientId → بيانات المريض
        const patientMap = new Map<number, any>();
        (patientDetails as any[]).forEach(p => patientMap.set(p.id, p));

        // امبدا اعمل الـ appointments مع الأسماء الحقيقية
        this.appointments = (appointments as any[]).map(a => {
          const patient = patientMap.get(a.patientId);
          return {
            id: a.id,
            firstName: patient?.firstName || 'Patient',
            lastName: patient?.lastName || `#${a.patientId}`,
            patientId: a.patientId,
            appointmentDate: a.appointmentDate,
            status: a.status,
            phone: patient?.phone || 'N/A',
            email: patient?.email || 'N/A'
          };
        });

        this.derivePatients(patientDetails as any[]);
        this.calculateStats();
      },
      error: (err) => console.error('Error loading appointments with patients', err)
    });
  }

  loadAvailableSlots(doctorId: number) {
    this.endpoint.doctors.getTimeSlots(doctorId).subscribe({
      next: (slots) => {
        this.availableSlots = slots;
        this.calculateStats();
      },
      error: (err) => console.error('Error loading slots', err)
    });
  }

  // ✅ FIX 1: derivePatients بتستخدم الأسماء الحقيقية من الـ API
  derivePatients(patientDetails: any[]) {
    const uniqueIds = [...new Set(this.appointments.map(a => a.patientId))];
    const patientMap = new Map<number, any>();
    patientDetails.forEach(p => patientMap.set(p.id, p));

    this.patients = uniqueIds.map(id => {
      const lastAppt = [...this.appointments].reverse().find(a => a.patientId === id);
      const patientData = patientMap.get(id);
      return {
        id,
        name: patientData
          ? `${patientData.firstName} ${patientData.lastName}`
          : `Patient #${id}`,
        phone: patientData?.phone || 'N/A',
        email: patientData?.email || 'N/A',
        lastVisit: lastAppt?.appointmentDate,
        status: 'Active',
        appointmentsCount: this.appointments.filter(a => a.patientId === id).length
      };
    });

    this.filteredPatients = [...this.patients];
  }

  calculateStats() {
    const today = new Date().toDateString();
    this.stats = {
      totalPatients: this.patients.length,
      todayAppointments: this.appointments.filter(
        a => new Date(a.appointmentDate).toDateString() === today
      ).length,
      pendingBookings: this.appointments.filter(a => a.status === 'Pending').length,
      availableSlots: this.availableSlots.filter(s => !s.isBooked).length
    };
  }

  filterPatients() {
    if (!this.searchQuery.trim()) {
      this.filteredPatients = [...this.patients];
    } else {
      const query = this.searchQuery.toLowerCase();
      this.filteredPatients = this.patients.filter(p =>
        p.name.toLowerCase().includes(query) ||
        p.id.toString().includes(query)
      );
    }
  }

  // ✅ FIX 3: بدل ما ننقل لـ view تاني، بنفتح الـ records جوا الـ patients view
  loadMedicalHistory(patientId: number) {
    this.selectedPatientId = patientId;
    this.isLoadingRecords = true;
    this.medicalRecords = [];
    this.prescriptions = [];

    // Medical Records
    this.endpoint.medicalRecords.getByPatient(patientId).subscribe({
      next: (records) => {
        this.medicalRecords = records;
        this.isLoadingRecords = false;
      },
      error: (err) => {
        console.error('Error loading medical records', err);
        this.isLoadingRecords = false;
      }
    });

    // ✅ FIX 2: prescriptions مع guard - لو مش موجود مش هيكسر التطبيق
    if (this.endpoint.prescriptions?.getByPatient) {
      this.endpoint.prescriptions.getByPatient(patientId).pipe(
        catchError((err) => {
          console.warn('Prescriptions endpoint not available or failed', err);
          return of([]); // رجع array فاضي بدل ما يكسر
        })
      ).subscribe({
        next: (prescriptions: any[]) => {
          this.prescriptions = prescriptions;
        }
      });
    }
  }

  setActiveMenu(menu: string) {
    this.activeMenu = menu;
    // ✅ FIX 3: لو دخل على medical-records من الـ sidebar، بنبدأ بأول مريض تلقائي
    if (menu === 'medical-records') {
      if (this.patients.length > 0 && !this.selectedPatientId) {
        this.loadMedicalHistory(this.patients[0].id);
      }
    }
  }

  setActiveTab(tab: string) {
    this.activeTab = tab;
  }

  getInitials(name: string | undefined): string {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  getPatientName(patientId: number): string {
    const patient = this.patients.find(p => p.id === patientId);
    return patient?.name || `Patient #${patientId}`;
  }
}
