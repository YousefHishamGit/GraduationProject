# MedicalFrontend - Functions & Methods Summary

This document lists every function and method found in the Angular frontend project components, services, pages, guards, interceptors, and utility files.

## 📁 src/app/services/admin.endpoint.ts
### 🔧 getRevenueReport()
- **Does:** Sends a GET request to retrieve the revenue report.
- **Params:** None
- **Returns:** Observable<RevenueReport>
- **Calls:** this.getBaseUrl, this.http.get

---

## 📁 src/app/services/ai.endpoint.ts
### 🔧 predict()
- **Does:** Predicts dynamic diagnoses and recommended medical specialties based on user symptoms by calling the /predict Flask AI endpoint.
- **Params:** dto: DiagnosisRequestDto
- **Returns:** Observable<DiagnosisResponseDto>
- **Calls:** this.http.post

### 🔧 chat()
- **Does:** Sends user chat messages along with optional base64 file attachments and session identifiers to the /chat Flask AI endpoint for multi-turn conversational analysis.
- **Params:** dto: ChatRequestDto
- **Returns:** Observable<ChatResponseDto>
- **Calls:** this.http.post

### 🔧 analyzeReport()
- **Does:** Uploads a PDF medical report file using FormData to the /analyze-report Flask AI endpoint to retrieve a summarized analysis containing key findings, urgency levels, and recommendations.
- **Params:** file: File
- **Returns:** Observable<ReportAnalysisResponseDto>
- **Calls:** this.http.post

### 🔧 analyzeImage()
- **Does:** Uploads a medical image file using FormData to the /analyze-image Flask AI endpoint to obtain descriptions, diagnostic findings, and urgency details.
- **Params:** file: File
- **Returns:** Observable<ImageAnalysisResponseDto>
- **Calls:** this.http.post

### 🔧 ask()
- **Does:** Queries the RAG system directly via the /ask Flask AI endpoint to search the medical knowledge base.
- **Params:** query: string
- **Returns:** Observable<AskResponseDto>
- **Calls:** this.http.post

### 🔧 health()
- **Does:** Checks the health status of the Flask AI service via the /health endpoint.
- **Params:** None
- **Returns:** Observable<HealthResponseDto>
- **Calls:** this.http.get

### 🔧 info()
- **Does:** Fetches general system metadata and info from the /info endpoint.
- **Params:** None
- **Returns:** Observable<InfoResponseDto>
- **Calls:** this.http.get

---

## 📁 src/app/services/appointment.endpoint.ts
### 🔧 getAll()
- **Does:** Fetches all appointments from the system.
- **Params:** None
- **Returns:** Observable<AppointmentResponseDto[]>
- **Calls:** this.http.get

### 🔧 getById()
- **Does:** Fetches a specific appointment by its ID.
- **Params:** id: number
- **Returns:** Observable<AppointmentResponseDto>
- **Calls:** this.http.get

### 🔧 create()
- **Does:** Creates a new appointment.
- **Params:** dto: CreateAppointmentDto
- **Returns:** Observable<AppointmentResponseDto>
- **Calls:** this.http.post

### 🔧 update()
- **Does:** Updates an existing appointment.
- **Params:** id: number, dto: UpdateAppointmentDto
- **Returns:** Observable<AppointmentResponseDto>
- **Calls:** this.http.put

### 🔧 delete()
- **Does:** Deletes an appointment.
- **Params:** id: number
- **Returns:** Observable<void>
- **Calls:** this.http.delete

### 🔧 confirm()
- **Does:** Confirms a scheduled appointment.
- **Params:** id: number
- **Returns:** Observable<AppointmentResponseDto>
- **Calls:** this.http.put

### 🔧 cancel()
- **Does:** Cancels a scheduled appointment with a reason in the DTO.
- **Params:** id: number, dto: CancelAppointmentDto
- **Returns:** Observable<AppointmentResponseDto>
- **Calls:** this.http.put

### 🔧 complete()
- **Does:** Marks an appointment as completed.
- **Params:** id: number
- **Returns:** Observable<AppointmentResponseDto>
- **Calls:** this.http.put

### 🔧 getByDoctor()
- **Does:** Fetches appointments for a specific doctor.
- **Params:** doctorId: number
- **Returns:** Observable<AppointmentResponseDto[]>
- **Calls:** this.http.get

### 🔧 getByPatient()
- **Does:** Fetches appointments for a specific patient.
- **Params:** patientId: number
- **Returns:** Observable<AppointmentResponseDto[]>
- **Calls:** this.http.get

---

## 📁 src/app/services/auth.endpoint.ts
### 🔧 login()
- **Does:** Sends login credentials to the auth endpoint.
- **Params:** dto: LoginDto
- **Returns:** Observable<AuthResponseDto>
- **Calls:** this.http.post

### 🔧 registerPatient()
- **Does:** Registers a patient, sending details via FormData (with an optional profile image).
- **Params:** dto: RegisterPatientDto
- **Returns:** Observable<AuthResponseDto>
- **Calls:** this.http.post, this.toRegistrationFormData

### 🔧 registerDoctor()
- **Does:** Registers a doctor, sending details via FormData (with an optional profile image).
- **Params:** dto: RegisterDoctorDto
- **Returns:** Observable<AuthResponseDto>
- **Calls:** this.http.post, this.toRegistrationFormData

### 🔧 toRegistrationFormData()
- **Does:** Extracts the image field and converts the remaining payload properties into a FormData object using toFormData, then appends the image if it is provided.
- **Params:** dto: RegisterPatientDto | RegisterDoctorDto
- **Returns:** FormData
- **Calls:** this.toFormData, formData.append

### 🔧 logout()
- **Does:** Sends a POST request to log the user out.
- **Params:** None
- **Returns:** Observable<void>
- **Calls:** this.http.post

---

## 📁 src/app/services/auth.service.ts
### 🔧 getCurrentUser()
- **Does:** Retrieves the currently logged-in user details stored in localStorage.
- **Params:** None
- **Returns:** AuthResponseDto | null
- **Calls:** localStorage.getItem, JSON.parse

### 🔧 getToken()
- **Does:** Retrieves the current authorization token from localStorage.
- **Params:** None
- **Returns:** string | null
- **Calls:** localStorage.getItem

### 🔧 getUserIdFromToken()
- **Does:** Extracts the user ID claim value from the JWT bearer token.
- **Params:** None
- **Returns:** string | null
- **Calls:** this.getToken, JSON.parse, atob

### 🔧 getRole()
- **Does:** Gets the current user's role descriptor.
- **Params:** None
- **Returns:** string | null
- **Calls:** this.getCurrentUser

### 🔧 isLoggedIn()
- **Does:** Evaluates if a user token is saved.
- **Params:** None
- **Returns:** boolean
- **Calls:** this.getToken

### 🔧 logout()
- **Does:** Clears storage tokens and redirects the router context to login.
- **Params:** None
- **Returns:** void
- **Calls:** localStorage.clear, this.router.navigate

---

## 📁 src/app/services/base.endpoint.ts
### 🔧 getBaseUrl()
- **Does:** Appends the base api url with the given endpoint string and returns the full URL.
- **Params:** endpoint: string
- **Returns:** string
- **Calls:** None

### 🔧 toFormData()
- **Does:** Converts a plain object into a FormData instance, mapping property keys according to formKeyMap if present, and ignoring null, undefined, or empty string values.
- **Params:** obj: Record<string, unknown>
- **Returns:** FormData
- **Calls:** Object.entries, formData.append

---

## 📁 src/app/services/department.endpoint.ts
### 🔧 getAll()
- **Does:** Retrieves all departments in the system.
- **Params:** None
- **Returns:** Observable<DepartmentResponseDto[]>
- **Calls:** this.http.get

### 🔧 getById()
- **Does:** Retrieves a specific department by its ID.
- **Params:** id: number
- **Returns:** Observable<DepartmentResponseDto>
- **Calls:** this.http.get

### 🔧 getDoctors()
- **Does:** Retrieves all doctors belonging to a specific department.
- **Params:** id: number
- **Returns:** Observable<DoctorResponseDto[]>
- **Calls:** this.http.get

### 🔧 create()
- **Does:** Creates a new department.
- **Params:** dto: CreateDepartmentDto
- **Returns:** Observable<DepartmentResponseDto>
- **Calls:** this.http.post

### 🔧 update()
- **Does:** Updates an existing department.
- **Params:** id: number, dto: UpdateDepartmentDto
- **Returns:** Observable<DepartmentResponseDto>
- **Calls:** this.http.put

### 🔧 delete()
- **Does:** Deletes a department.
- **Params:** id: number
- **Returns:** Observable<void>
- **Calls:** this.http.delete

---

## 📁 src/app/services/doctor.endpoint.ts
### 🔧 getAll()
- **Does:** Retrieves all doctors.
- **Params:** None
- **Returns:** Observable<DoctorResponseDto[]>
- **Calls:** this.http.get

### 🔧 getById()
- **Does:** Retrieves a specific doctor by their ID.
- **Params:** id: number
- **Returns:** Observable<DoctorResponseDto>
- **Calls:** this.http.get

### 🔧 getByUserId()
- **Does:** Retrieves a doctor profile by user ID.
- **Params:** userId: string
- **Returns:** Observable<DoctorResponseDto>
- **Calls:** this.http.get

### 🔧 uploadProfileImage()
- **Does:** Uploads a profile image for a specific doctor.
- **Params:** id: number, image: File
- **Returns:** Observable<DoctorResponseDto>
- **Calls:** this.http.post

### 🔧 getByDepartment()
- **Does:** Retrieves doctors belonging to a specific department.
- **Params:** departmentId: number
- **Returns:** Observable<DoctorResponseDto[]>
- **Calls:** this.http.get

