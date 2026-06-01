import { Injectable, inject } from '@angular/core';
import { AuthEndpoint } from './auth.endpoint';
import { DoctorEndpoint } from './doctor.endpoint';
import { PatientEndpoint } from './patient.endpoint';
import { AppointmentEndpoint } from './appointment.endpoint';
import { DepartmentEndpoint } from './department.endpoint';
import { MedicalRecordEndpoint } from './medical-record.endpoint';
import { PrescriptionEndpoint } from './prescription.endpoint';
import { LabRequestEndpoint } from './lab-request.endpoint';
import { ReviewEndpoint } from './review.endpoint';
import { PaymentEndpoint } from './payment.endpoint';
import { AiEndpoint } from './ai.endpoint';
import { NotificationEndpoint } from './notification.endpoint';

@Injectable({ providedIn: 'root' })
export class EndPoints {
  public auth         = inject(AuthEndpoint);
  public doctors      = inject(DoctorEndpoint);
  public patients     = inject(PatientEndpoint);
  public appointments = inject(AppointmentEndpoint);
  public departments  = inject(DepartmentEndpoint);
  public medicalRecords = inject(MedicalRecordEndpoint);
  public prescriptions  = inject(PrescriptionEndpoint);
  public labRequests    = inject(LabRequestEndpoint);
  public reviews      = inject(ReviewEndpoint);
  public payments     = inject(PaymentEndpoint);
  public ai           = inject(AiEndpoint);
  public notifications = inject(NotificationEndpoint);
}