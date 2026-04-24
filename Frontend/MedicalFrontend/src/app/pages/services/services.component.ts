import { Component, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { EndPoints } from '../../Services/endpoints';

interface Service {
  name: string;
  description: string;
  features: string[];
  icon: string;
}

interface Category {
  id: string;
  name: string;
  services: Service[];
}

@Component({
  selector: 'app-services',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './services.component.html',
  styleUrls: ['./services.component.css']
})
export class ServicesComponent implements OnInit {
  private endpoint = inject(EndPoints);

  activeCategory = signal<string>('medical');
  categories = signal<Category[]>([]);

  ngOnInit() {
    this.loadServices();
  }

  loadServices() {
    this.endpoint.departments.getAll().subscribe({
      next: (data) => {
        // Map departments to medical category for now
        this.categories.set([
          {
            id: 'medical',
            name: 'Medical Services',
            services: data.map(d => ({
              name: d.departmentName,
              description: d.description,
              icon: this.getIcon(d.departmentName),
              features: ['Consultation', 'Specialized treatment', 'Follow-up care']
            }))
          },
          {
            id: 'surgical',
            name: 'Surgical Services',
            services: []
          }
        ]);
      },
      error: (err) => console.error('Error loading services', err)
    });
  }

  getIcon(name: string): string {
    const icons: { [key: string]: string } = {
      'Cardiology': 'fas fa-heartbeat',
      'Neurology': 'fas fa-brain',
      'Orthopedics': 'fas fa-bone',
      'Pediatrics': 'fas fa-baby'
    };
    return icons[name] || 'fas fa-stethoscope';
  }

  setActiveCategory(categoryId: string) {
    this.activeCategory.set(categoryId);
  }
}
