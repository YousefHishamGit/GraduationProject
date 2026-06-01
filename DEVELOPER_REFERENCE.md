# Developer & Tester Reference - Implementation Changes

## Quick Overview

This document provides a quick reference for developers and testers to understand:
- What files were changed
- What new endpoints were added
- How to test the new features

---

## Files Changed Summary

### Backend (3 files)

| File | Type | Changes |
|------|------|---------|
| `BusinessLogicLayer/Services/Interfaces/IAppointmentService.cs` | Interface | Added `CancelTimeSlotAsync()` method signature |
| `BusinessLogicLayer/Services/Implementation/AppointmentService.cs` | Service | Implemented `CancelTimeSlotAsync()` method with bulk cancellation logic |
| `MedicalTriageSystem/Controllers/AppointmentsController.cs` | Controller | Added `CancelTimeSlot()` endpoint |

### Frontend (4 files)

| File | Type | Changes |
|------|------|---------|
| `src/app/services/doctor.endpoint.ts` | Service | Updated `cancelTimeSlot()` to send reason and call new API endpoint |
| `src/app/pages/doctor-dashboard/doctor-dashboard.component.ts` | Component | Updated `cancelTimeSlot()` to pass reason to service |
| `src/app/pages/patient-dashboard/patient-dashboard.component.html` | Template | Added Dashboard button with notification badge in topbar-right |
| `src/app/pages/patient-dashboard/patient-dashboard.component.css` | Styles | Added `.notification-badge` and `.topbar-right` styles, updated `.topbar-btn` |

---

## New API Endpoint

### Cancel Time Slot (Bulk Appointment Cancellation)

**Endpoint**: `PUT /api/appointments/timeslot/{timeSlotId}/cancel`

**Authentication**: Required (Doctor role)

**Parameters**:
- `timeSlotId` (URL path parameter, int): ID of time slot
- `reason` (request body, string): Reason for cancellation

**Request Example**:
```bash
curl -X PUT https://api.medicaltriage.com/api/appointments/timeslot/42/cancel \
  -H "Authorization: Bearer {JWT_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"reason":"Doctor cancelled this time slot"}'
```

**Response**: 200 OK
```json
[
  {
    "id": 101,
    "patientId": 5,
    "doctorId": 3,
    "appointmentDate": "2026-06-05T14:00:00Z",
    "status": "Cancelled",
    "cancellationReason": "Doctor cancelled this time slot"
  },
  {
    "id": 102,
    "patientId": 6,
    "doctorId": 3,
    "appointmentDate": "2026-06-05T14:00:00Z",
    "status": "Cancelled",
    "cancellationReason": "Doctor cancelled this time slot"
  }
]
```

**Error Cases**:
- `401 Unauthorized`: Not authenticated or invalid token
- `403 Forbidden`: Not a doctor
- `404 Not Found`: Time slot doesn't exist
- `400 Bad Request`: Invalid request body

---

## Frontend API Usage

### Doctor Endpoint Service

```typescript
// Location: src/app/services/doctor.endpoint.ts

public cancelTimeSlot(slotId: number, reason?: string): Observable<any> {
  const dto = { reason: reason || 'Doctor cancelled this time slot' };
  return this.http.put<any>(`${this.apiUrl}/appointments/timeslot/${slotId}/cancel`, dto);
}

// Usage:
this.endpoint.doctors.cancelTimeSlot(42, 'Unexpected emergency').subscribe({
  next: (appointments) => {
    console.log('Cancelled appointments:', appointments);
  },
  error: (error) => {
    console.error('Error:', error);
  }
});
```

---

## How Bulk Cancellation Works

### Step-by-Step Process

1. **User Action**: Doctor clicks cancel button on time slot
2. **Confirmation**: Dialog shown in English/Arabic
3. **API Call**: Frontend calls `PUT /api/appointments/timeslot/{id}/cancel`
4. **Backend Processing**:
   - Find all non-cancelled appointments for this time slot
   - For each appointment:
     - Set status to "Cancelled"
     - Set cancellation reason
     - Update ModifiedOn timestamp
     - Create notification for patient
   - Free the time slot (IsBooked = false)
   - Save all changes in transaction
5. **Response**: Return array of cancelled appointments
6. **UI Update**: Remove time slot from view, reload data
7. **Patient Notification**: Appears in patient dashboard overview

---

## Testing the Notification System

### Postman/API Testing

**1. Test Cancel Time Slot Endpoint**

```
Method: PUT
URL: http://localhost:5000/api/appointments/timeslot/123/cancel
Headers:
  - Authorization: Bearer {token}
  - Content-Type: application/json
Body:
  {
    "reason": "Emergency"
  }
```

**Expected Response**: Array of cancelled appointments with status "Cancelled"

**2. Check Patient Notifications**

```
Method: GET
URL: http://localhost:5000/api/notifications/patient/{patientId}
Headers:
  - Authorization: Bearer {token}
```

**Expected**: List includes new notification with cancellation message

---

### Frontend UI Testing

#### Doctor Dashboard Tests

1. **Navigation**
   - [ ] Can navigate to Time Slots tab
   - [ ] Date picker works
   - [ ] Can generate time slots for a date
   - [ ] Cancel button appears only on booked slots

2. **Cancellation Flow**
   - [ ] Click cancel button shows confirmation dialog
   - [ ] Dialog shows in correct language (EN/AR)
   - [ ] Can cancel or dismiss dialog
   - [ ] Cancelled slot disappears from list
   - [ ] Error message shows if cancellation fails

