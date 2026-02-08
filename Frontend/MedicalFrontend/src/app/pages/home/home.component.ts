import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  services = [
    { icon: 'fas fa-heartbeat', title: 'Cardiology', description: 'Advanced heart care with modern diagnostic tools.', link: '/services' },
    { icon: 'fas fa-brain', title: 'Neurology', description: 'Expert care for brain and nervous system disorders.', link: '/services' },
    { icon: 'fas fa-bone', title: 'Orthopedics', description: 'Specialized bone and joint treatment.', link: '/services' },
    { icon: 'fas fa-baby', title: 'Pediatrics', description: 'Healthcare for children and adolescents.', link: '/services' }
  ];

  departments = [
    { image: '/assets/img/health/cardiology-1.webp', title: 'Cardiology', description: 'Heart and cardiovascular care', link: '/departments' },
    { image: '/assets/img/health/neurology-2.webp', title: 'Neurology', description: 'Brain and nervous system care', link: '/departments' },
    { image: '/assets/img/health/orthopedics-1.webp', title: 'Orthopedics', description: 'Bone and joint treatment', link: '/departments' }
  ];

  doctors = [
    { image: '/assets/img/person/person-f-11.webp', name: 'Dr. Sarah Johnson', specialty: 'Cardiologist', experience: '15+ years experience', link: '/doctors' },
    { image: '/assets/img/person/person-m-12.webp', name: 'Dr. Michael Brown', specialty: 'Neurologist', experience: '12+ years experience', link: '/doctors' },
    { image: '/assets/img/person/person-f-12.webp', name: 'Dr. Lisa Miller', specialty: 'Orthopedic Surgeon', experience: '10+ years experience', link: '/doctors' }
  ];
}
