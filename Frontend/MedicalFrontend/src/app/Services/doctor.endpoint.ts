import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BaseEndpoint } from './base.endpoint';
import {
  DoctorResponseDto, CreateDoctorDto, UpdateDoctorDto,
  DoctorScheduleResponseDto, CreateDoctorScheduleDto, UpdateDoctorScheduleDto,
  DoctorLeaveResponseDto, CreateDoctorLeaveDto, UpdateDoctorLeaveDto,
  TimeSlotResponseDto
} from '../interfaces/doctor.interface';
import { ReviewResponseDto } from '../interfaces/review.interface';

@Injectable({ providedIn: 'root' })
export class DoctorEndpoint extends BaseEndpoint {
  private baseUrl = this.getBaseUrl('doctors');

  getAll(): Observable<DoctorResponseDto[]> {
    return this.http.get<DoctorResponseDto[]>(this.baseUrl);
  }

  getById(id: number): Observable<DoctorResponseDto> {
    return this.http.get<DoctorResponseDto>(`${this.baseUrl}/${id}`);
  }

  getByDepartment(departmentId: number): Observable<DoctorResponseDto[]> {
    return this.http.get<DoctorResponseDto[]>(`${this.baseUrl}/department/${departmentId}`);
  }

  search(name?: string, departmentId?: number, specialization?: string): Observable<DoctorResponseDto[]> {
    let params = new HttpParams();
    if (name) params = params.set('name', name);
    if (departmentId) params = params.set('departmentId', departmentId.toString());
    if (specialization) params = params.set('specialization', specialization);
    return this.http.get<DoctorResponseDto[]>(`${this.baseUrl}/search`, { params });
  }

  update(id: number, dto: UpdateDoctorDto): Observable<DoctorResponseDto> {
    return this.http.put<DoctorResponseDto>(`${this.baseUrl}/${id}`, dto);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  getReviews(id: number): Observable<ReviewResponseDto[]> {
    return this.http.get<ReviewResponseDto[]>(`${this.baseUrl}/${id}/reviews`);
  }

  getRating(id: number): Observable<number> {
    return this.http.get<number>(`${this.baseUrl}/${id}/rating`);
  }

  getSchedule(doctorId: number): Observable<DoctorScheduleResponseDto[]> {
    return this.http.get<DoctorScheduleResponseDto[]>(`${this.baseUrl}/${doctorId}/schedule`);
  }

  getLeaves(doctorId: number): Observable<DoctorLeaveResponseDto[]> {
    return this.http.get<DoctorLeaveResponseDto[]>(`${this.baseUrl}/${doctorId}/leaves`);
  }

  getTimeSlots(doctorId: number): Observable<TimeSlotResponseDto[]> {
    return this.http.get<TimeSlotResponseDto[]>(`${this.baseUrl}/${doctorId}/timeslots`);
  }

  getAvailableTimeSlots(doctorId: number, date: string): Observable<TimeSlotResponseDto[]> {
    const params = new HttpParams().set('date', date);
    return this.http.get<TimeSlotResponseDto[]>(`${this.baseUrl}/${doctorId}/timeslots`, { params });
  }
}