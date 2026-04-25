import { Component, signal, computed, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { EndPoints } from '../../Services/endpoints';

interface Department {
  id: number;
  name: string;
  description: string;
  icon: string;
  image: string;
  doctorCount: number;
  services: string[];
}

@Component({
  selector: 'app-departments',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './departments.component.html',
  styleUrls: ['./departments.component.css']
})
export class DepartmentsComponent implements OnInit {
  private endpoint = inject(EndPoints);

  departments = signal<Department[]>([]);
  activeTab: number | null = null;

  // alias عشان الـ HTML بيستخدم allDepartments
  get allDepartments() {
    return this.departments();
  }

  ngOnInit() {
    this.loadDepartments();
  }

  loadDepartments() {
    this.endpoint.departments.getAll().subscribe({
      next: (data) => {
        const mapped = data.map(d => ({
          id: d.id,
          name: d.departmentName,
          description: d.description,
          icon: this.getIconForDepartment(d.departmentName),
          image: d.imgPath || '/assets/img/health/cardiology-1.webp',
          doctorCount: 0,
          services: ['General Consultation', 'Specialized Care', 'Follow-up']
        }));
        this.departments.set(mapped);
        if (mapped.length > 0) this.activeTab = mapped[0].id;
      },
      error: (err) => console.error('Error loading departments', err)
    });
  }

  setActiveTab(id: number) {
    this.activeTab = id;
  }

  scrollToDepartment(id: number) {
    this.activeTab = id;
    const el = document.getElementById(id.toString());
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  }

  getIconForDepartment(name: string): string {
    const icons: { [key: string]: string } = {
      'Cardiology': 'fas fa-heartbeat',
      'Neurology': 'fas fa-brain',
      'Orthopedics': 'fas fa-bone',
      'Pediatrics': 'fas fa-baby',
      'Dermatology': 'fas fa-allergies',
      'Ophthalmology': 'fas fa-eye'
    };
    return icons[name] || 'fas fa-hospital-user';
  }
}