### 🔧 search()
- **Does:** Searches for doctors matching name, department ID, and/or specialization criteria.
- **Params:** name?: string, departmentId?: number, specialization?: string
- **Returns:** Observable<DoctorResponseDto[]>
- **Calls:** this.http.get, HttpParams.set

### 🔧 update()
- **Does:** Updates a doctor's profile.
- **Params:** id: number, dto: UpdateDoctorDto
- **Returns:** Observable<DoctorResponseDto>
- **Calls:** this.http.put

### 🔧 delete()
- **Does:** Deletes a doctor from the system.
- **Params:** id: number
- **Returns:** Observable<void>
- **Calls:** this.http.delete

### 🔧 getReviews()
- **Does:** Retrieves reviews given to a doctor.
- **Params:** id: number
- **Returns:** Observable<ReviewResponseDto[]>
- **Calls:** this.http.get

### 🔧 getRating()
- **Does:** Retrieves the average rating of a doctor.
- **Params:** id: number
- **Returns:** Observable<number>
- **Calls:** this.http.get

### 🔧 getSchedule()
- **Does:** Retrieves the schedule of a doctor.
- **Params:** doctorId: number
- **Returns:** Observable<DoctorScheduleResponseDto[]>
- **Calls:** this.http.get

### 🔧 createSchedule()
- **Does:** Creates a new schedule for a doctor.
- **Params:** doctorId: number, dto: CreateDoctorScheduleDto
- **Returns:** Observable<DoctorScheduleResponseDto>
- **Calls:** this.http.post

### 🔧 updateSchedule()
- **Does:** Updates an existing schedule.
- **Params:** scheduleId: number, dto: UpdateDoctorScheduleDto
- **Returns:** Observable<DoctorScheduleResponseDto>
- **Calls:** this.http.put

### 🔧 deleteSchedule()
- **Does:** Deletes a schedule.
- **Params:** scheduleId: number
- **Returns:** Observable<void>
- **Calls:** this.http.delete

### 🔧 getLeaves()
- **Does:** Retrieves leave records of a doctor.
- **Params:** doctorId: number
- **Returns:** Observable<DoctorLeaveResponseDto[]>
- **Calls:** this.http.get

### 🔧 getTimeSlots()
- **Does:** Retrieves calculated time slots for a doctor on a specific date.
- **Params:** doctorId: number, date?: string
- **Returns:** Observable<TimeSlotResponseDto[]>
- **Calls:** this.http.get, HttpParams.set

### 🔧 getTimeSlotsRange()
- **Does:** Retrieves calculated time slots for a doctor in a date range.
- **Params:** doctorId: number, startDate: string, endDate: string
- **Returns:** Observable<TimeSlotResponseDto[]>
- **Calls:** this.http.get, HttpParams.set

### 🔧 generateTimeSlots()
- **Does:** Generates time slots for a doctor on a specific date.
- **Params:** doctorId: number, date: string
- **Returns:** Observable<TimeSlotResponseDto[]>
- **Calls:** this.http.post

### 🔧 cancelTimeSlot()
- **Does:** Cancels a specific time slot.
- **Params:** slotId: number, reason?: string
- **Returns:** Observable<any>
- **Calls:** this.http.put

### 🔧 cancelSchedule()
- **Does:** Cancels a doctor's schedule.
- **Params:** scheduleId: number, reason?: string
- **Returns:** Observable<any>
- **Calls:** this.http.put

---

## 📁 src/app/services/endpoints.ts
*No functions or methods defined in this file.*

---

## 📁 src/app/services/lab-request.endpoint.ts
### 🔧 getById()
- **Does:** Fetches a specific lab request by its ID.
- **Params:** id: number
- **Returns:** Observable<LabRequestResponseDto>
- **Calls:** this.http.get

### 🔧 getByMedicalRecord()
- **Does:** Fetches all lab requests associated with a medical record.
- **Params:** medicalRecordId: number
- **Returns:** Observable<LabRequestResponseDto[]>
- **Calls:** this.http.get

### 🔧 getByPatient()
- **Does:** Fetches all lab requests for a patient.
- **Params:** patientId: number
- **Returns:** Observable<LabRequestResponseDto[]>
- **Calls:** this.http.get

### 🔧 create()
- **Does:** Creates a new lab request.
- **Params:** dto: CreateLabRequestDto
- **Returns:** Observable<LabRequestResponseDto>
- **Calls:** this.http.post

### 🔧 doctorRequestLabTest()
- **Does:** Sends a request for a lab test initiated by a doctor for a patient.
- **Params:** patientId: number, testName: string
- **Returns:** Observable<LabRequestResponseDto>
- **Calls:** this.http.post

### 🔧 update()
- **Does:** Updates an existing lab request.
- **Params:** id: number, dto: UpdateLabRequestDto
- **Returns:** Observable<LabRequestResponseDto>
- **Calls:** this.http.put

### 🔧 uploadResult()
- **Does:** Uploads results data for a lab request.
- **Params:** id: number, dto: UploadLabResultDto
- **Returns:** Observable<LabRequestResponseDto>
- **Calls:** this.http.put

### 🔧 uploadResultFile()
- **Does:** Uploads a result file (document/image) for a lab request using FormData.
- **Params:** id: number, file: File
- **Returns:** Observable<LabRequestResponseDto>
- **Calls:** this.http.post, FormData.append

### 🔧 uploadPatientLabResult()
- **Does:** Uploads a lab result file directly from a patient for a specific test name using FormData.
- **Params:** patientId: number, testName: string, file: File
- **Returns:** Observable<LabRequestResponseDto>
- **Calls:** this.http.post, FormData.append

---

## 📁 src/app/services/language.service.ts
### 🔧 constructor()
- **Does:** Initializes the language service, applying the saved language preference to the document.
- **Params:** None
- **Returns:** LanguageService
- **Calls:** this.getSavedLanguage, this.applyLanguage

### 🔧 toggleLanguage()
- **Does:** Toggles the language between English ('en') and Arabic ('ar') and updates settings.
- **Params:** None
- **Returns:** void
- **Calls:** this.setLanguage

### 🔧 setLanguage()
- **Does:** Updates the current language signal, persists the setting in localStorage, and applies the document text direction/lang attribute.
- **Params:** lang: AppLanguage
- **Returns:** void
- **Calls:** this.applyLanguage, localStorage.setItem

### 🔧 translate()
- **Does:** Translates a key using the translation map, replacing custom placeholders like {param} with the values in the params object.
- **Params:** key: string, params: Record<string, string> = {}
- **Returns:** string
- **Calls:** Object.entries, String.replace

### 🔧 getSavedLanguage()
- **Does:** Retrieves the saved language from localStorage, defaulting to 'en'.
- **Params:** None
- **Returns:** AppLanguage
- **Calls:** localStorage.getItem

### 🔧 applyLanguage()
- **Does:** Applies the HTML lang and dir (LTR or RTL) attribute values to document.documentElement depending on whether the language is 'ar' or 'en'.
- **Params:** lang: AppLanguage
- **Returns:** void
- **Calls:** None

---

## 📁 src/app/services/medical-record.endpoint.ts
### 🔧 getById()
- **Does:** Fetches a medical record by its ID.
- **Params:** id: number
- **Returns:** Observable<MedicalRecordResponseDto>
- **Calls:** this.http.get

### 🔧 getByAppointment()
- **Does:** Fetches the medical record associated with a specific appointment.
- **Params:** appointmentId: number
- **Returns:** Observable<MedicalRecordResponseDto>
- **Calls:** this.http.get

### 🔧 getByPatient()
- **Does:** Fetches all medical records for a patient.
- **Params:** patientId: number
- **Returns:** Observable<MedicalRecordResponseDto[]>
- **Calls:** this.http.get

### 🔧 create()
- **Does:** Creates a new medical record.
- **Params:** dto: CreateMedicalRecordDto
- **Returns:** Observable<MedicalRecordResponseDto>
- **Calls:** this.http.post

### 🔧 update()
- **Does:** Updates an existing medical record.
- **Params:** id: number, dto: UpdateMedicalRecordDto
- **Returns:** Observable<MedicalRecordResponseDto>
- **Calls:** this.http.put

### 🔧 uploadAttachment()
- **Does:** Uploads a file attachment for a medical record using FormData.
- **Params:** id: number, file: File
- **Returns:** Observable<MedicalRecordResponseDto>
- **Calls:** this.http.post, FormData.append

### 🔧 deleteAttachment()
- **Does:** Removes the file attachment of a medical record.
- **Params:** id: number
- **Returns:** Observable<MedicalRecordResponseDto>
- **Calls:** this.http.delete

### 🔧 delete()
- **Does:** Deletes a medical record by its ID.
- **Params:** id: number
- **Returns:** Observable<any>
- **Calls:** this.http.delete

---

## 📁 src/app/services/notification.endpoint.ts
### 🔧 getByPatient()
- **Does:** Fetches all notifications for a patient.
- **Params:** patientId: number
- **Returns:** Observable<NotificationResponseDto[]>
- **Calls:** this.http.get

### 🔧 getUnreadCount()
- **Does:** Fetches the count of unread notifications for a patient.
- **Params:** patientId: number
- **Returns:** Observable<number>
- **Calls:** this.http.get

### 🔧 markAsRead()
- **Does:** Marks a specific notification as read.
- **Params:** id: number
- **Returns:** Observable<void>
- **Calls:** this.http.put

### 🔧 markAllAsRead()
- **Does:** Marks all notifications of a patient as read.
- **Params:** patientId: number
- **Returns:** Observable<void>
- **Calls:** this.http.put

### 🔧 delete()
- **Does:** Deletes a specific notification by ID.
- **Params:** id: number
- **Returns:** Observable<void>
- **Calls:** this.http.delete

### 🔧 clearAll()
- **Does:** Deletes all notifications for a patient.
- **Params:** patientId: number
- **Returns:** Observable<void>
- **Calls:** this.http.delete

