import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BaseEndpoint } from './base.endpoint';
import {
  DoctorResponseDto,
  CreateDoctorDto,
  UpdateDoctorDto,
  DoctorScheduleResponseDto,
  CreateDoctorScheduleDto,
  UpdateDoctorScheduleDto,
  DoctorLeaveResponseDto,
  CreateDoctorLeaveDto,
  UpdateDoctorLeaveDto,
  TimeSlotResponseDto,
  GenerateTimeSlotsDto
} from '../interfaces/doctor.interface';
import { ReviewResponseDto } from '../interfaces/review.interface';

@Injectable({
  providedIn: 'root'
})
export class DoctorEndpoint extends BaseEndpoint {
  private baseUrl = this.getBaseUrl('doctors');

  // ─── Doctors ──────────────────────────────────────────────

  // GET /api/doctors
  getAll(): Observable<DoctorResponseDto[]> {
    return this.http.get<DoctorResponseDto[]>(this.baseUrl);
  }

  // GET /api/doctors/{id}
  getById(id: number): Observable<DoctorResponseDto> {
    return this.http.get<DoctorResponseDto>(`${this.baseUrl}/${id}`);
  }

  // GET /api/doctors/department/{departmentId}
  getByDepartment(departmentId: number): Observable<DoctorResponseDto[]> {
    return this.http.get<DoctorResponseDto[]>(`${this.baseUrl}/department/${departmentId}`);
  }

  // GET /api/doctors/search?name=&departmentId=&specialization=
  search(name?: string, departmentId?: number, specialization?: string): Observable<DoctorResponseDto[]> {
    let params = new HttpParams();
    if (name)           params = params.set('name', name);
    if (departmentId)   params = params.set('departmentId', departmentId.toString());
    if (specialization) params = params.set('specialization', specialization);
    return this.http.get<DoctorResponseDto[]>(`${this.baseUrl}/search`, { params });
  }

  // POST /api/doctors  [Admin]
  create(dto: CreateDoctorDto): Observable<DoctorResponseDto> {
    const formData = this.toFormData(dto);
    return this.http.post<DoctorResponseDto>(this.baseUrl, formData);
  }

  // PUT /api/doctors/{id}  [Admin, Doctor]
  update(id: number, dto: UpdateDoctorDto): Observable<DoctorResponseDto> {
    const formData = this.toFormData(dto);
    return this.http.put<DoctorResponseDto>(`${this.baseUrl}/${id}`, formData);
  }

  // DELETE /api/doctors/{id}  [Admin]
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  // GET /api/doctors/{id}/reviews
  getReviews(id: number): Observable<ReviewResponseDto[]> {
    return this.http.get<ReviewResponseDto[]>(`${this.baseUrl}/${id}/reviews`);
  }

  // ─── Schedule ─────────────────────────────────────────────

  // GET /api/doctors/{doctorId}/schedule
  getSchedule(doctorId: number): Observable<DoctorScheduleResponseDto[]> {
    return this.http.get<DoctorScheduleResponseDto[]>(`${this.baseUrl}/${doctorId}/schedule`);
  }

  // POST /api/doctors/{doctorId}/schedule
  createSchedule(doctorId: number, dto: CreateDoctorScheduleDto): Observable<DoctorScheduleResponseDto> {
    return this.http.post<DoctorScheduleResponseDto>(`${this.baseUrl}/${doctorId}/schedule`, dto);
  }

  // GET /api/schedule/{id}
  getScheduleById(id: number): Observable<DoctorScheduleResponseDto> {
    return this.http.get<DoctorScheduleResponseDto>(`${this.apiUrl}/schedule/${id}`);
  }

  // PUT /api/schedule/{id}
  updateSchedule(id: number, dto: UpdateDoctorScheduleDto): Observable<DoctorScheduleResponseDto> {
    return this.http.put<DoctorScheduleResponseDto>(`${this.apiUrl}/schedule/${id}`, dto);
  }

  // DELETE /api/schedule/{id}
  deleteSchedule(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/schedule/${id}`);
  }

  // ─── Leaves ───────────────────────────────────────────────

  // GET /api/doctors/{doctorId}/leaves
  getLeaves(doctorId: number): Observable<DoctorLeaveResponseDto[]> {
    return this.http.get<DoctorLeaveResponseDto[]>(`${this.baseUrl}/${doctorId}/leaves`);
  }

  // POST /api/doctors/{doctorId}/leaves
  createLeave(doctorId: number, dto: CreateDoctorLeaveDto): Observable<DoctorLeaveResponseDto> {
    return this.http.post<DoctorLeaveResponseDto>(`${this.baseUrl}/${doctorId}/leaves`, dto);
  }

  // GET /api/leaves/{id}
  getLeaveById(id: number): Observable<DoctorLeaveResponseDto> {
    return this.http.get<DoctorLeaveResponseDto>(`${this.apiUrl}/leaves/${id}`);
  }

  // PUT /api/leaves/{id}
  updateLeave(id: number, dto: UpdateDoctorLeaveDto): Observable<DoctorLeaveResponseDto> {
    return this.http.put<DoctorLeaveResponseDto>(`${this.apiUrl}/leaves/${id}`, dto);
  }

  // DELETE /api/leaves/{id}
  deleteLeave(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/leaves/${id}`);
  }

  // ─── Time Slots ───────────────────────────────────────────

  // GET /api/doctors/{doctorId}/timeslots?date=
  getAvailableTimeSlots(doctorId: number, date: string): Observable<TimeSlotResponseDto[]> {
    const params = new HttpParams().set('date', date);
    return this.http.get<TimeSlotResponseDto[]>(`${this.baseUrl}/${doctorId}/timeslots`, { params });
  }

  // GET /api/doctors/{doctorId}/timeslots
getTimeSlots(doctorId: number): Observable<TimeSlotResponseDto[]> {
  return this.http.get<TimeSlotResponseDto[]>(`${this.baseUrl}/${doctorId}/timeslots`);
}

  // POST /api/timeslots?doctorId=
  generateTimeSlots(doctorId: number, dto: GenerateTimeSlotsDto): Observable<TimeSlotResponseDto[]> {
    const params = new HttpParams().set('doctorId', doctorId.toString());
    return this.http.post<TimeSlotResponseDto[]>(`${this.apiUrl}/timeslots`, dto, { params });
  }

  // DELETE /api/timeslots/{id}
  deleteTimeSlot(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/timeslots/${id}`);
  }
}
