# Medical Triage System - Notification System & Appointment Cancellation Implementation

## Overview
This document describes the implementation of the notification system and appointment cancellation feature for the Medical Triage System.

## Features Implemented

### 1. Doctor - Cancel Entire Time Slot
**Location**: Doctor Dashboard → Time Slots Tab

**How it works**:
- Doctor can view all time slots for a selected date
- Each booked time slot displays a red "Delete" button
- Clicking the button shows a confirmation dialog in both English and Arabic
- Confirming cancels ALL appointments in that time slot
- Each patient who booked that slot receives a notification

**API Endpoint**:
```
PUT /api/appointments/timeslot/{timeSlotId}/cancel
```

**Request Body**:
```json
{
  "reason": "Doctor cancelled this time slot"
}
```

**Response**: Array of cancelled appointments

---

### 2. Patient - Notification System

#### A. Notification Badge on Dashboard Button
**Location**: Patient Dashboard → Top Bar

**Features**:
- Red circular badge showing unread notification count
- Positioned on the Dashboard button in top-right corner
- Updates dynamically as notifications are read
- Only visible when count > 0

**Logic**:
- Counts only unread (IsRead = false) notifications
- Triggered when:
  - Appointments are cancelled
  - Notifications are marked as read
  - Notifications are deleted

#### B. Red Dots on New Items
**Locations**: 
- Prescriptions sidebar item
- Lab Tests sidebar item  
- Medical Records sidebar item

**Features**:
- Small red dot appears next to items when they are new
- Dot disappears after viewing that section
- Red dot color: #ef4444 (bright red)

**How it works**:
- Tracks "last opened" timestamps in browser localStorage:
  - `lastOpenedPrescriptions`
  - `lastOpenedLab`
  - `lastOpenedMedical`
- Compares each item's creation date with last opened timestamp
- If item is newer than last opened → show red dot

#### C. Notification Messages
When a doctor cancels a time slot appointment:

**Message Format**:
```
Your appointment with Dr. [Doctor Name] on [Date] [Time] has been cancelled. / 
تم إلغاء موعدك مع د. [Doctor Name] بتاريخ [Date] [Time].
```

**Example**:
```
Your appointment with Dr. Ahmed Hassan on 05 Jun 2026 02:30 PM has been cancelled. / 
تم إلغاء موعدك مع د. أحمد حسن بتاريخ 05 يونيو 2026 02:30 م.
```

---

## Technical Details

### Backend Changes

#### 1. AppointmentService (`BusinessLogicLayer/Services/Implementation/AppointmentService.cs`)

**New Method**:
```csharp
public async Task<IEnumerable<AppointmentResponseDto>> CancelTimeSlotAsync(int timeSlotId, string? reason)
```

**Functionality**:
- Fetches all non-cancelled appointments for the time slot
- For each appointment:
  - Sets status to Cancelled
  - Sets cancellation reason
  - Updates modification timestamp
- Creates notification for each patient
- Frees the time slot (sets IsBooked = false)
- Saves all changes to database

**Notifications Created**:
- One per patient in the time slot
- Message includes doctor name and appointment date/time
- IsRead initially set to false

#### 2. AppointmentsController (`MedicalTriageSystem/Controllers/AppointmentsController.cs`)

**New Endpoint**:
```csharp
[HttpPut("timeslot/{timeSlotId}/cancel")]
[Authorize(Roles = "Doctor")]
public async Task<IActionResult> CancelTimeSlot(int timeSlotId, [FromBody] CancelAppointmentDto dto)
```

**Authentication**: Requires Doctor role

**Parameters**:
- `timeSlotId` (URL): ID of time slot to cancel
- `dto.Reason` (body): Reason for cancellation

**Response**: 200 OK with array of cancelled appointments

#### 3. IAppointmentService Interface

**New Method Signature**:
```csharp
Task<IEnumerable<AppointmentResponseDto>> CancelTimeSlotAsync(int timeSlotId, string? reason);
```

### Frontend Changes

#### 1. Doctor Endpoint (`services/doctor.endpoint.ts`)

**Updated Method**:
```typescript
cancelTimeSlot(slotId: number, reason?: string): Observable<any> {
  const dto = { reason: reason || 'Doctor cancelled this time slot' };
  return this.http.put<any>(`${this.apiUrl}/appointments/timeslot/${slotId}/cancel`, dto);
}
```

**Change**: Now sends cancellation reason to backend API

#### 2. Doctor Dashboard Component (`pages/doctor-dashboard/doctor-dashboard.component.ts`)

**Updated Method**:
```typescript
cancelTimeSlot(slotId: number) {
  if (!confirm('Are you sure you want to cancel this entire time slot?...')) {
    return;
  }
  
  this.endpoint.doctors.cancelTimeSlot(slotId, 'Doctor cancelled this time slot').subscribe({
    next: () => {
      this.timeSlots.update(slots => slots.filter(s => s.id !== slotId));
      const doctorId = this.doctor()?.id;
      if (doctorId) {
        this.loadDoctorData(doctorId);
      }
    },
    error: (err) => {
      alert(err.error?.message || 'Failed to cancel time slot');
    }
  });
}
```

**Behavior**:
- Shows confirmation dialog in English and Arabic
- Passes cancellation reason to backend
- Removes time slot from UI
- Reloads doctor data
- Shows error alert if failed

#### 3. Patient Dashboard - HTML Updates

**Topbar Addition**:
```html
<a (click)="setTab('overview')" class="topbar-btn" title="View Notifications">
    <i class="fas fa-bell"></i>
    <span>Dashboard</span>
    @if (unreadNotificationsCount() > 0) {
        <span class="notification-badge">{{ unreadNotificationsCount() }}</span>
    }
</a>
```

