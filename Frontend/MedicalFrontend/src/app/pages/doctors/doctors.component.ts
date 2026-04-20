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
    { id: 1, name: 'Dr. Sarah Johnson', DoctorImgUrl: '/assets/img/person/person-f-11.webp', Specialization: 'Cardiologist', YearsOfExperience: 15, department: 'Cardiology', available: true },
    { id: 2, name: 'Dr. Michael Brown', DoctorImgUrl: '/assets/img/person/person-m-12.webp', Specialization: 'Neurologist', YearsOfExperience: 12, department: 'Neurology', available: true },
    { id: 3, name: 'Dr. Lisa Miller', DoctorImgUrl: '/assets/img/person/person-f-12.webp', Specialization: 'Orthopedic Surgeon', YearsOfExperience: 10, department: 'Orthopedics', available: true },
    { id: 4, name: 'Dr. David Wilson', DoctorImgUrl: '/assets/img/person/person-m-13.webp', Specialization: 'Pediatrician', YearsOfExperience: 18, department: 'Pediatrics', available: true },
    { id: 5, name: 'Dr. Jennifer Lee', DoctorImgUrl: '/assets/img/person/person-f-13.webp', Specialization: 'Dermatologist', YearsOfExperience: 8, department: 'Dermatology', available: false },
    { id: 6, name: 'Dr. Robert Chen', DoctorImgUrl: '/assets/img/person/person-m-7.webp', Specialization: 'General Surgeon', YearsOfExperience: 14, department: 'Surgery', available: true },
    { id: 7, name: 'Dr. Emily Davis', DoctorImgUrl: '/assets/img/person/person-f-5.webp', Specialization: 'Ophthalmologist', YearsOfExperience: 11, department: 'Ophthalmology', available: true },
    { id: 8, name: 'Dr. James Smith', DoctorImgUrl: '/assets/img/person/person-m-3.webp', Specialization: 'Dentist', YearsOfExperience: 9, department: 'Dentistry', available: true },
    { id: 9, name: 'Dr. Maria Garcia', DoctorImgUrl: '/assets/img/person/person-f-9.webp', Specialization: 'Internal Medicine', YearsOfExperience: 16, department: 'Internal Medicine', available: true },
    { id: 10, name: 'Dr. John Doe', DoctorImgUrl: '/assets/img/person/person-m-9.webp', Specialization: 'Psychiatrist', YearsOfExperience: 13, department: 'Mental Health', available: false }
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

  get uniqueDepartments() {
    return [...new Set(this.doctors.map(d => d.department))].filter(Boolean);
  }

  ngOnInit() {
    this.filteredDoctors = [...this.doctors];
  }

  filterDoctors() {
    this.filteredDoctors = this.doctors.filter(doctor => {
      const matchesSearch = !this.searchTerm ||
        doctor.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        doctor.Specialization.toLowerCase().includes(this.searchTerm.toLowerCase());

      const matchesDepartment = !this.departmentFilter || 
        doctor.department?.toLowerCase() === this.departmentFilter.toLowerCase();

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