---

## 📁 src/app/services/patient.endpoint.ts
### 🔧 getAll()
- **Does:** Retrieves all patients.
- **Params:** None
- **Returns:** Observable<PatientResponseDto[]>
- **Calls:** this.http.get

### 🔧 getById()
- **Does:** Retrieves a specific patient by their ID.
- **Params:** id: number
- **Returns:** Observable<PatientResponseDto>
- **Calls:** this.http.get

### 🔧 getByUserId()
- **Does:** Retrieves a patient profile by user ID.
- **Params:** userId: string
- **Returns:** Observable<PatientResponseDto>
- **Calls:** this.http.get

### 🔧 update()
- **Does:** Updates a patient's profile details.
- **Params:** id: number, dto: UpdatePatientDto
- **Returns:** Observable<PatientResponseDto>
- **Calls:** this.http.put

### 🔧 uploadProfileImage()
- **Does:** Uploads a profile image for a patient using FormData.
- **Params:** id: number, image: File
- **Returns:** Observable<PatientResponseDto>
- **Calls:** this.http.post, FormData.append

### 🔧 delete()
- **Does:** Deletes a patient profile.
- **Params:** id: number
- **Returns:** Observable<void>
- **Calls:** this.http.delete

---

## 📁 src/app/services/payment.endpoint.ts
### 🔧 getById()
- **Does:** Retrieves a specific payment record by ID.
- **Params:** id: number
- **Returns:** Observable<PaymentResponseDto>
- **Calls:** this.http.get

### 🔧 getByAppointment()
- **Does:** Retrieves the payment details for a specific appointment ID.
- **Params:** appointmentId: number
- **Returns:** Observable<PaymentResponseDto>
- **Calls:** this.http.get

### 🔧 create()
- **Does:** Creates a new payment record.
- **Params:** dto: CreatePaymentDto
- **Returns:** Observable<PaymentResponseDto>
- **Calls:** this.http.post

### 🔧 markAsPaid()
- **Does:** Marks a payment as paid.
- **Params:** id: number
- **Returns:** Observable<PaymentResponseDto>
- **Calls:** this.http.put

### 🔧 refund()
- **Does:** Processes a refund for a payment record.
- **Params:** id: number
- **Returns:** Observable<PaymentResponseDto>
- **Calls:** this.http.put

---

## 📁 src/app/services/prescription.endpoint.ts
### 🔧 getById()
- **Does:** Retrieves a specific prescription by ID.
- **Params:** id: number
- **Returns:** Observable<PrescriptionResponseDto>
- **Calls:** this.http.get

### 🔧 getByMedicalRecord()
- **Does:** Retrieves all prescriptions associated with a medical record ID.
- **Params:** medicalRecordId: number
- **Returns:** Observable<PrescriptionResponseDto[]>
- **Calls:** this.http.get

### 🔧 getByPatient()
- **Does:** Retrieves all prescriptions for a patient.
- **Params:** patientId: number
- **Returns:** Observable<PrescriptionResponseDto[]>
- **Calls:** this.http.get

### 🔧 create()
- **Does:** Creates a new prescription.
- **Params:** dto: CreatePrescriptionDto
- **Returns:** Observable<PrescriptionResponseDto>
- **Calls:** this.http.post

### 🔧 update()
- **Does:** Updates an existing prescription.
- **Params:** id: number, dto: UpdatePrescriptionDto
- **Returns:** Observable<PrescriptionResponseDto>
- **Calls:** this.http.put

### 🔧 delete()
- **Does:** Deletes a prescription record.
- **Params:** id: number
- **Returns:** Observable<void>
- **Calls:** this.http.delete

---

## 📁 src/app/services/review.endpoint.ts
### 🔧 getByDoctor()
- **Does:** Retrieves all reviews for a doctor.
- **Params:** doctorId: number
- **Returns:** Observable<ReviewResponseDto[]>
- **Calls:** this.http.get

### 🔧 getByPatient()
- **Does:** Retrieves all reviews written by a patient.
- **Params:** patientId: number
- **Returns:** Observable<ReviewResponseDto[]>
- **Calls:** this.http.get

### 🔧 create()
- **Does:** Creates a new review.
- **Params:** dto: CreateReviewDto
- **Returns:** Observable<ReviewResponseDto>
- **Calls:** this.http.post

### 🔧 update()
- **Does:** Updates an existing review.
- **Params:** id: number, dto: UpdateReviewDto
- **Returns:** Observable<ReviewResponseDto>
- **Calls:** this.http.put

### 🔧 delete()
- **Does:** Deletes a review.
- **Params:** id: number
- **Returns:** Observable<void>
- **Calls:** this.http.delete

---

## 📁 src/app/pages/admin/dashboard/admin-dashboard.component.ts
### 🔧 getEmptyDoctor()
- **Does:** Returns a fresh empty doctor template object with default values for form initialization.
- **Params:** None
- **Returns:** any
- **Calls:** None

### 🔧 ngOnInit()
- **Does:** Component lifecycle hook that retrieves the current logged-in user and kicks off loading of all admin-related statistics.
- **Params:** None
- **Returns:** void
- **Calls:** AuthService.getCurrentUser, this.loadAll

### 🔧 loadAll()
- **Does:** Orchestrates loading doctors, patients, departments, appointments, and revenue reports by making backend endpoint calls.
- **Params:** None
- **Returns:** void
- **Calls:** DoctorEndpoint.getAll, PatientEndpoint.getAll, DepartmentEndpoint.getAll, this.loadRevenueReport, AppointmentEndpoint.getAll

### 🔧 loadRevenueReport()
- **Does:** Fetches the revenue report from the admin endpoint.
- **Params:** None
- **Returns:** void
- **Calls:** AdminEndpoint.getRevenueReport

### 🔧 getChartPoints()
- **Does:** Calculates and formats SVG polyline coordinates representing revenue data over time.
- **Params:** None
- **Returns:** string
- **Calls:** Math.max

### 🔧 getChartFillPoints()
- **Does:** Calculates and formats SVG polygon fill coordinates representing the shaded area under the revenue chart.
- **Params:** None
- **Returns:** string
- **Calls:** this.getChartPoints

### 🔧 getChartStartDate()
- **Does:** Retrieves the start date (oldest record) in the revenue report series.
- **Params:** None
- **Returns:** string
- **Calls:** None

### 🔧 getChartMiddleDate()
- **Does:** Retrieves the midpoint date in the revenue report series.
- **Params:** None
- **Returns:** string
- **Calls:** Math.floor

### 🔧 getChartEndDate()
- **Does:** Retrieves the end date (newest record) in the revenue report series.
- **Params:** None
- **Returns:** string
- **Calls:** None

### 🔧 setTab()
- **Does:** Sets the active sidebar tab and collapses the sidebar.
- **Params:** tab: string
- **Returns:** void
- **Calls:** None

### 🔧 getTodayAppointments()
- **Does:** Calculates the total number of appointments scheduled for today.
- **Params:** None
- **Returns:** number
- **Calls:** None

### 🔧 getStatusClass()
- **Does:** Maps a status string (e.g. Confirmed, Pending) to its CSS badge class name.
- **Params:** status: string
- **Returns:** string
- **Calls:** None

### 🔧 getInitials()
- **Does:** Extracts initials from a user's name for placeholder avatar display.
- **Params:** name: string
- **Returns:** string
- **Calls:** None

### 🔧 openDoctorModal()
- **Does:** Opens the Add Doctor modal dialog, clearing forms and alerts.
- **Params:** None
- **Returns:** void
- **Calls:** this.getEmptyDoctor

### 🔧 closeDoctorModal()
- **Does:** Closes the Add Doctor modal dialog.
- **Params:** None
- **Returns:** void
- **Calls:** None

### 🔧 submitDoctor()
- **Does:** Formats form input fields and registers a new doctor, subsequently reloading the doctors list.
- **Params:** None
- **Returns:** void
- **Calls:** AuthEndpoint.registerDoctor, DoctorEndpoint.getAll, this.closeDoctorModal, setTimeout

### 🔧 openDeptModal()
- **Does:** Opens the Add Department modal dialog, clearing forms and alerts.
- **Params:** None
- **Returns:** void
- **Calls:** None

### 🔧 closeDeptModal()
- **Does:** Closes the Add Department modal.
- **Params:** None
- **Returns:** void
- **Calls:** None

### 🔧 submitDept()
- **Does:** Creates a new department via the API, subsequently reloading the department list.
- **Params:** None
- **Returns:** void
- **Calls:** DepartmentEndpoint.create, DepartmentEndpoint.getAll, this.closeDeptModal, setTimeout

### 🔧 deleteDoctor()
- **Does:** Deletes a doctor account by calling the API and updating local lists.
- **Params:** id: number
- **Returns:** void
- **Calls:** confirm, DoctorEndpoint.delete

### 🔧 confirmDoctor()
- **Does:** Activates and confirms an unconfirmed doctor account by setting their status to 'Active'.
- **Params:** id: number
- **Returns:** void
- **Calls:** confirm, alert, DoctorEndpoint.update, DoctorEndpoint.getAll

### 🔧 logout()
- **Does:** Performs sign-out tasks and redirects the user.
- **Params:** None
- **Returns:** void
- **Calls:** AuthService.logout

### 🔧 toggleDoctorStatus()
- **Does:** Alternates a doctor's active status between 'Active' and 'Inactive'.
- **Params:** doctor: any
- **Returns:** void
- **Calls:** confirm, alert, DoctorEndpoint.update

### 🔧 getDeptImage()
- **Does:** Returns the department background image path for a department.
- **Params:** name: string
- **Returns:** string | null
- **Calls:** getDepartmentImage

