# Role-Based Complaint Filtering - Testing Guide

## Overview
The exam complaint system now implements complex role-based filtering for admins. Each admin role has different access levels to complaints based on their position and assigned areas.

## Test Admin Accounts
The system has been seeded with the following test admin accounts:

### 1. Lecturer Account
- **Email**: `lecturer@test.com`
- **Password**: `password123`
- **Role**: `lecturer`
- **Access**: Can only see complaints related to their assigned courses
- **Test Data**: Should see complaints for CS101, CS202, CS303 (Computer Science courses)

### 2. Head of Department (HOD) Account
- **Email**: `hod@test.com`
- **Password**: `password123`
- **Role**: `hod`
- **Access**: Can see all complaints related to their department
- **Test Data**: Should see complaints for Computer Science, Mathematics, Physics, or English departments (depending on assignment)

### 3. Dean Account
- **Email**: `dean@test.com`
- **Password**: `password123`
- **Role**: `dean`
- **Access**: Can see all complaints related to their faculty
- **Test Data**: Should see complaints for Engineering, Science, or Arts faculties (depending on assignment)

### 4. System Administrator Account
- **Email**: `sysadmin@test.com`
- **Password**: `password123`
- **Role**: `admin`
- **Access**: Can see ALL complaints in the system

## Test Complaints
The system has been seeded with the following test complaints:

1. **CS101 - Introduction to Programming Final Exam** (Computer Science/Engineering)
2. **CS202 - Data Structures Midterm** (Computer Science/Engineering)
3. **CS303 - Advanced Algorithms Final** (Computer Science/Engineering)
4. **MATH201 - Calculus II Final Exam** (Mathematics/Science)
5. **PHY151 - Physics Lab Practical** (Physics/Science)
6. **ENG201 - English Literature Essay Exam** (English/Arts)

## Testing Steps

### Step 1: Test System Administrator Access
1. Navigate to http://localhost:3000/login
2. Login with `sysadmin@test.com` / `password123`
3. Go to Admin Dashboard
4. Navigate to Complaints section
5. **Expected Result**: Should see ALL 6 complaints listed

### Step 2: Test Lecturer Access
1. Logout and login with `lecturer@test.com` / `password123`
2. Go to Admin Dashboard
3. Navigate to Complaints section
4. **Expected Result**: Should see only CS101, CS202, CS303 complaints (3 complaints total)
5. Try to access a complaint detail for a CS course - should work
6. Try to manually navigate to a complaint ID that's not CS-related - should be denied

### Step 3: Test HOD Access
1. Logout and login with `hod@test.com` / `password123`
2. Go to Admin Dashboard
3. Navigate to Complaints section
4. **Expected Result**: Should see complaints related to Computer Science department (CS101, CS202, CS303) or other departments based on their assignment

### Step 4: Test Dean Access
1. Logout and login with `dean@test.com` / `password123`
2. Go to Admin Dashboard
3. Navigate to Complaints section
4. **Expected Result**: Should see complaints related to Engineering faculty (CS complaints) or other faculties based on their assignment

### Step 5: Test Role Information Display
1. On each admin's dashboard, verify that the role information card shows:
   - Current admin's role
   - Their access level description
   - Appropriate scope information

## What to Verify

### ✅ Functional Requirements
- [ ] Each admin role sees only appropriate complaints
- [ ] System administrators see all complaints
- [ ] Lecturers see only their course-related complaints
- [ ] HODs see only their department-related complaints
- [ ] Deans see only their faculty-related complaints
- [ ] Complaint detail pages enforce the same access restrictions
- [ ] Admin dashboard shows role information correctly

### ✅ Security Requirements
- [ ] Admins cannot access complaints outside their scope by URL manipulation
- [ ] API endpoints properly filter based on admin role
- [ ] Unauthorized access attempts are properly handled

### ✅ UI/UX Requirements
- [ ] Role information is clearly displayed on the dashboard
- [ ] Complaint lists show appropriate filtering
- [ ] No UI errors or broken functionality

## API Endpoints Affected

### Complaints List API
- **Endpoint**: `/api/auth/complaints/complaints`
- **Method**: GET
- **Filtering**: Implements role-based filtering using `buildAdminFilterQuery()`

### Complaint Detail API
- **Endpoint**: `/api/auth/complaints/[id]`
- **Method**: GET
- **Filtering**: Implements role-based access control for individual complaints

## Database Schema Changes
The following fields are now used for filtering:
- `complaints.course` - Used for lecturer filtering
- `complaints.department` - Used for HOD filtering  
- `complaints.faculty` - Used for dean filtering
- `users.role` - Determines admin access level
- `users.department` - Links admin to their assigned department
- `users.faculty` - Links admin to their assigned faculty

## Troubleshooting

### If complaints don't show up:
1. Check that the admin has the correct role assigned
2. Verify the admin's department/faculty assignment matches complaint data
3. Check browser console for API errors
4. Verify database has the test data by running the scripts again

### If all complaints show up for restricted roles:
1. Check that the API filtering logic is correctly implemented
2. Verify the session contains the correct admin role
3. Check that the WHERE clause is properly constructed

### If you get authentication errors:
1. Ensure you're logged in as an admin (not a regular user)
2. Check that the session is properly maintained
3. Try logging out and logging back in

## Next Steps for Production
1. Add proper department/faculty assignment UI for admins
2. Implement role-based permission management
3. Add audit logging for complaint access
4. Add automated tests for role-based filtering
5. Implement proper error handling and user feedback
