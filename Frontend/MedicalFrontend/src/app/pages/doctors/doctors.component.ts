import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { EndPoints } from '../../services/endpoints';
import { DoctorResponseDto } from '../../interfaces/doctor.interface';

@Component({
  selector: 'app-doctors',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './doctors.component.html',
  styleUrls: ['./doctors.component.css']
})
export class DoctorsComponent implements OnInit {
  private endpoint = inject(EndPoints);

  allDoctors = signal<DoctorResponseDto[]>([]);
  isLoading = signal(true);

  searchTerm = signal('');
  selectedDept = signal('');

  filteredDoctors = computed(() => {
    const term = this.searchTerm().toLowerCase();
    const dept = this.selectedDept();

    return this.allDoctors().filter(doc => {
      const matchSearch = !term ||
        doc.fullName.toLowerCase().includes(term) ||
        doc.specialization.toLowerCase().includes(term);

      const matchDept = !dept ||
        doc.departmentName === dept;

      return matchSearch && matchDept;
    });
  });

  uniqueDepartments = computed(() => {
    const names = this.allDoctors()
      .map(d => d.departmentName)
      .filter(Boolean);
    return [...new Set(names)];
  });

  // Modal
  selectedDoctor = signal<DoctorResponseDto | null>(null);
  timeSlots = signal<any[]>([]);
  reviews = signal<any[]>([]);
  rating = signal<number>(0);
  showModal = signal(false);
  modalTab = signal<'info' | 'slots' | 'reviews'>('info');

  ngOnInit() {
    this.loadDoctors();
  }

  loadDoctors() {
    this.endpoint.doctors.getAll().subscribe({
      next: (data) => {
        this.allDoctors.set(data);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  openDoctor(doc: DoctorResponseDto) {
    this.selectedDoctor.set(doc);
    this.showModal.set(true);
    this.modalTab.set('info');
    this.loadDoctorDetails(doc.id);
  }

  loadDoctorDetails(id: number) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    this.endpoint.doctors.getTimeSlots(id, today.toISOString()).subscribe({
      next: (data) => {
        this.timeSlots.set(data.slice(0, 8));
      },
      error: (err) => {
        console.error(err);
        this.timeSlots.set([]);
      }
    });

    this.endpoint.doctors.getReviews(id).subscribe({
      next: (data) => {
        this.reviews.set(data);

        if (data?.length > 0) {
          const avg = data.reduce((s, r) => s + r.rating, 0) / data.length;
          this.rating.set(Number(avg.toFixed(1)));
        } else {
          this.rating.set(0);
        }
      },
      error: () => {
        this.reviews.set([]);
        this.rating.set(0);
      }
    });
  }

  closeModal() {
    this.showModal.set(false);
    this.selectedDoctor.set(null);
  }

  clearFilters() {
    this.searchTerm.set('');
    this.selectedDept.set('');
  }

  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  getStars(rating: number): number[] {
    return Array(5).fill(0).map((_, i) => i < Math.round(rating) ? 1 : 0);
  }

  formatTime(time: string): string {
    if (!time) return '';
    const date = new Date(time);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  formatDate(time: string): string {
    if (!time) return '';
    const date = new Date(time);
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  }
}