### 🔧 getDeptIcon()
- **Does:** Returns a FontAwesome icon class corresponding to the department name.
- **Params:** name: string
- **Returns:** string
- **Calls:** None

---

## 📁 src/app/pages/appointment/appointment.component.ts
### 🔧 filteredDoctors (computed)()
- **Does:** Evaluates and returns the filtered list of doctors based on search queries and department filters.
- **Params:** None
- **Returns:** any[]
- **Calls:** this.searchTerm, this.selectedDeptFilter, this.doctors

### 🔧 specializations (computed)()
- **Does:** Gets unique and sorted list of doctor specializations.
- **Params:** None
- **Returns:** string[]
- **Calls:** this.doctors

### 🔧 ngOnInit()
- **Does:** Initializes component state, loading data, querying url parameters, and setting up initial searches.
- **Params:** None
- **Returns:** void
- **Calls:** this.loadData, this.handleQueryParams, URLSearchParams.get

### 🔧 loadData()
- **Does:** Loads departments, active doctors (with resolved images), and the current patient's profile from token.
- **Params:** None
- **Returns:** void
- **Calls:** DepartmentEndpoint.getAll, DoctorEndpoint.getAll, resolveDoctorPhoto, AuthService.getUserIdFromToken, PatientEndpoint.getByUserId

### 🔧 handleQueryParams()
- **Does:** Handles routing query parameters if a doctorId is present, preselecting the doctor and taking the user to step 2.
- **Params:** None
- **Returns:** void
- **Calls:** ActivatedRoute.queryParams, DoctorEndpoint.getById, resolveDoctorPhoto, this.loadTimeSlots

### 🔧 selectDoctor()
- **Does:** Selects a doctor, clears slot selection, and transitions to step 2 to load that doctor's time slots.
- **Params:** doc: any
- **Returns:** void
- **Calls:** this.nextStep, this.loadTimeSlots

### 🔧 loadTimeSlots()
- **Does:** Fetches available time slots for the given doctor, saving the first 8 slots.
- **Params:** doctorId: number
- **Returns:** void
- **Calls:** DoctorEndpoint.getTimeSlots

### 🔧 selectSlot()
- **Does:** Selects a specific time slot and formats the date.
- **Params:** slot: any
- **Returns:** void
- **Calls:** None

### 🔧 nextStep()
- **Does:** Advances the booking workflow to the next step, validating selection requirements first.
- **Params:** None
- **Returns:** void
- **Calls:** None

### 🔧 prevStep()
- **Does:** Goes back to the previous step in the booking wizard.
- **Params:** None
- **Returns:** void
- **Calls:** None

### 🔧 submitAppointment()
- **Does:** Submits the booked appointment details to the backend and navigates to the dashboard upon success.
- **Params:** None
- **Returns:** void
- **Calls:** AppointmentEndpoint.create, Router.navigate, setTimeout

### 🔧 getInitials()
- **Does:** Extracts uppercase initials for doctor placeholder avatars.
- **Params:** name: string
- **Returns:** string
- **Calls:** None

### 🔧 formatTime()
- **Does:** Formats a date string into local time display (e.g. HH:MM).
- **Params:** time: string
- **Returns:** string
- **Calls:** Date.toLocaleTimeString

### 🔧 formatDate()
- **Does:** Formats a date string into readable date representation (e.g. Mon, Jan 1).
- **Params:** time: string
- **Returns:** string
- **Calls:** Date.toLocaleDateString

### 🔧 clearFilters()
- **Does:** Clears the filters applied to the doctors directory list.
- **Params:** None
- **Returns:** void
- **Calls:** None

---

## 📁 src/app/pages/chatbot/chatbot.component.ts
### 🔧 suggestions (computed)()
- **Does:** Evaluates and returns the localized list of sample chat prompts depending on the active language.
- **Params:** None
- **Returns:** string[]
- **Calls:** LanguageService.currentLanguage, LanguageService.translate

### 🔧 constructor()
- **Does:** Class constructor that sets the initial system welcome message.
- **Params:** None
- **Returns:** ChatbotComponent
- **Calls:** this.addBotWelcome

### 🔧 ngOnInit()
- **Does:** Angular lifecycle hook that initializes patient sessions and doctors/departments registries.
- **Params:** None
- **Returns:** void
- **Calls:** this.checkPatientSession, this.loadSystemDoctorsAndDepartments

### 🔧 checkPatientSession()
- **Does:** Inspects user login states and retrieves user patient records if authenticated.
- **Params:** None
- **Returns:** void
- **Calls:** AuthService.isLoggedIn, AuthService.getRole, AuthService.getUserIdFromToken, PatientEndpoint.getByUserId, this.loadPatientRecords

### 🔧 loadSystemDoctorsAndDepartments()
- **Does:** Pre-loads lists of all active doctors and departments.
- **Params:** None
- **Returns:** void
- **Calls:** DoctorEndpoint.getAll, DepartmentEndpoint.getAll

### 🔧 getLatestSpecialty()
- **Does:** Walks back through user chat history messages to find the most recently suggested diagnostic specialty.
- **Params:** None
- **Returns:** string | undefined
- **Calls:** None

### 🔧 getDepartmentForSpecialty()
- **Does:** Matches keywords in user symptoms or historical medical records to resolve a system department.
- **Params:** specialty?: string, msgText?: string
- **Returns:** any | null
- **Calls:** this.isPatientLoggedIn, this.patientRecords

### 🔧 loadPatientRecords()
- **Does:** Performs a forkJoin call to simultaneously retrieve all medical records, prescriptions, and lab tests for a patient.
- **Params:** patientId: number
- **Returns:** void
- **Calls:** forkJoin, MedicalRecordEndpoint.getByPatient, PrescriptionEndpoint.getByPatient, LabRequestEndpoint.getByPatient

### 🔧 toggleRecordsPanel()
- **Does:** Toggles the visibility of the patient health history side-panel.
- **Params:** None
- **Returns:** void
- **Calls:** None

### 🔧 getFileUrl()
- **Does:** Formats a file attachment route into a complete absolute URL pointing to the API host.
- **Params:** path: string
- **Returns:** string
- **Calls:** String.replace

### 🔧 fetchFileAsBlobAndBase64()
- **Does:** Downloads a file (pdf or image) from the backend API and resolves it as an Angular File object.
- **Params:** path: string
- **Returns:** Promise<File | null>
- **Calls:** fetch, response.blob, this.getFileUrl

### 🔧 analyzePrescription()
- **Does:** Submits a text message describing a prescription's details to the AI assistant for automated analysis.
- **Params:** p: any
- **Returns:** Promise<void>
- **Calls:** this.sendMessageWithFiles

### 🔧 analyzeLabTest()
- **Does:** Downloads a lab report file and triggers AI chat analysis for the test results.
- **Params:** lab: any
- **Returns:** Promise<void>
- **Calls:** this.fetchFileAsBlobAndBase64, this.sendMessageWithFiles

### 🔧 analyzeMedicalRecord()
- **Does:** Downloads a medical record attachment and submits vital sign details to the AI chat interface.
- **Params:** mr: any
- **Returns:** Promise<void>
- **Calls:** this.fetchFileAsBlobAndBase64, this.sendMessageWithFiles

### 🔧 getStatusClass()
- **Does:** Maps a generic status string to a CSS badge class.
- **Params:** status: string
- **Returns:** string
- **Calls:** None

### 🔧 addBotWelcome()
- **Does:** Appends a clean new bot welcome greeting to the messages stream and resets the session context.
- **Params:** None
- **Returns:** void
- **Calls:** None

### 🔧 ngAfterViewChecked()
- **Does:** Lifecycle hook that scrolls the chat history element to the bottom after layout checks if requested.
- **Params:** None
- **Returns:** void
- **Calls:** this.scrollToBottom

### 🔧 scrollToBottom()
- **Does:** Scrolls the message display container smoothly to show the latest messages.
- **Params:** None
- **Returns:** void
- **Calls:** ElementRef.scrollIntoView

### 🔧 onFileSelected()
- **Does:** Event handler for file uploads, validating PDF/image file types and saving valid files in state.
- **Params:** event: Event
- **Returns:** void
- **Calls:** alert, Array.from

### 🔧 removeFile()
- **Does:** Discards a selected file attachment before it gets uploaded.
- **Params:** index: number
- **Returns:** void
- **Calls:** None

### 🔧 clearAllFiles()
- **Does:** Clears all queued file attachments and resets the file input DOM reference.
- **Params:** None
- **Returns:** void
- **Calls:** None

### 🔧 messageReferencesPdf()
- **Does:** Returns true if the message mentions a PDF extension or clip symbol.
- **Params:** msg: string
- **Returns:** boolean
- **Calls:** RegExp.test

### 🔧 fetchDemoLabPdf()
- **Does:** Downloads a mock lab report PDF asset for demonstration purposes.
- **Params:** None
- **Returns:** Promise<File | null>
- **Calls:** fetch, response.blob

### 🔧 sendDemoLabReport()
- **Does:** Triggers the AI analyzer workflow with the demo lab report file.
- **Params:** None
- **Returns:** Promise<void>
- **Calls:** this.fetchDemoLabPdf, this.sendMessageWithFiles, alert, LanguageService.translate

### 🔧 resolvePdfAttachments()
- **Does:** Checks if user text queries references the mock PDF report, resolving and attaching it automatically if so.
- **Params:** msg: string, files: File[]
- **Returns:** Promise<{ msg: string; files: File[] }>
- **Calls:** this.messageReferencesPdf, this.fetchDemoLabPdf, LanguageService.translate, String.replace, String.trim

### 🔧 filesToBase64()
- **Does:** Asynchronously converts an array of files into base64 encoded payload strings.
- **Params:** files: File[]
- **Returns:** Promise<FileAttachmentDto[]>
- **Calls:** FileReader.readAsDataURL, Promise.all

