import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

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
export class ServicesComponent {
  activeCategory = signal<string>('medical');

  categories = signal<Category[]>([
    {
      id: 'medical',
      name: 'Medical Services',
      services: [
        {
          name: 'Primary Care',
          description: 'General healthcare, preventive medicine, and management of chronic conditions.',
          icon: 'fas fa-heartbeat',
          features: ['Annual check-ups', 'Chronic disease management', 'Vaccinations', 'Health screenings']
        },
        {
          name: 'Emergency Care',
          description: '24/7 emergency medical services with rapid response and critical care.',
          icon: 'fas fa-stethoscope',
          features: ['Trauma care', 'Emergency surgery', 'Critical care units', 'Ambulance services']
        },
        {
          name: 'Pediatric Care',
          description: 'Comprehensive healthcare for children from birth through adolescence.',
          icon: 'fas fa-baby',
          features: ['Well-child visits', 'Immunizations', 'Developmental screening', 'Adolescent medicine']
        }
      ]
    },
    {
      id: 'surgical',
      name: 'Surgical Services',
      services: [
        {
          name: 'General Surgery',
          description: 'Comprehensive surgical care for various conditions and emergencies.',
          icon: 'fas fa-procedures',
          features: ['Appendectomy', 'Gallbladder surgery', 'Hernia repair', 'Biopsy procedures']
        },
        {
          name: 'Orthopedic Surgery',
          description: 'Surgical treatment for bone, joint, and muscle conditions.',
          icon: 'fas fa-bone',
          features: ['Joint replacement', 'Fracture repair', 'Arthroscopic surgery', 'Spinal surgery']
        },
        {
          name: 'Neurosurgery',
          description: 'Surgical treatment for brain, spine, and nervous system disorders.',
          icon: 'fas fa-brain',
          features: ['Brain tumor surgery', 'Spinal surgery', 'Neurovascular surgery', 'Epilepsy surgery']
        }
      ]
    },
    {
      id: 'diagnostic',
      name: 'Diagnostic Services',
      services: [
        {
          name: 'Laboratory Tests',
          description: 'Comprehensive lab testing for accurate diagnosis and monitoring.',
          icon: 'fas fa-flask',
          features: ['Blood tests', 'Urinalysis', 'Pathology', 'Genetic testing']
        },
        {
          name: 'Imaging Services',
          description: 'Advanced imaging technology for precise diagnosis.',
          icon: 'fas fa-x-ray',
          features: ['X-Ray', 'CT Scan', 'MRI', 'Ultrasound', 'Mammography']
        },
        {
          name: 'Cardiac Testing',
          description: 'Specialized heart and cardiovascular diagnostics.',
          icon: 'fas fa-heartbeat',
          features: ['EKG/ECG', 'Echocardiogram', 'Stress test', 'Holter monitoring']
        }
      ]
    },
    {
      id: 'specialized',
      name: 'Specialized Care',
      services: [
        {
          name: 'Oncology',
          description: 'Comprehensive cancer care including treatment and support.',
          icon: 'fas fa-ribbon',
          features: ['Chemotherapy', 'Radiation therapy', 'Immunotherapy', 'Palliative care']
        },
        {
          name: 'Maternity Care',
          description: 'Complete care for expectant mothers and newborns.',
          icon: 'fas fa-baby-carriage',
          features: ['Prenatal care', 'Delivery services', 'Postnatal care', 'Neonatal care']
        },
        {
          name: 'Mental Health',
          description: 'Psychiatric and psychological services for mental wellness.',
          icon: 'fas fa-brain',
          features: ['Counseling', 'Psychotherapy', 'Medication management', 'Crisis intervention']
        }
      ]
    }
  ]);

  specialServices = signal([
    {
      id: 1,
      title: 'Cardiac Care',
      description: 'Comprehensive heart care including advanced diagnostics, interventional procedures, and cardiac rehabilitation.',
      image: '/assets/img/health/cardiology-1.webp',
      features: ['Cardiac catheterization', 'Pacemaker implantation', 'Echocardiography', 'Stress testing'],
      serviceParam: 'cardiac'
    },
    {
      id: 2,
      title: 'Cancer Care',
      description: 'Multidisciplinary approach to cancer diagnosis, treatment, and supportive care.',
      image: '/assets/img/health/oncology-2.webp',
      features: ['Chemotherapy', 'Radiation therapy', 'Surgical oncology', 'Palliative care'],
      serviceParam: 'cancer'
    }
  ]);

  setActiveCategory(categoryId: string) {
    this.activeCategory.set(categoryId);
  }
}
