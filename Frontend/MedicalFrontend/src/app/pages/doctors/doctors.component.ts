import { Component, signal, computed, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { EndPoints } from '../../Services/endpoints';
import { DoctorResponseDto } from '../../interfaces/doctor.interface';

interface Doctor {
  id: number;
  name: string;
  specialization: string;
  departmentName: string;
  location: string;
  experience: number;
  rating: number;
  reviews: number;
  image: string;
  availability: string;
  consultationFee: number;
  departmentId: number;
  DoctorImgUrl: string;
  Specialization: string;
  YearsOfExperience: number;
}

@Component({
  selector: 'app-doctors',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './doctors.component.html',
  styleUrls: ['./doctors.component.css']
})
export class DoctorsComponent implements OnInit {
  private endpoint = inject(EndPoints);

  // Search & Filter
  searchTerm = '';
  departmentFilter = '';
  experienceFilter = '';
  searchQuery = signal<string>('');
  selectedSpecialty = signal<string>('All Specialties');

  // Modal
  showModal = false;
  selectedDoctor: Doctor | null = null;
  timeSlots: any[] = [];
  selectedTimeSlot: any = null;

  allDoctors = signal<Doctor[]>([]);

  specialties = computed(() => {
    const specs = new Set(this.allDoctors().map(d => d.specialization));
    return ['All Specialties', ...Array.from(specs)];
  });

  filteredDoctors = computed(() => {
    return this.allDoctors().filter(doctor => {
      const matchesSearch = doctor.name.toLowerCase()
        .includes(this.searchQuery().toLowerCase()) ||
        doctor.specialization.toLowerCase()
        .includes(this.searchQuery().toLowerCase());
      const matchesSpecialty = this.selectedSpecialty() === 'All Specialties' ||
        doctor.specialization === this.selectedSpecialty();
      return matchesSearch && matchesSpecialty;
    });
  });

  ngOnInit() {
    this.loadDoctors();
  }

  loadDoctors() {
    this.endpoint.doctors.getAll().subscribe({
      next: (data) => {
        this.allDoctors.set(data.map(d => ({
          id: d.id,
          name: d.fullName,
          specialization: d.specialization,
          departmentName: d.departmentName,
          location: d.address || 'N/A',
          Specialization: d.specialization,
          experience: d.yearsOfExperience,
          YearsOfExperience: d.yearsOfExperience,
          rating: 4.8,
          reviews: 120,
          image: d.imgPath || '/assets/img/person/person-f-11.webp',
          DoctorImgUrl: d.imgPath || '/assets/img/person/person-f-11.webp',
          availability: d.status,
          consultationFee: d.consultationFee,
          departmentId: 0
        })));
      },
      error: (err) => console.error('Error loading doctors', err)
    });
  }

  filterDoctors() {
    this.searchQuery.set(this.searchTerm);
  }

  setSpecialty(specialty: string) {
    this.selectedSpecialty.set(specialty);
  }

  viewDoctorDetails(doctor: Doctor) {
    this.selectedDoctor = doctor;
    this.showModal = true;
    this.loadTimeSlots(doctor.id);
  }

  loadTimeSlots(doctorId: number) {
    this.endpoint.doctors.getTimeSlots(doctorId).subscribe({
      next: (data) => this.timeSlots = data,
      error: (err) => console.error('Error loading time slots', err)
    });
  }

  selectTimeSlot(slot: any) {
    this.selectedTimeSlot = slot;
  }

  closeModal(event?: Event) {
    if (!event || event.target === event.currentTarget) {
      this.showModal = false;
      this.selectedDoctor = null;
      this.selectedTimeSlot = null;
    }
  }
}