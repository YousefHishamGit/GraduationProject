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

interface SpecialService {
  id: number;
  title: string;
  description: string;
  image: string;
  features: string[];
  serviceParam: string;
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

  specialServices = signal<SpecialService[]>([
    {
      id: 1,
      title: 'Advanced Cardiac Care',
      description: 'State-of-the-art cardiac diagnostics and treatment.',
      image: '/assets/img/health/cardiology-1.webp',
      features: ['ECG & Echo', 'Cardiac Surgery', 'Rehabilitation'],
      serviceParam: 'cardiology'
    },
    {
      id: 2,
      title: 'Neurology & Brain Health',
      description: 'Comprehensive neurological care and diagnostics.',
      image: '/assets/img/health/neurology-2.webp',
      features: ['MRI & CT Scan', 'Stroke Care', 'Memory Clinic'],
      serviceParam: 'neurology'
    },
    {
      id: 3,
      title: 'Orthopedic Excellence',
      description: 'Advanced bone and joint treatment services.',
      image: '/assets/img/health/orthopedics-1.webp',
      features: ['Joint Replacement', 'Sports Medicine', 'Physiotherapy'],
      serviceParam: 'orthopedics'
    },
    {
      id: 4,
      title: 'Pediatric Care',
      description: 'Specialized healthcare for children of all ages.',
      image: '/assets/img/health/pediatrics-3.webp',
      features: ['Vaccination', 'Growth Monitoring', 'Child Psychology'],
      serviceParam: 'pediatrics'
    }
  ]);

  ngOnInit() {
    this.loadServices();
  }

  loadServices() {
    this.endpoint.departments.getAll().subscribe({
      next: (data) => {
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