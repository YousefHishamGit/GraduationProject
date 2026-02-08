import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { AboutComponent } from './pages/about/about.component';
import { DepartmentsComponent } from './pages/departments/departments.component';
import { ServicesComponent } from './pages/services/services.component';
import { DoctorsComponent } from './pages/doctors/doctors.component';
import { AppointmentComponent } from './pages/appointment/appointment.component';
import { ChatbotComponent } from './pages/chatbot/chatbot.component';
import { LoginComponent } from './pages/login/login.component';
import { SignupComponent } from './pages/signup/signup.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'about', component: AboutComponent },
  { path: 'departments', component: DepartmentsComponent },
  { path: 'services', component: ServicesComponent },
  { path: 'doctors', component: DoctorsComponent },
  { path: 'appointment', component: AppointmentComponent },
  { path: 'chatbot', component: ChatbotComponent },
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  { path: '**', redirectTo: '' }
];
