import { Component, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

declare var AOS: any;
declare var PureCounter: any;

export interface TeamMember {
  image: string;
  name: string;
  role: string;
  specialty: string;
  experience: string;
}

export interface CoreValue {
  icon: string;
  title: string;
  description: string;
  delay: number;
}

export interface Certification {
  icon: string;
  label: string;
}

export interface Stat {
  end: number;
  suffix: string;
  label: string;
}

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './about.component.html',
  styleUrl: './about.component.css'
})
export class AboutComponent implements AfterViewInit {

  stats: Stat[] = [
    { end: 15000, suffix: '+', label: 'Patients Treated' },
    { end: 25, suffix: '+', label: 'Years Experience' },
    { end: 50, suffix: '+', label: 'Medical Specialists' }
  ];

  coreValues: CoreValue[] = [
    { icon: 'fas fa-heart-pulse', title: 'Compassion', description: 'Providing care with empathy and understanding for every patient\'s unique needs and circumstances.', delay: 0 },
    { icon: 'fas fa-shield-halved', title: 'Excellence', description: 'Maintaining the highest standards of medical care through continuous learning and innovation.', delay: 80 },
    { icon: 'fas fa-people-group', title: 'Integrity', description: 'Building trust through honest communication and ethical practices in all our interactions.', delay: 160 },
    { icon: 'fas fa-lightbulb', title: 'Innovation', description: 'Embracing cutting-edge technology and treatments to improve patient outcomes.', delay: 240 }
  ];

  team: TeamMember[] = [
    { image: 'assets/img/person/person-f-11.webp', name: 'Dr. Sarah Johnson', role: 'Medical Director', specialty: 'Cardiologist', experience: '15+ years' },
    { image: 'assets/img/person/person-m-12.webp', name: 'Dr. Michael Brown', role: 'Head of Neurology', specialty: 'Neurologist', experience: '12+ years' },
    { image: 'assets/img/person/person-f-12.webp', name: 'Dr. Lisa Miller', role: 'Head of Pediatrics', specialty: 'Pediatrician', experience: '10+ years' },
    { image: 'assets/img/person/person-m-13.webp', name: 'Dr. David Wilson', role: 'Head of Surgery', specialty: 'Surgeon', experience: '18+ years' }
  ];

  certifications: Certification[] = [
    { icon: 'fas fa-award', label: 'Joint Commission' },
    { icon: 'fas fa-shield-alt', label: 'Quality Certified' },
    { icon: 'fas fa-star', label: '5-Star Rating' },
    { icon: 'fas fa-heartbeat', label: 'Patient Safety' },
    { icon: 'fas fa-stethoscope', label: 'Medical Excellence' }
  ];

  ngAfterViewInit(): void {
    if (typeof AOS !== 'undefined') {
      AOS.init({ duration: 800, easing: 'ease-in-out', once: true });
    }
    if (typeof PureCounter !== 'undefined') {
      new PureCounter();
    }
  }
}