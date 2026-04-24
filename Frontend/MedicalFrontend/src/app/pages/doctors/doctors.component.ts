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
  experience: number;
  rating: number;
  reviews: number;
  image: string;
  availability: string;
  consultationFee: number;
  departmentId: number;
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

  searchQuery = signal<string>('');
  selectedSpecialty = signal<string>('All Specialties');
  
  allDoctors = signal<Doctor[]>([]);

  specialties = computed(() => {
    const specs = new Set(this.allDoctors().map(d => d.specialization));
    return ['All Specialties', ...Array.from(specs)];
  });

  filteredDoctors = computed(() => {
    return this.allDoctors().filter(doctor => {
      const matchesSearch = doctor.name.toLowerCase().includes(this.searchQuery().toLowerCase()) ||
                          doctor.specialization.toLowerCase().includes(this.searchQuery().toLowerCase());
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
          experience: d.yearsOfExperience,
          rating: 4.8, // Mock for now
          reviews: 120, // Mock for now
          image: d.imgPath || '/assets/img/person/person-f-11.webp',
          availability: d.status,
          consultationFee: d.consultationFee,
          departmentId: d.departmentId
        })));
      },
      error: (err) => console.error('Error loading doctors', err)
    });
  }

  setSpecialty(specialty: string) {
    this.selectedSpecialty.set(specialty);
  }
}