### 🔧 sendMessage()
- **Does:** Initiates the user chat submit chain, handling mock file resolution and routing the message.
- **Params:** text?: string
- **Returns:** Promise<void>
- **Calls:** this.clearAllFiles, this.resolvePdfAttachments, this.messageReferencesPdf, LanguageService.translate, this.sendMessageWithFiles

### 🔧 sendMessageWithFiles()
- **Does:** Concurrently encodes files, adds user message to layout, handles loading indicators, sends API requests, parses replies, and extracts doctor referral cues.
- **Params:** msg: string, filesToSend: File[], displayOverride?: string
- **Returns:** Promise<void>
- **Calls:** this.filesToBase64, AiEndpoint.chat, this.getLatestSpecialty, this.getDepartmentForSpecialty

### 🔧 onKeyDown()
- **Does:** Intercepts enter key presses inside the textarea element to trigger submission.
- **Params:** e: KeyboardEvent
- **Returns:** void
- **Calls:** this.sendMessage

### 🔧 getUrgencyColor()
- **Does:** Maps an urgency rating to a class color name.
- **Params:** level: string
- **Returns:** string
- **Calls:** None

### 🔧 getUrgencyIcon()
- **Does:** Maps an urgency level to a FontAwesome icon.
- **Params:** level: string
- **Returns:** string
- **Calls:** None

### 🔧 getUrgencyLabel()
- **Does:** Retrieves a localized warning label for critical, moderate, or home care levels.
- **Params:** level: string
- **Returns:** string
- **Calls:** LanguageService.translate

### 🔧 shouldShowDoctorReferral()
- **Does:** Evaluates whether the patient needs to see a doctor (level is critical or moderate).
- **Params:** level: string
- **Returns:** boolean
- **Calls:** None

### 🔧 hasAssessment()
- **Does:** Returns true if the message has a non-empty diagnosis assessment.
- **Params:** d: ChatMessage['diagnosis']
- **Returns:** boolean
- **Calls:** String.trim

### 🔧 parseReply()
- **Does:** Parses standard Markdown text sections, bullet items, numbered items, and header cues into structured component blocks.
- **Params:** text?: string
- **Returns:** BotSection[]
- **Calls:** String.split, String.trim, RegExp.test, RegExp.match, String.replace

### 🔧 clearChat()
- **Does:** Resets chat history signals, cleans files, and schedules a fresh welcome prompt.
- **Params:** None
- **Returns:** void
- **Calls:** this.clearAllFiles, this.addBotWelcome

---

## 📁 src/app/pages/departments/departments.component.ts
### 🔧 filteredDepts (computed)()
- **Does:** Evaluates and filters the list of departments based on the department search query.
- **Params:** None
- **Returns:** any[]
- **Calls:** this.searchTerm, this.departments

### 🔧 ngOnInit()
- **Does:** Lifecycle hook that kicks off the department listing query.
- **Params:** None
- **Returns:** void
- **Calls:** this.loadDepartments

### 🔧 loadDepartments()
- **Does:** Retrieves all departments from the system and automatically pre-selects the first department.
- **Params:** None
- **Returns:** void
- **Calls:** DepartmentEndpoint.getAll, this.selectDept

### 🔧 selectDept()
- **Does:** Selects a department and fetches all active doctors assigned to it (enriching doctor profile photos).
- **Params:** dept: any
- **Returns:** void
- **Calls:** DepartmentEndpoint.getDoctors, resolveDoctorPhoto

### 🔧 getIcon()
- **Does:** Maps a department name to a specific FontAwesome icon class.
- **Params:** name: string
- **Returns:** string
- **Calls:** None

### 🔧 getDeptImage()
- **Does:** Returns the department background image path for a department.
- **Params:** name: string
- **Returns:** string | null
- **Calls:** getDepartmentImage

### 🔧 getColor()
- **Does:** Maps the index of a list to a CSS color representation.
- **Params:** index: number
- **Returns:** string
- **Calls:** None

### 🔧 getInitials()
- **Does:** Extracts initials from a doctor's name for display placeholders.
- **Params:** name: string
- **Returns:** string
- **Calls:** None

---

## 📁 src/app/pages/doctor-dashboard/doctor-dashboard.component.ts
### 🔧 ngOnInit()
- **Does:** Lifecycle hook that queries and sets up the current logged-in user profile, triggering loading doctor profile records.
- **Params:** None
- **Returns:** void
- **Calls:** AuthService.getCurrentUser, this.loadDoctor

### 🔧 loadDoctor()
- **Does:** Resolves doctor user profile detail by calling API with user's subtoken claim.
- **Params:** None
- **Returns:** void
- **Calls:** AuthService.getUserIdFromToken, DoctorEndpoint.getByUserId, this.loadDoctorData

### 🔧 loadDoctorData()
- **Does:** Queries appointments, schedule models, leaves, and reviews for a specific doctor.
- **Params:** doctorId: number
- **Returns:** void
- **Calls:** AppointmentEndpoint.getByDoctor, DoctorEndpoint.getSchedule, DoctorEndpoint.getLeaves, this.reloadComputedTimeSlots, DoctorEndpoint.getReviews

### 🔧 setTab()
- **Does:** Switches active page view context, shutting the dashboard menu tray.
- **Params:** tab: string
- **Returns:** void
- **Calls:** None

### 🔧 getStatusClass()
- **Does:** Maps a status string (e.g. Confirmed, Completed) to its CSS badge class name.
- **Params:** status: string
- **Returns:** string
- **Calls:** None

### 🔧 getTodayAppointments()
- **Does:** Computes today's active appointments.
- **Params:** None
- **Returns:** any[]
- **Calls:** None

### 🔧 getPendingCount()
- **Does:** Returns count of pending appointments.
- **Params:** None
- **Returns:** number
- **Calls:** None

### 🔧 getAvgRating()
- **Does:** Calculates average ratings scored from patients' reviews.
- **Params:** None
- **Returns:** number
- **Calls:** None

### 🔧 getStars()
- **Does:** Returns an array of stars indicator numbers (1 or 0) for layout star displays.
- **Params:** rating: number
- **Returns:** number[]
- **Calls:** Math.round

### 🔧 getDayName()
- **Does:** Resolves day name from weekday index numbers.
- **Params:** day: number
- **Returns:** string
- **Calls:** None

### 🔧 getAvailableScheduleCount()
- **Does:** Computes active working schedules.
- **Params:** None
- **Returns:** number
- **Calls:** None

### 🔧 getFreeTimeSlotsCount()
- **Does:** Counts non-booked time slots.
- **Params:** None
- **Returns:** number
- **Calls:** None

### 🔧 getBookedTimeSlotsCount()
- **Does:** Counts booked time slots.
- **Params:** None
- **Returns:** number
- **Calls:** None

### 🔧 getGroupedTimeSlots()
- **Does:** Groups and sorts time slots chronologically.
- **Params:** None
- **Returns:** any[]
- **Calls:** None

### 🔧 reloadComputedTimeSlots()
- **Does:** Refreshes time slots preview cache over a 60-day date range.
- **Params:** doctorId: number
- **Returns:** void
- **Calls:** DoctorEndpoint.getTimeSlotsRange

### 🔧 openRecordModal()
- **Does:** Opens modal for adding or editing appointment medical records, pre-loading records if they exist.
- **Params:** apt: any
- **Returns:** void
- **Calls:** MedicalRecordEndpoint.getByAppointment

### 🔧 openPatientModal()
- **Does:** Shows details, history, allergies, and lab results of a patient.
- **Params:** apt: any
- **Returns:** void
- **Calls:** PatientEndpoint.getById, this.loadPatientLabRequests

### 🔧 loadPatientLabRequests()
- **Does:** Queries lab requests and reports history for a patient.
- **Params:** patientId: number
- **Returns:** void
- **Calls:** LabRequestEndpoint.getByPatient

### 🔧 appendMedicalHistory()
- **Does:** Appends new entries to a patient's medical history text.
- **Params:** None
- **Returns:** void
- **Calls:** PatientEndpoint.update

### 🔧 closeRecordModal()
- **Does:** Resets record editing state and hides the record modal.
- **Params:** None
- **Returns:** void
- **Calls:** None

### 🔧 closePatientModal()
- **Does:** Resets details state and closes the patient summary modal.
- **Params:** None
- **Returns:** void
- **Calls:** None

### 🔧 toggleLabResultsSection()
- **Does:** Minimizes or expands the patient lab tests section in details modal.
- **Params:** None
- **Returns:** void
- **Calls:** None

### 🔧 openLabModal()
- **Does:** Displays laboratory request modal for an appointment.
- **Params:** apt: any
- **Returns:** void
- **Calls:** this.loadPatientLabRequests

### 🔧 closeLabModal()
- **Does:** Resets lab modal states and closes it.
- **Params:** None
- **Returns:** void
- **Calls:** None

### 🔧 submitLabRequest()
- **Does:** Dispatches a laboratory test request for a patient.
- **Params:** None
- **Returns:** void
- **Calls:** LabRequestEndpoint.doctorRequestLabTest

### 🔧 updateAllergies()
- **Does:** Updates a patient's allergy notes.
- **Params:** None
- **Returns:** void
- **Calls:** PatientEndpoint.update

### 🔧 openScheduleModal()
- **Does:** Resets form values and opens doctor scheduling template modal.
- **Params:** None
- **Returns:** void
- **Calls:** None

### 🔧 closeScheduleModal()
- **Does:** Closes doctor scheduling modal.
- **Params:** None
- **Returns:** void
- **Calls:** None

### 🔧 submitSchedule()
- **Does:** Configures and registers a new weekly working hours schedule.
- **Params:** None
- **Returns:** void
- **Calls:** DoctorEndpoint.createSchedule, this.reloadComputedTimeSlots, setTimeout

