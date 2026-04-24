import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { EndPoints } from '../../Services/endpoints';

export interface Service {
  icon: string;
  title: string;
  description: string;
  link: string;
}

export interface Department {
  image: string;
  title: string;
  description: string;
  link: string;
}

export interface Doctor {
  image: string;
  name: string;
  specialty: string;
  experience: string;
  link: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  public endpoint = inject(EndPoints);

  services: Service[] = [
    { icon: 'fas fa-heartbeat', title: 'Cardiology', description: 'Advanced heart care with modern diagnostic tools.', link: '/services' },
    { icon: 'fas fa-brain', title: 'Neurology', description: 'Expert care for brain and nervous system disorders.', link: '/services' },
    { icon: 'fas fa-bone', title: 'Orthopedics', description: 'Specialized bone and joint treatment.', link: '/services' },
    { icon: 'fas fa-baby', title: 'Pediatrics', description: 'Comprehensive healthcare for children and adolescents.', link: '/services' }
  ];

  departments: Department[] = [];
  doctors: Doctor[] = [];

  stats = [
    { value: '25+', label: 'Years Experience' },
    { value: '5000+', label: 'Patients Treated' },
    { value: '50+', label: 'Medical Experts' }
  ];

  ngOnInit() {
    this.loadDepartments();
    this.loadDoctors();
  }

  private loadDepartments() {
    this.endpoint.departments.getAll().subscribe({
      next: (data) => {
        this.departments = data.map(d => ({
          image: d.imgPath || '/assets/img/health/cardiology-1.webp',
          title: d.departmentName,
          description: d.description,
          link: '/departments'
        })).slice(0, 3);
      },
      error: (err) => console.error('Error loading departments', err)
    });
  }

  private loadDoctors() {
    this.endpoint.doctors.getAll().subscribe({
      next: (data) => {
        this.doctors = data.map(d => ({
          image: d.imgPath || '/assets/img/person/person-f-11.webp',
          name: d.fullName,
          specialty: d.specialization,
          experience: `${d.yearsOfExperience}+ years experience`,
          link: '/doctors'
        })).slice(0, 3);
      },
      error: (err) => console.error('Error loading doctors', err)
    });
  }
}
