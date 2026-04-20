import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

interface Department {
  id: string;
  name: string;
  title: string;
  description: string;
  image: string;
  icon: string;
  shortDesc: string;
  services: string[];
  stats: { value: string; label: string }[];
}

@Component({
  selector: 'app-departments',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './departments.component.html',
  styleUrls: ['./departments.component.css']
})
export class DepartmentsComponent {
  activeTab = 'cardiology';

  departments: Department[] = [
    {
      id: 'cardiology',
      name: 'Cardiology',
      title: 'Cardiology Department',
      description: 'Our Cardiology Department provides comprehensive heart care services with state-of-the-art diagnostic tools and treatment options for cardiovascular conditions.',
      image: '/assets/img/health/cardiology-1.webp',
      icon: 'fas fa-heart',
      shortDesc: 'Heart and cardiovascular care',
      services: [
        'Heart disease diagnosis and treatment',
        'Cardiac catheterization',
        'Echocardiography',
        'Pacemaker implantation',
        'Cardiac rehabilitation'
      ],
      stats: [
        { value: '15+', label: 'Specialists' },
        { value: '5,000+', label: 'Procedures Annually' },
        { value: '24/7', label: 'Emergency Care' }
      ]
    },
    {
      id: 'neurology',
      name: 'Neurology',
      title: 'Neurology Department',
      description: 'Specialized care for brain and nervous system disorders with advanced imaging technology and comprehensive treatment programs.',
      image: '/assets/img/health/neurology-2.webp',
      icon: 'fas fa-brain',
      shortDesc: 'Brain and nervous system care',
      services: [
        'Neurological examinations',
        'EEG and EMG testing',
        'Stroke care and rehabilitation',
        'Epilepsy management',
        'Headache and migraine treatment'
      ],
      stats: []
    },
    {
      id: 'orthopedics',
      name: 'Orthopedics',
      title: 'Orthopedics Department',
      description: 'Comprehensive bone and joint care including sports medicine, trauma surgery, and joint replacement procedures.',
      image: '/assets/img/health/orthopedics-1.webp',
      icon: 'fas fa-bone',
      shortDesc: 'Bone and joint treatment',
      services: [
        'Joint replacement surgery',
        'Sports injury treatment',
        'Fracture care',
        'Arthroscopic surgery',
        'Physical therapy'
      ],
      stats: []
    },
    {
      id: 'pediatrics',
      name: 'Pediatrics',
      title: 'Pediatrics Department',
      description: 'Comprehensive healthcare for children and adolescents from birth through age 18.',
      image: '/assets/img/health/pediatrics-1.webp',
      icon: 'fas fa-baby',
      shortDesc: 'Healthcare for children',
      services: [
        'Well-child visits',
        'Vaccinations',
        'Growth and development monitoring',
        'Acute illness treatment',
        'Chronic disease management'
      ],
      stats: []
    },
    {
      id: 'surgery',
      name: 'Surgery',
      title: 'Surgery Department',
      description: 'State-of-the-art surgical facilities with experienced surgeons performing various procedures.',
      image: '/assets/img/health/surgery-1.webp',
      icon: 'fas fa-procedures',
      shortDesc: 'Surgical procedures',
      services: [
        'General surgery',
        'Laparoscopic surgery',
        'Minimally invasive procedures',
        'Post-operative care',
        'Surgical consultations'
      ],
      stats: []
    },
    {
      id: 'emergency',
      name: 'Emergency',
      title: 'Emergency Department',
      description: '24/7 emergency medical services with rapid response teams and advanced life support.',
      image: '/assets/img/health/emergency-1.webp',
      icon: 'fas fa-ambulance',
      shortDesc: '24/7 Emergency care',
      services: [
        'Trauma care',
        'Critical care',
        'Emergency surgery',
        'Cardiac emergency',
        'Pediatric emergency'
      ],
      stats: []
    }
  ];

  allDepartments = [
    ...this.departments,
    {
      id: 'internal',
      name: 'Internal Medicine',
      shortDesc: 'General adult healthcare',
      icon: 'fas fa-stethoscope'
    },
    {
      id: 'ophthalmology',
      name: 'Ophthalmology',
      shortDesc: 'Eye care and surgery',
      icon: 'fas fa-eye'
    },
    {
      id: 'dentistry',
      name: 'Dentistry',
      shortDesc: 'Dental and oral care',
      icon: 'fas fa-tooth'
    }
  ];

  setActiveTab(tabId: string) {
    this.activeTab = tabId;
  }

  scrollToDepartment(deptId: string) {
    const element = document.getElementById(deptId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      this.setActiveTab(deptId);
    }
  }
}