### 🔧 deleteSchedule()
- **Does:** Removes a doctor's weekly work schedule.
- **Params:** id: number
- **Returns:** void
- **Calls:** DoctorEndpoint.deleteSchedule, this.reloadComputedTimeSlots

### 🔧 toggleScheduleAvailability()
- **Does:** Switches availability state for a specific schedule segment.
- **Params:** schedule: any
- **Returns:** void
- **Calls:** DoctorEndpoint.updateSchedule, this.reloadComputedTimeSlots

### 🔧 onRecordFileSelected()
- **Does:** Captures file object selection for medical record attachments.
- **Params:** event: any
- **Returns:** void
- **Calls:** None

### 🔧 submitRecord()
- **Does:** Persists or updates the diagnosis/notes record, uploading files if present.
- **Params:** None
- **Returns:** void
- **Calls:** MedicalRecordEndpoint.update, MedicalRecordEndpoint.uploadAttachment, MedicalRecordEndpoint.create

### 🔧 deleteAttachment()
- **Does:** Discards file attachment of a medical record.
- **Params:** None
- **Returns:** void
- **Calls:** confirm, MedicalRecordEndpoint.deleteAttachment

### 🔧 confirmAppointment()
- **Does:** Confirms a patient's appointment.
- **Params:** id: number
- **Returns:** void
- **Calls:** AppointmentEndpoint.confirm

### 🔧 cancelAppointment()
- **Does:** Cancels a patient's appointment.
- **Params:** id: number
- **Returns:** void
- **Calls:** confirm, AppointmentEndpoint.cancel

### 🔧 cancelTimeSlot()
- **Does:** Cancels a doctor's single time slot.
- **Params:** slotId: number
- **Returns:** void
- **Calls:** confirm, DoctorEndpoint.cancelTimeSlot, this.loadDoctorData

### 🔧 cancelSchedule()
- **Does:** Cancels all future slots and appointments of a doctor's weekly schedule template.
- **Params:** scheduleId: number
- **Returns:** void
- **Calls:** confirm, DoctorEndpoint.cancelSchedule, this.loadDoctorData, this.reloadComputedTimeSlots, alert

### 🔧 completeAppointment()
- **Does:** Concludes an appointment, marking it complete.
- **Params:** id: number
- **Returns:** void
- **Calls:** AppointmentEndpoint.complete

### 🔧 getInitials()
- **Does:** Returns patient initials for layout placeholder avatar displays.
- **Params:** name: string
- **Returns:** string
- **Calls:** None

### 🔧 logout()
- **Does:** Discards authorization tokens and navigates user away.
- **Params:** None
- **Returns:** void
- **Calls:** AuthService.logout

### 🔧 getFileUrl()
- **Does:** Resolves absolute URL path for download attachments.
- **Params:** path: string
- **Returns:** string
- **Calls:** resolveMediaUrl

### 🔧 getProfileImageUrl()
- **Does:** Formats current doctor's profile picture path.
- **Params:** None
- **Returns:** string
- **Calls:** resolveMediaUrl

### 🔧 onProfileImageSelected()
- **Does:** Validates and uploads a new doctor profile picture.
- **Params:** event: Event
- **Returns:** void
- **Calls:** DoctorEndpoint.uploadProfileImage, parseApiError, window.dispatchEvent

---

## 📁 src/app/pages/doctors/doctors.component.ts
### 🔧 filteredDoctors (computed)()
- **Does:** Filters doctors list dynamically by search term and selected department.
- **Params:** None
- **Returns:** DoctorResponseDto[]
- **Calls:** this.searchTerm, this.selectedDept, this.allDoctors

### 🔧 uniqueDepartments (computed)()
- **Does:** Evaluates unique department names extracted from loaded doctors.
- **Params:** None
- **Returns:** string[]
- **Calls:** this.allDoctors

### 🔧 hasActiveFilters (computed)()
- **Does:** Checks if search input or department filter is active.
- **Params:** None
- **Returns:** boolean
- **Calls:** this.searchTerm, this.selectedDept

### 🔧 ngOnInit()
- **Does:** Angular lifecycle hook that initializes doctors list loading.
- **Params:** None
- **Returns:** void
- **Calls:** this.loadDoctors

### 🔧 loadDoctors()
- **Does:** Fetches all doctors profiles and resolves images.
- **Params:** None
- **Returns:** void
- **Calls:** DoctorEndpoint.getAll, resolveDoctorPhoto

### 🔧 openDoctor()
- **Does:** Opens modal for a specific doctor, sets active modal tab, and loads details.
- **Params:** doc: DoctorResponseDto
- **Returns:** void
- **Calls:** this.loadDoctorDetails

### 🔧 loadDoctorDetails()
- **Does:** Loads time slots (today onwards) and reviews for the chosen doctor.
- **Params:** id: number
- **Returns:** void
- **Calls:** DoctorEndpoint.getTimeSlots, DoctorEndpoint.getReviews

### 🔧 closeModal()
- **Does:** Closes doctor details modal and clears active doctor state.
- **Params:** None
- **Returns:** void
- **Calls:** None

### 🔧 clearFilters()
- **Does:** Resets search filters and department selection.
- **Params:** None
- **Returns:** void
- **Calls:** None

### 🔧 getInitials()
- **Does:** Gets uppercase initials from a doctor's name.
- **Params:** name: string
- **Returns:** string
- **Calls:** None

### 🔧 getStars()
- **Does:** Generates 5-element array filled with 1s (active stars) or 0s (empty stars).
- **Params:** rating: number
- **Returns:** number[]
- **Calls:** Math.round

### 🔧 formatTime()
- **Does:** Formats date string to 2-digit hours/minutes time representation.
- **Params:** time: string
- **Returns:** string
- **Calls:** Date.toLocaleTimeString

### 🔧 formatDate()
- **Does:** Formats date string to readable weekday + month + day representation.
- **Params:** time: string
- **Returns:** string
- **Calls:** Date.toLocaleDateString

### 🔧 bookAppointment()
- **Does:** Navigates to /appointment page pre-selecting the doctor.
- **Params:** doctorId: number
- **Returns:** void
- **Calls:** this.closeModal, Router.navigate

---

## 📁 src/app/pages/home/home.component.ts
### 🔧 ngOnInit()
- **Does:** Lifecyle hook that loads departments and doctors, starts rotations of promotions and partners, and pulls patient notifications if logged in.
- **Params:** None
- **Returns:** void
- **Calls:** this.loadDepartments, this.loadDoctors, this.startPromotionRotation, this.startPartnerRotation, this.loadNotificationsIfPatient

### 🔧 loadNotificationsIfPatient()
- **Does:** Pulls notification logs for patients, translates doctor cancellation notifications to patient-friendly alerts, and updates counts.
- **Params:** None
- **Returns:** void
- **Calls:** AuthService.getRole, AuthService.getUserIdFromToken, PatientEndpoint.getByUserId, NotificationEndpoint.getByPatient, window.dispatchEvent

### 🔧 markNotificationAsRead()
- **Does:** Marks a specific notification as read on the backend and updates local signals/events.
- **Params:** id: number
- **Returns:** void
- **Calls:** NotificationEndpoint.markAsRead, window.dispatchEvent

### 🔧 dismissNotification()
- **Does:** Deletes a notification from patient history and updates counts.
- **Params:** id: number
- **Returns:** void
- **Calls:** NotificationEndpoint.delete, window.dispatchEvent

### 🔧 ngOnDestroy()
- **Does:** Lifecyle cleanup that clears promo and hospital rotation interval timers.
- **Params:** None
- **Returns:** void
- **Calls:** window.clearInterval

### 🔧 startPromotionRotation()
- **Does:** Starts an interval timer to rotate active promotion slides.
- **Params:** None
- **Returns:** void
- **Calls:** window.setInterval

### 🔧 startPartnerRotation()
- **Does:** Starts an interval timer to rotate hospital partner logo slides.
- **Params:** None
- **Returns:** void
- **Calls:** window.setInterval

### 🔧 loadDepartments()
- **Does:** Queries and loads top 6 medical departments.
- **Params:** None
- **Returns:** void
- **Calls:** DepartmentEndpoint.getAll

### 🔧 loadDoctors()
- **Does:** Queries and loads top 4 active doctors, resolving their profile pictures.
- **Params:** None
- **Returns:** void
- **Calls:** DoctorEndpoint.getAll, resolveDoctorPhoto

### 🔧 getDoctorInitials()
- **Does:** Extracts initials from a doctor's name for layout placeholder avatar display.
- **Params:** name: string
- **Returns:** string
- **Calls:** None

---

## 📁 src/app/pages/login/login.component.ts
### 🔧 constructor()
- **Does:** Checks if a user is already logged in, redirecting them to their respective dashboard role page.
- **Params:** None
- **Returns:** LoginComponent
- **Calls:** AuthService.isLoggedIn, AuthService.getRole, this.redirectByRole

### 🔧 togglePassword()
- **Does:** Toggles the password field input text visibility.
- **Params:** None
- **Returns:** void
- **Calls:** None

### 🔧 onSubmit()
- **Does:** Handles user login submission, saving user authentication tokens in localStorage and initiating role-based redirects.
- **Params:** None
- **Returns:** void
- **Calls:** AuthEndpoint.login, localStorage.setItem, JSON.stringify, this.redirectByRole

### 🔧 redirectByRole()
- **Does:** Redirects the router to the dashboard path corresponding to the user's role.
- **Params:** role: string
- **Returns:** void
- **Calls:** Router.navigate

---

## 📁 src/app/pages/patient-dashboard/patient-dashboard.component.ts
### 🔧 ngOnInit()
- **Does:** Lifecyle hook that loads current user's profile and kicks off patient data query.
- **Params:** None
- **Returns:** void
- **Calls:** AuthService.getCurrentUser, this.loadPatient

