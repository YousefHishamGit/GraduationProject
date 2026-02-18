import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

interface Doctor {
  id: number;
  name: string;
  DoctorImgUrl: string;
  Specialization: string;
  YearsOfExperience: number;
  department?: string;
  available?: boolean;
}

@Component({
  selector: 'app-doctors',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './doctors.component.html',
  styleUrls: ['./doctors.component.css']
})
export class DoctorsComponent implements OnInit {
  doctors: Doctor[] = [
    {
      id: 1,
      name: 'Dr. Sarah Johnson',
      DoctorImgUrl: '/assets/img/person/person-f-11.webp',
      Specialization: 'Cardiologist',
      YearsOfExperience: 15,
      department: 'cardiology',
      available: true
    },
    {
      id: 2,
      name: 'Dr. Michael Brown',
      DoctorImgUrl: '/assets/img/person/person-m-12.webp',
      Specialization: 'Neurologist',
      YearsOfExperience: 12,
      department: 'neurology',
      available: true
    },
    {
      id: 3,
      name: 'Dr. Lisa Miller',
      DoctorImgUrl: '/assets/img/person/person-f-12.webp',
      Specialization: 'Orthopedic Surgeon',
      YearsOfExperience: 10,
      department: 'orthopedics',
      available: true
    },
    {
      id: 4,
      name: 'Dr. David Wilson',
      DoctorImgUrl: '/assets/img/person/person-m-13.webp',
      Specialization: 'Pediatrician',
      YearsOfExperience: 18,
      department: 'pediatrics',
      available: true
    },
    {
      id: 5,
      name: 'Dr. Jennifer Lee',
      DoctorImgUrl: '/assets/img/person/person-f-13.webp',
      Specialization: 'Dermatologist',
      YearsOfExperience: 8,
      department: 'dermatology',
      available: false
    },
    {
      id: 6,
      name: 'Dr. Robert Chen',
      DoctorImgUrl: '/assets/img/person/person-m-7.webp',
      Specialization: 'General Surgeon',
      YearsOfExperience: 14,
      department: 'surgery',
      available: true
    }
  ];

  filteredDoctors: Doctor[] = [];
  searchTerm = '';
  departmentFilter = '';
  experienceFilter = '';

  showModal = false;
  selectedDoctor: Doctor | null = null;
  selectedTimeSlot: string | null = null;

  timeSlots = [
    '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
    '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM'
  ];

  ngOnInit() {
    this.filteredDoctors = [...this.doctors];
  }

  filterDoctors() {
    this.filteredDoctors = this.doctors.filter(doctor => {
      const matchesSearch = !this.searchTerm ||
        doctor.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        doctor.Specialization.toLowerCase().includes(this.searchTerm.toLowerCase());

      const matchesDepartment = !this.departmentFilter || doctor.department === this.departmentFilter;

      const matchesExperience = !this.experienceFilter ||
        doctor.YearsOfExperience >= parseInt(this.experienceFilter);

      return matchesSearch && matchesDepartment && matchesExperience;
    });
  }

  viewDoctorDetails(doctor: Doctor) {
    this.selectedDoctor = doctor;
    this.selectedTimeSlot = null;
    this.showModal = true;
    document.body.style.overflow = 'hidden';
  }

  closeModal(event?: MouseEvent) {
    if (!event || event.target === event.currentTarget) {
      this.showModal = false;
      this.selectedDoctor = null;
      this.selectedTimeSlot = null;
      document.body.style.overflow = 'auto';
    }
  }

  selectTimeSlot(slot: string) {
    this.selectedTimeSlot = slot;
  }
}
