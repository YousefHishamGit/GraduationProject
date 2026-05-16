import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { EndPoints } from '../../services/endpoints';
import { LanguageService } from '../../services/language.service';

@Component({
  selector: 'app-departments',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './departments.component.html',
  styleUrls: ['./departments.component.css']
})
export class DepartmentsComponent implements OnInit {
  private endpoint = inject(EndPoints);
  public language = inject(LanguageService);

  departments = signal<any[]>([]);
  selectedDept = signal<any>(null);
  deptDoctors = signal<any[]>([]);
  isLoading = signal(true);
  isLoadingDoctors = signal(false);
  searchTerm = '';

  filteredDepts = computed(() => {
    if (!this.searchTerm) return this.departments();
    return this.departments().filter(d =>
      d.departmentName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      d.description?.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  });

  deptIcons: Record<string, string> = {
    'Cardiology': 'fas fa-heartbeat',
    'Neurology': 'fas fa-brain',
    'Orthopedics': 'fas fa-bone',
    'Pediatrics': 'fas fa-baby',
    'Dermatology': 'fas fa-allergies',
    'Ophthalmology': 'fas fa-eye',
    'Gynecology': 'fas fa-venus',
    'Urology': 'fas fa-kidneys',
    'Oncology': 'fas fa-ribbon',
    'Emergency': 'fas fa-ambulance',
    'Psychiatry': 'fas fa-head-side-brain',
    'ENT': 'fas fa-ear',
    'Gastroenterology': 'fas fa-stomach',
    'Endocrinology': 'fas fa-dna',
    'Rheumatology': 'fas fa-hand-dots',
    'Pulmonology': 'fas fa-lungs',
    'General Medicine': 'fas fa-stethoscope'
  };

  deptColors: string[] = [
    '#ef4444', '#8b5cf6', '#f59e0b', '#10b981',
    '#3b82f6', '#1a6fc4', '#ec4899', '#06b6d4',
    '#84cc16', '#f97316', '#6366f1', '#14b8a6'
  ];

  ngOnInit() {
    this.loadDepartments();
  }

  loadDepartments() {
    this.endpoint.departments.getAll().subscribe({
      next: (data) => {
        this.departments.set(data);
        if (data.length > 0) this.selectDept(data[0]);
        this.isLoading.set(false);
        console.log(data)
      },
      error: () => this.isLoading.set(false)
    });
  }

  selectDept(dept: any) {
    this.selectedDept.set(dept);
    this.deptDoctors.set([]);
    this.isLoadingDoctors.set(true);

    this.endpoint.departments.getDoctors(dept.id).subscribe({
      next: (docs) => {
        this.deptDoctors.set(docs);
        this.isLoadingDoctors.set(false);
      },
      error: () => this.isLoadingDoctors.set(false)
    });
  }

  getIcon(name: string): string {
    return this.deptIcons[name] || 'fas fa-hospital-user';
  }

  getColor(index: number): string {
    return this.deptColors[index % this.deptColors.length];
  }

  getInitials(name: string): string {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'DR';
  }
}