3. **Data Integrity**
   - [ ] Appointments list updates after cancellation
   - [ ] Time slot status changes in database
   - [ ] No orphaned time slots remain

#### Patient Dashboard Tests

1. **Notification Badge**
   - [ ] Badge appears when unread notifications exist
   - [ ] Badge shows correct count
   - [ ] Badge disappears when count = 0
   - [ ] Badge is red (#ef4444)
   - [ ] Badge positioned correctly (top-right)

2. **Red Dots on Items**
   - [ ] Red dot appears on Medical Records when new
   - [ ] Red dot appears on Prescriptions when new
   - [ ] Red dot appears on Lab Tests when new
   - [ ] Dots disappear after viewing section
   - [ ] Dots reappear when new items added

3. **Notifications Display**
   - [ ] Cancellation notifications show in Overview
   - [ ] Message includes doctor name
   - [ ] Message includes appointment date/time
   - [ ] Message includes both EN and AR text
   - [ ] Dismiss button removes notification
   - [ ] Deleted notifications not shown again

---

## Database Verification

### Check Cancelled Appointments

```sql
SELECT Id, PatientId, DoctorId, TimeSlotId, Status, CancellationReason, ModifiedOn
FROM Appointments
WHERE TimeSlotId = 123
ORDER BY ModifiedOn DESC;
```

**Expected**: 
- Multiple rows with TimeSlotId = 123
- Status = 'Cancelled' for all
- CancellationReason populated
- ModifiedOn updated to recent time

### Check Notifications Created

```sql
SELECT Id, PatientId, Message, IsRead, CreatedOn
FROM Notifications
WHERE CreatedOn >= DATEADD(MINUTE, -5, GETUTCDATE())
ORDER BY CreatedOn DESC;
```

**Expected**:
- One row per cancelled appointment
- Message contains doctor name and appointment details
- IsRead = 0 (false)
- CreatedOn timestamp is recent

### Check Time Slot Status

```sql
SELECT Id, SlotStart, SlotEnd, IsBooked, DoctorId
FROM TimeSlots
WHERE Id = 123;
```

**Expected**:
- IsBooked = 0 (false) after cancellation
- Can be used for new bookings

---

## Debug/Development Tips

### Browser Console Testing

```javascript
// Check unread notification count
localStorage.getItem('lastOpenedPrescriptions');
localStorage.getItem('lastOpenedLab');
localStorage.getItem('lastOpenedMedical');

// Clear timestamps (simulate new items)
localStorage.removeItem('lastOpenedPrescriptions');
localStorage.setItem('lastOpenedPrescriptions', '2026-01-01T00:00:00Z');

// Listen for notification updates
window.addEventListener('notifications-updated', (event) => {
  console.log('Notifications updated:', event.detail);
});
```

### Enable Debug Logging

Add to component `ngOnInit()`:

```typescript
// Doctor Dashboard
console.log('Loaded time slots:', this.timeSlots());
console.log('Doctor:', this.doctor());

// Patient Dashboard
console.log('Notifications:', this.notifications());
console.log('Unread count:', this.unreadNotificationsCount());
console.log('Has new prescriptions:', this.hasNewPrescriptions());
```

---

## Common Issues & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| Cancellation endpoint returns 404 | Old endpoint URL used | Update to `/api/appointments/timeslot/{id}/cancel` |
| Notifications not created | Service not saving | Check transaction in AppointmentService |
| Badge not updating | localStorage not synced | Call `updateTotalBadgeCount()` after changes |
| Red dots stay visible | Timestamp not saved | Check `setTab()` calls `localStorage.setItem()` |
| Doctor can't see cancel button | Slot not booked | Check TimeSlot.IsBooked = true in DB |
| Confirmation dialog in wrong language | Browser language setting | Ensure translation strings exist |

---

## Performance Considerations

1. **Database**: Bulk cancellation creates N notifications (where N = number of appointments). Consider indexing on `PatientId` in Notifications table.

2. **API Response**: Returns array of cancelled appointments. Consider pagination if many appointments cancelled at once.

3. **Frontend**: Red dots calculated on component init. For large item counts, consider caching results.

---

## Security Checklist

- [x] Endpoint requires Authentication
- [x] Endpoint requires Doctor Role
- [x] Cancellation reason is logged
- [x] Timestamps are UTC
- [x] Patient can only see own notifications
- [x] Soft delete not used (actual cancellation)
- [x] Transaction used for data consistency

---

## Future Enhancements

- [ ] Add notification type enum (Appointment, Prescription, Lab, Medical)
- [ ] Add email notification for cancellations
- [ ] Add batch cancellation endpoint
- [ ] Add reschedule suggestion in notification
- [ ] Add notification read receipts
- [ ] Add notification templates
- [ ] Add notification filtering by type

---

## Version Info

- **Implementation Date**: June 1, 2026
- **Target Framework**: .NET 6+ / Angular 17+
- **API Version**: v1
- **Status**: ✅ Ready for Testing

---

## Contact & Support

For issues or questions:
1. Check this document first
2. Review IMPLEMENTATION_SUMMARY.md for details
3. Check USER_GUIDE.md for functionality overview
4. Review code comments in modified files

---

**Document Version**: 1.0
**Last Updated**: June 1, 2026
