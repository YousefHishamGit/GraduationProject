import { Injectable, inject } from '@angular/core';
import { AppointmentEndpoint } from './appointment.endpoint';
import { AuthEndpoint } from './auth.endpoint';
import { DepartmentEndpoint } from './department.endpoint';
import { DoctorEndpoint } from './doctor.endpoint';
import { LabRequestEndpoint } from './lab-request.endpoint';
import { MedicalRecordEndpoint } from './medical-record.endpoint';
import { PatientEndpoint } from './patient.endpoint';
import { PaymentEndpoint } from './payment.endpoint';
import { PrescriptionEndpoint } from './prescription.endpoint';
import { ReceptionistEndpoint } from './receptionist.endpoint';
import { ReviewEndpoint } from './review.endpoint';

@Injectable({ providedIn: 'root' })
export class EndPoints {
  public appointments   = inject(AppointmentEndpoint);
  public auth           = inject(AuthEndpoint);
  public departments    = inject(DepartmentEndpoint);
  public doctors        = inject(DoctorEndpoint);
  public labRequests    = inject(LabRequestEndpoint);
  public medicalRecords = inject(MedicalRecordEndpoint);
  public patients       = inject(PatientEndpoint);
  public payments       = inject(PaymentEndpoint);
  public prescriptions  = inject(PrescriptionEndpoint);
  public receptionists  = inject(ReceptionistEndpoint);
  public reviews        = inject(ReviewEndpoint);
}