### 🔧 loadPatient()
- **Does:** Fetches patient detail record based on sub token claim.
- **Params:** None
- **Returns:** void
- **Calls:** AuthService.getUserIdFromToken, PatientEndpoint.getByUserId, this.loadAllData

### 🔧 loadAllData()
- **Does:** Calls forkJoin to aggregate patient appointments, medical history, prescriptions, labs, and notifications.
- **Params:** patientId: number
- **Returns:** void
- **Calls:** DoctorEndpoint.getAll, forkJoin, AppointmentEndpoint.getByPatient, MedicalRecordEndpoint.getByPatient, PrescriptionEndpoint.getByPatient, LabRequestEndpoint.getByPatient, NotificationEndpoint.getByPatient, this.updateTotalBadgeCount

### 🔧 setTab()
- **Does:** Switches layout tabs, updating localStorage session markers for red-dot notifications and triggering read-receipts.
- **Params:** tab: string
- **Returns:** void
- **Calls:** localStorage.setItem, this.updateTotalBadgeCount, NotificationEndpoint.markAllAsRead, this.loadReviewsData

### 🔧 updateTotalBadgeCount()
- **Does:** Calculates and updates total unread notifications and notifies navigation components via custom window event.
- **Params:** None
- **Returns:** void
- **Calls:** this.hasNewPrescriptions, this.hasNewLabRequests, this.hasNewMedicalRecords, window.dispatchEvent

### 🔧 dismissNotification()
- **Does:** Deletes patient notification by ID.
- **Params:** id: number
- **Returns:** void
- **Calls:** NotificationEndpoint.delete, this.updateTotalBadgeCount

### 🔧 markAsRead()
- **Does:** Marks notification as read.
- **Params:** id: number
- **Returns:** void
- **Calls:** NotificationEndpoint.markAsRead, this.updateTotalBadgeCount

### 🔧 deleteNotification()
- **Does:** Prompts deletion confirmation, then removes notification.
- **Params:** id: number
- **Returns:** void
- **Calls:** confirm, NotificationEndpoint.delete, this.updateTotalBadgeCount

### 🔧 clearAllNotifications()
- **Does:** Clears all notification history logs for patient.
- **Params:** None
- **Returns:** void
- **Calls:** confirm, NotificationEndpoint.clearAll, this.updateTotalBadgeCount

### 🔧 hasNewPrescriptions()
- **Does:** Checks if there are prescriptions created after the patient's last view timestamp.
- **Params:** None
- **Returns:** boolean
- **Calls:** localStorage.getItem

### 🔧 hasNewLabRequests()
- **Does:** Checks if there are lab requests created after the last view timestamp.
- **Params:** None
- **Returns:** boolean
- **Calls:** localStorage.getItem

### 🔧 hasNewMedicalRecords()
- **Does:** Checks if there are medical records created after the last view timestamp.
- **Params:** None
- **Returns:** boolean
- **Calls:** localStorage.getItem

### 🔧 getNewPrescriptionsCount()
- **Does:** Gets number of unread prescriptions.
- **Params:** None
- **Returns:** number
- **Calls:** localStorage.getItem

### 🔧 getNewLabCount()
- **Does:** Gets number of unread lab requests.
- **Params:** None
- **Returns:** number
- **Calls:** localStorage.getItem

### 🔧 getNewMedicalRecordsCount()
- **Does:** Gets number of unread medical records.
- **Params:** None
- **Returns:** number
- **Calls:** localStorage.getItem

### 🔧 getNewAppointmentsCount()
- **Does:** Gets count of newly booked appointments since last viewed.
- **Params:** None
- **Returns:** number
- **Calls:** localStorage.getItem

### 🔧 getStatusClass()
- **Does:** Resolves badge style depending on the status.
- **Params:** status: string
- **Returns:** string
- **Calls:** None

### 🔧 getUpcoming()
- **Does:** Returns the first three active/pending appointments.
- **Params:** None
- **Returns:** any[]
- **Calls:** None

### 🔧 getInitials()
- **Does:** Computes initials for patient avatar icon.
- **Params:** name: string
- **Returns:** string
- **Calls:** None

### 🔧 logout()
- **Does:** Logs out patient.
- **Params:** None
- **Returns:** void
- **Calls:** AuthService.logout

### 🔧 completedAppointments (getter)()
- **Does:** Gets list of completed appointments that have not yet been reviewed.
- **Params:** None
- **Returns:** any[]
- **Calls:** None

### 🔧 getAptDoctorName()
- **Does:** Resolves doctor name from the doctor cache for an appointment.
- **Params:** apt: any
- **Returns:** string
- **Calls:** None

### 🔧 getAptDoctorSpec()
- **Does:** Resolves doctor specialization for an appointment.
- **Params:** apt: any
- **Returns:** string
- **Calls:** None

### 🔧 loadReviewsData()
- **Does:** Loads all reviews written by this patient.
- **Params:** None
- **Returns:** void
- **Calls:** DoctorEndpoint.getAll, ReviewEndpoint.getByPatient

### 🔧 openReviewForm()
- **Does:** Resets form state and opens new review dialogue.
- **Params:** None
- **Returns:** void
- **Calls:** None

### 🔧 selectAppointmentForReview()
- **Does:** Selects appointment and corresponding doctor for review.
- **Params:** apt: any
- **Returns:** void
- **Calls:** None

### 🔧 closeReviewForm()
- **Does:** Closes review form modal.
- **Params:** None
- **Returns:** void
- **Calls:** None

### 🔧 setReviewStar()
- **Does:** Sets rating stars count.
- **Params:** star: number
- **Returns:** void
- **Calls:** None

### 🔧 setHoverStar()
- **Does:** Captures star hover visual styling indicator.
- **Params:** star: number
- **Returns:** void
- **Calls:** None

### 🔧 clearHoverStar()
- **Does:** Resets star hover styling.
- **Params:** None
- **Returns:** void
- **Calls:** None

### 🔧 getDisplayRating()
- **Does:** Gets rating value to display (hover rating takes priority, fallback to chosen rating).
- **Params:** None
- **Returns:** number
- **Calls:** None

### 🔧 submitReview()
- **Does:** Submits a review and appends it to list on success.
- **Params:** None
- **Returns:** void
- **Calls:** ReviewEndpoint.create, this.closeReviewForm, setTimeout

### 🔧 deleteReview()
- **Does:** Deletes a patient review.
- **Params:** id: number
- **Returns:** void
- **Calls:** confirm, ReviewEndpoint.delete

### 🔧 getDoctorName()
- **Does:** Resolves doctor full name from doctor list.
- **Params:** doctorId: number
- **Returns:** string
- **Calls:** None

### 🔧 getDoctorSpec()
- **Does:** Resolves doctor specialization.
- **Params:** doctorId: number
- **Returns:** string
- **Calls:** None

### 🔧 getStars()
- **Does:** Computes star array indicators for UI display.
- **Params:** rating: number
- **Returns:** number[]
- **Calls:** Math.round

### 🔧 getFileUrl()
- **Does:** Returns absolute media URL path.
- **Params:** path: string
- **Returns:** string
- **Calls:** resolveMediaUrl

### 🔧 getProfileImageUrl()
- **Does:** Formats patient profile image URL.
- **Params:** None
- **Returns:** string
- **Calls:** resolveMediaUrl

### 🔧 onProfileImageSelected()
- **Does:** Handles patient profile picture upload.
- **Params:** event: Event
- **Returns:** void
- **Calls:** PatientEndpoint.uploadProfileImage, parseApiError, window.dispatchEvent

### 🔧 deleteRecord()
- **Does:** Deletes a medical record from history.
- **Params:** id: number
- **Returns:** void
- **Calls:** confirm, MedicalRecordEndpoint.delete

### 🔧 openLabUploadForm()
- **Does:** Opens modal for patient lab upload.
- **Params:** None
- **Returns:** void
- **Calls:** None

### 🔧 closeLabUploadForm()
- **Does:** Closes lab upload form.
- **Params:** None
- **Returns:** void
- **Calls:** None

### 🔧 onNewLabFileSelected()
- **Does:** Selects new lab PDF report file.
- **Params:** event: any
- **Returns:** void
- **Calls:** alert

### 🔧 submitPatientLabUpload()
- **Does:** Submits a patient's custom laboratory test PDF result.
- **Params:** None
- **Returns:** void
- **Calls:** alert, LabRequestEndpoint.uploadPatientLabResult, this.closeLabUploadForm

### 🔧 onLabFileSelected()
- **Does:** Uploads a PDF result file for an existing lab request.
- **Params:** event: any, labId: number
- **Returns:** void
- **Calls:** alert, LabRequestEndpoint.uploadResultFile

---

## 📁 src/app/pages/signup/signup.component.ts
### 🔧 ngOnInit()
- **Does:** Lifecyle hook that loads the departments list from backend for doctor selection.
- **Params:** None
- **Returns:** void
- **Calls:** DepartmentEndpoint.getAll

### 🔧 nextStep()
- **Does:** Validates fields of the current step, updating error messages, and increments currentStep signal on success.
- **Params:** None
- **Returns:** void
- **Calls:** this.validateStepOne, this.validateStepTwo

### 🔧 prevStep()
- **Does:** Decrements the signup wizard step signal.
- **Params:** None
- **Returns:** void
- **Calls:** None

### 🔧 onSubmit()
- **Does:** Formulates parameters, validates all wizard step fields, dispatches a patient/doctor signup endpoint call, and saves session tokens or redirects.
- **Params:** None
- **Returns:** void
- **Calls:** LanguageService.translate, this.validateStepOne, this.validateStepTwo, this.validateDoctorStep, AuthEndpoint.registerPatient, localStorage.setItem, JSON.stringify, Router.navigate, parseApiError, this.focusStepForError, AuthEndpoint.registerDoctor, alert

