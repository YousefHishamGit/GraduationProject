# User Guide - Notifications & Appointment Cancellation

## For Doctors 👨‍⚕️

### How to Cancel a Time Slot

**Scenario**: You need to cancel all appointments for a specific time slot (e.g., 2:00 PM - 2:30 PM on June 5th).

**Steps**:

1. **Log in** to your doctor dashboard
2. Go to **Time Slots** tab (in the sidebar)
3. Select the date you want to view using the date picker
4. Click **"Generate"** button to generate time slots for that day
5. Find the time slot you want to cancel (look for the blue "Booked" badge)
6. Click the **red trash icon** 🗑️ button on the time slot card
7. A confirmation dialog will appear in English and Arabic
8. **Click "OK"** to confirm cancellation
9. The time slot will disappear from the list
10. ✅ All patients with appointments in that slot will receive notifications

**Important Notes**:
- Only booked time slots show the cancel button
- Cancelling a time slot cancels ALL appointments in it at once
- You cannot undo this action
- Patients will be notified immediately
- The time slot becomes available for rebooking

---

## For Patients 🏥

### View Your Notifications

**Location**: Dashboard → Overview tab (or click "Dashboard" button in top-right)

**What you'll see**:
- A list of all your notifications
- Each notification shows:
  - Cancellation message
  - Date and time it was sent
  - A "Dismiss" button to remove it

**Notifications Include**:
- 📅 Appointment cancellations from doctors
- 💊 New prescriptions added
- 🧪 Lab test results available
- 📋 New medical records created

---

### Notification Badge on Dashboard Button

**What is it?**
- A **red circle** in the top-right corner with a number
- Shows how many **unread notifications** you have

**Example**: 
- Badge shows "3" → You have 3 unread notifications
- Badge disappears → All notifications are read

**How to clear it**:
1. Click the **"Dashboard"** button (top-right)
2. Read through the notifications
3. The badge count will decrease automatically
4. Red circle disappears when count reaches 0

---

### Red Dots on New Items

**What are they?**
- Small **red dots** (🔴) next to sidebar items
- Indicate you have **new items** in that section

**Where you'll see them**:
- **Medical Records** - Red dot when new records added
- **Prescriptions** - Red dot when new prescriptions added
- **Lab Tests** - Red dot when new lab tests requested

**How they work**:
- Red dot appears → New item available
- You click on that section → Dot disappears
- Red dot reappears when new items added again

**Example Timeline**:
```
Doctor adds prescription → Red dot appears on "Prescriptions"
You click "Prescriptions" → Red dot disappears (you've "seen" it)
Doctor adds another prescription → Red dot appears again
```

---

### Understanding Notification Count

**What's included in the badge count?**
- Unread cancellation notifications
- New prescriptions (if you haven't viewed recently)
- New lab tests (if you haven't viewed recently)
- New medical records (if you haven't viewed recently)

**Example**:
```
Scenario 1:
- 2 unread cancellation notifications
- 1 new prescription
- Badge shows: "3"

Scenario 2:
- You read all notifications
- You view prescriptions (so no new ones)
- Badge shows: "0" (disappears)

Scenario 3:
- Doctor adds new prescription
- Badge shows: "1"
```

---

### Responding to Appointment Cancellations

**When you receive a notification about cancelled appointment**:

**You can**:
1. Read the notification (which includes doctor name, date, and time)
2. Dismiss the notification
3. Go to your "Appointments" tab to see updated status
4. Book a new appointment with that doctor at a different time

**The cancelled appointment will**:
- Show status as "Cancelled" in your appointments list
- No longer appear in your upcoming appointments
- Free up your calendar

---

## Mobile Tips 📱

### On Smaller Screens

**Doctor Dashboard**:
- Tap the **hamburger menu** (☰) to open/close sidebar
- Tap the time slot card to see more details
- Confirmation dialogs work the same way

**Patient Dashboard**:
- Tap the **hamburger menu** (☰) to see sidebar
- Red dots and badges scale to fit small screens
- Tap "Dashboard" button to see notifications
- Swipe between tabs

---

## Troubleshooting

### Problem: Red dot doesn't disappear after viewing item

**Solution**:
- Clear your browser cache and cookies
- Or try clearing site data:
  - Settings → Privacy → Cookies and Site Data → Clear Data
  - Refresh page

### Problem: Badge count doesn't update

**Solution**:
1. Refresh the page (F5 or Ctrl+R)
2. Log out and log back in
3. Clear browser cache

### Problem: Didn't receive cancellation notification

**Solution**:
1. Refresh your dashboard page
2. Check "Overview" tab for notifications
3. If still missing, ask doctor to verify they cancelled the slot
4. Contact system administrator if issue persists

### Problem: Can't cancel time slot (no red button)

**Solution**:
- The time slot might be empty (not booked)
- Only booked time slots can be cancelled
- Try a different time slot that shows "Booked" badge
- Check you have Doctor role permissions

---

## FAQs ❓

**Q: Will patients know it was me who cancelled?**
A: Yes, the notification shows the doctor name and appointment details.

**Q: Can I cancel a time slot that's not booked?**
A: No, only booked time slots (showing blue badge) can be cancelled.

**Q: Can I undo a cancellation?**
A: No, cancellations cannot be undone. Ask patients to rebook if needed.

**Q: How many patients can be notified at once?**
A: All patients who have appointments in that time slot. Usually 1-2 patients per slot.

**Q: Do notifications expire?**
A: No, notifications stay until you dismiss them or clear them manually.

**Q: Can I delete a notification?**
A: Yes, click the "Dismiss" button on any notification to remove it.

**Q: Why is there a red dot on an item I already viewed?**
A: A new item was added after you last viewed that section. Check the section again to see the new item.

**Q: Will I get email notifications?**
A: Currently, notifications only appear in the dashboard. Email notifications may be added in future.

---

## Quick Reference 🔖

| Feature | Location | Looks Like |
|---------|----------|-----------|
| Cancel Time Slot | Doctor Dashboard > Time Slots | 🗑️ Red trash button |
| View Notifications | Patient Dashboard > Dashboard/Overview | Notification banners |
| Notification Badge | Top-right corner (Dashboard button) | 🔴 Red circle with number |
| Red Dots | Sidebar items (Medical, Prescriptions, Lab) | 🔴 Small red dot |
| New Items | Section opened | Dots disappear |

---

## Security Notes 🔒

- Only doctors can cancel time slots
- Only your own notifications appear in your account
- Notifications are tied to your patient ID
- All actions are logged with timestamps
- Confirmation required before cancellation

---

**Last Updated**: June 1, 2026
**Version**: 1.0