**Red Dots Already Present**:
```html
@if (hasNewMedicalRecords()) { <span class="nav-dot-badge"></span> }
@if (hasNewPrescriptions()) { <span class="nav-dot-badge"></span> }
@if (hasNewLabRequests()) { <span class="nav-dot-badge"></span> }
```

#### 4. Patient Dashboard - CSS Styling

**New Styles**:
```css
.notification-badge {
    position: absolute;
    top: -8px;
    right: -8px;
    background-color: #ef4444;
    color: white;
    width: 22px;
    height: 22px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.7rem;
    font-weight: 700;
    box-shadow: 0 2px 6px rgba(239, 68, 68, 0.6);
}

.topbar-right {
    display: flex;
    gap: 12px;
    align-items: center;
}

.topbar-btn {
    position: relative;
    /* ... other styles ... */
}
```

#### 5. Patient Dashboard - TypeScript Logic

**Existing Methods Used**:
- `hasNewPrescriptions()`: Checks if prescriptions newer than `lastOpenedPrescriptions`
- `hasNewLabRequests()`: Checks if lab tests newer than `lastOpenedLab`
- `hasNewMedicalRecords()`: Checks if records newer than `lastOpenedMedical`
- `updateTotalBadgeCount()`: Calculates total unread notifications
- `setTab(tab)`: Updates localStorage timestamp when section opened

**Badge Count Calculation**:
```typescript
const newPresc = this.hasNewPrescriptions() ? 1 : 0;
const newLab = this.hasNewLabRequests() ? 1 : 0;
const newMed = this.hasNewMedicalRecords() ? 1 : 0;
const unreadNotifications = this.notifications().filter(n => !n.isRead).length;

const totalCount = newPresc + newLab + newMed + unreadNotifications;
this.unreadNotificationsCount.set(unreadNotifications);
```

---

## User Workflows

### Doctor Workflow: Cancel Time Slot
1. Login to doctor dashboard
2. Go to "Time Slots" tab
3. Select a date to view time slots
4. Find a booked time slot (shows blue badge)
5. Click red "Delete" button (trash icon)
6. Confirm cancellation dialog (English/Arabic)
7. All appointments in that slot are cancelled
8. Patients receive notifications

### Patient Workflow: View Notifications
1. Login to patient dashboard
2. Notice red dots on sidebar items (Medical, Prescriptions, Lab)
3. Notice red notification badge on Dashboard button (if unread notifications)
4. Click "Dashboard" or "Overview" tab
5. See all notifications in the notification banners section
6. Click "Dismiss" to remove notification from list
7. Red dots and badge automatically update
8. Badge disappears when all notifications read and no new items

### Patient Workflow: View New Items
1. Login to patient dashboard
2. Notice red dot on "Prescriptions" sidebar item
3. Click on "Prescriptions"
4. Timestamp saved in localStorage
5. Red dot disappears (next time page loads)
6. Notification badge updates if needed

---

## Database Entities Used

### Notification Entity
```csharp
public class Notification : BaseEntity
{
    public int Id { get; set; }
    public int PatientId { get; set; }
    public string Message { get; set; }
    public bool IsRead { get; set; } = false;
    public virtual Patient Patient { get; set; }
}
```

### Appointment Entity
```csharp
public class Appointment : BaseEntity
{
    public AppointmentStatus Status { get; set; }
    public string? CancellationReason { get; set; }
    // ... other properties
}
```

---

## Testing Checklist

- [ ] Doctor can view time slots for a selected date
- [ ] Cancel button appears on booked time slots
- [ ] Confirmation dialog shows in correct language
- [ ] Cancelling time slot cancels all appointments in it
- [ ] Patients receive notifications for cancelled appointments
- [ ] Patient dashboard shows notification badge
- [ ] Badge count is correct (unread notifications)
- [ ] Red dots appear on new items
- [ ] Red dots disappear after viewing item
- [ ] Notification messages display correctly
- [ ] No errors in browser console
- [ ] No errors in API logs

---

## Future Enhancements

1. **Notification Types**: Add type field to Notification entity to track different types (Appointment, Prescription, Lab, Medical Record)
2. **Email Notifications**: Send email to patients when appointments are cancelled
3. **SMS Notifications**: Send SMS alerts for urgent cancellations
4. **Notification Settings**: Allow patients to configure notification preferences
5. **Notification History**: Keep archive of all notifications (soft delete instead of hard delete)
6. **Push Notifications**: Web/app push notifications for immediate alerts
7. **Batch Operations**: Allow doctors to cancel multiple time slots at once
8. **Reschedule Flow**: Guide patients to reschedule after cancellation

---

## Files Modified

### Backend
- `BusinessLogicLayer/Services/Implementation/AppointmentService.cs`
- `BusinessLogicLayer/Services/Interfaces/IAppointmentService.cs`
- `MedicalTriageSystem/Controllers/AppointmentsController.cs`

### Frontend
- `src/app/services/doctor.endpoint.ts`
- `src/app/pages/doctor-dashboard/doctor-dashboard.component.ts`
- `src/app/pages/patient-dashboard/patient-dashboard.component.html`
- `src/app/pages/patient-dashboard/patient-dashboard.component.css`

---

## Notes

- All timestamps are stored in UTC
- Notifications are created before appointments are deleted
- Time slots are freed immediately after cancellation (can be rebooked)
- Red dots use browser localStorage and expire on browser data clear
- Notification badge is calculated dynamically (no database field)
- All messages support English and Arabic
- Doctor role required for cancellation
- Confirmation dialog required before cancellation

---

**Implementation Date**: June 1, 2026
**Status**: ✅ Complete and Ready for Testing