### 🔧 focusStepForError()
- **Does:** Sets the signup step indicator according to fields containing validation errors.
- **Params:** None
- **Returns:** void
- **Calls:** None

### 🔧 validateStepOne()
- **Does:** Checks requirements for step 1 (Personal details: names, national ID length, birth date).
- **Params:** None
- **Returns:** string
- **Calls:** LanguageService.translate

### 🔧 validateStepTwo()
- **Does:** Checks requirements for step 2 (Account details: email format, matching password fields, password strength/digits).
- **Params:** None
- **Returns:** string
- **Calls:** LanguageService.translate

### 🔧 validateDoctorStep()
- **Does:** Checks requirements for step 3 for doctor role registration (valid license, department mapping, specialization).
- **Params:** None
- **Returns:** string
- **Calls:** LanguageService.translate

### 🔧 getStepProgress()
- **Does:** Calculates current progress percentage for step indicators.
- **Params:** None
- **Returns:** number
- **Calls:** None

### 🔧 onImageSelected()
- **Does:** Validates file type and reads locally uploaded profile image files, generating temporary preview URLs.
- **Params:** event: Event
- **Returns:** void
- **Calls:** URL.createObjectURL

---

## 📁 src/app/components/back-button/back-button.component.ts
### 🔧 showBackButton()
- **Does:** Evaluates whether to show the floating back button based on forceShow or the current URL.
- **Params:** None
- **Returns:** boolean
- **Calls:** None

### 🔧 goBack()
- **Does:** Triggers navigation back to the previous location in browser history, or defaults to the home path '/' if no history is available.
- **Params:** None
- **Returns:** void
- **Calls:** Location.back, Router.navigate

---

## 📁 src/app/components/footer/footer.component.ts
*No functions or methods defined in this file.*

---

## 📁 src/app/components/header/header.component.ts
### 🔧 onScroll()
- **Does:** HostListener for scroll events that updates the scroll state signal depending on window vertical offset.
- **Params:** None
- **Returns:** void
- **Calls:** None

### 🔧 ngOnInit()
- **Does:** Component lifecycle hook that checks user authentication status and subscribes to router changes to update layout components.
- **Params:** None
- **Returns:** void
- **Calls:** this.checkAuth

### 🔧 onProfileUpdated()
- **Does:** HostListener that intercepts profile update signals to reload user avatars in navigation bars.
- **Params:** None
- **Returns:** void
- **Calls:** this.loadUserAvatar

### 🔧 onNotificationsUpdated()
- **Does:** HostListener that captures custom notification dispatch payloads, recalculating read and unread badge alerts.
- **Params:** event?: any
- **Returns:** void
- **Calls:** AuthService.getUserIdFromToken, localStorage.getItem, localStorage.setItem, PatientEndpoint.getByUserId, this.loadUnreadNotificationsCount

### 🔧 checkAuth()
- **Does:** Validates if a user is logged in, setting state indicators (role, full name, profile picture) or clearing them if logged out.
- **Params:** None
- **Returns:** void
- **Calls:** AuthService.getCurrentUser, this.loadUserAvatar

### 🔧 loadUnreadNotificationsCount()
- **Does:** Loads number of unread notifications, utilizing local storage if present or making a direct endpoint query.
- **Params:** patientId: number
- **Returns:** void
- **Calls:** localStorage.getItem, NotificationEndpoint.getUnreadCount

### 🔧 loadUserAvatar()
- **Does:** Resolves and loads the current authenticated doctor or patient avatar image.
- **Params:** None
- **Returns:** void
- **Calls:** AuthService.getUserIdFromToken, PatientEndpoint.getByUserId, resolveMediaUrl, this.loadUnreadNotificationsCount, DoctorEndpoint.getByUserId, resolveDoctorPhoto

### 🔧 toggleMenu()
- **Does:** Toggles the mobile navigation drawer display state.
- **Params:** None
- **Returns:** void
- **Calls:** None

### 🔧 closeMenu()
- **Does:** Collapses the mobile navigation drawer.
- **Params:** None
- **Returns:** void
- **Calls:** None

### 🔧 getDashboardRoute()
- **Does:** Determines navigation targets depending on current logged-in role.
- **Params:** None
- **Returns:** string
- **Calls:** None

### 🔧 logout()
- **Does:** Logs out the user, resets state, and collapses active drawers.
- **Params:** None
- **Returns:** void
- **Calls:** AuthService.logout, this.closeMenu

---

## 📁 src/app/app.component.ts
### 🔧 showLayout()
- **Does:** Evaluates whether to show the header and footer layout depending on whether the current route URL corresponds to dashboard paths.
- **Params:** None
- **Returns:** boolean
- **Calls:** None

---

## 📁 src/app/app.config.ts
*No functions or methods defined in this file.*

---

## 📁 src/app/app.routes.ts
### 🔧 Arrow functions for lazy routing()
- **Does:** Dynamically imports page components (Home, Login, Signup, Doctors, Departments, PatientDashboard, Appointment, Chatbot, DoctorDashboard, AdminDashboard) on-demand for route-splitting.
- **Params:** None
- **Returns:** Promise<Component>
- **Calls:** import()

---

## 📁 src/app/guard/auth.guard.ts
### 🔧 authGuard()
- **Does:** Evaluates whether a user can activate a route by checking for a token in localStorage, caching returnUrl and redirecting to /login if not found.
- **Params:** route: ActivatedRouteSnapshot, state: RouterStateSnapshot
- **Returns:** boolean
- **Calls:** localStorage.getItem, localStorage.setItem, Router.navigate

---

## 📁 src/app/guard/role.guard.ts
### 🔧 roleGuard()
- **Does:** High-order function that generates a CanActivateFn checking if the logged-in user's role is in the list of allowed roles, redirecting to /login or / otherwise.
- **Params:** allowedRoles: string[]
- **Returns:** CanActivateFn
- **Calls:** None

### 🔧 Generated CanActivateFn()
- **Does:** Evaluates if the current user profile from localStorage matches the allowed role criteria, navigating away if they do not match.
- **Params:** None
- **Returns:** boolean
- **Calls:** localStorage.getItem, JSON.parse, Router.navigate

---

## 📁 src/app/interceptors/auth.interceptor.ts
### 🔧 authInterceptor()
- **Does:** Clones outgoing HTTP requests and injects the Authorization: Bearer <token> header if a token exists in localStorage.
- **Params:** req: HttpRequest<unknown>, next: HttpHandlerFn
- **Returns:** Observable<HttpEvent<unknown>>
- **Calls:** localStorage.getItem, HttpRequest.clone, HttpHeaders.set, HttpHandlerFn

---

## 📁 src/app/interfaces/admin.interface.ts
*No functions or methods defined in this file.*

---

## 📁 src/app/interfaces/appointment.interface.ts
*No functions or methods defined in this file.*

---

## 📁 src/app/interfaces/auth.interface.ts
*No functions or methods defined in this file.*

---

## 📁 src/app/interfaces/department.interface.ts
*No functions or methods defined in this file.*

---

## 📁 src/app/interfaces/doctor.interface.ts
*No functions or methods defined in this file.*

---

## 📁 src/app/interfaces/lab-request.interface.ts
*No functions or methods defined in this file.*

---

## 📁 src/app/interfaces/medical-record.interface.ts
*No functions or methods defined in this file.*

---

## 📁 src/app/interfaces/patient.interface.ts
*No functions or methods defined in this file.*

---

## 📁 src/app/interfaces/payment.interface.ts
*No functions or methods defined in this file.*

---

## 📁 src/app/interfaces/prescription.interface.ts
*No functions or methods defined in this file.*

---

## 📁 src/app/interfaces/review.interface.ts
*No functions or methods defined in this file.*

---

## 📁 src/app/shared/api-error.util.ts
### 🔧 parseApiError()
- **Does:** Extracts error message strings from backend API error payloads (checking for body.errors object, body.message, body.title, etc.).
- **Params:** error: any, fallback = 'Something went wrong. Please try again.'
- **Returns:** string
- **Calls:** formatFieldName, Object.entries, Array.isArray, Array.forEach

### 🔧 formatFieldName()
- **Does:** Formats API field names (e.g. CamelCase, path dots) into readable spaced names.
- **Params:** field: string
- **Returns:** string
- **Calls:** String.replace

---

## 📁 src/app/shared/department-assets.ts
### 🔧 getDepartmentImage()
- **Does:** Resolves and returns the department banner image path corresponding to the given department name.
- **Params:** name: string
- **Returns:** string | null
- **Calls:** None

---

## 📁 src/app/shared/doctor-assets.ts
### 🔧 getDoctorImage()
- **Does:** Resolves a static template picture path based on doctor's full name.
- **Params:** fullName: string
- **Returns:** string | null
- **Calls:** None

### 🔧 isTemplatePersonImage()
- **Does:** Checks if an image path references default system template avatar paths.
- **Params:** path?: string | null
- **Returns:** boolean
- **Calls:** RegExp.test

### 🔧 resolveDoctorPhoto()
- **Does:** Returns the resolved doctor profile picture path (handles backend uploads, local templates, name-based fallbacks).
- **Params:** imgPath?: string | null, fullName?: string
- **Returns:** string | undefined
- **Calls:** getDoctorImage, isTemplatePersonImage, String.startsWith, resolveMediaUrl

---

## 📁 src/app/shared/media-url.util.ts
### 🔧 resolveMediaUrl()
- **Does:** Resolves and returns the full absolute media file URL (prepending backend base URL if it's a relative path).
- **Params:** path?: string | null
- **Returns:** string
- **Calls:** String.startsWith, String.replace

---

## 📁 src/environments/environment.prod.ts
*No functions or methods defined in this file.*

---

## 📁 src/environments/environment.ts
*No functions or methods defined in this file.*

---

