# Exam Complaint System

A web-based application for managing student exam complaints with role-based access control and real-time notifications.

## 🎯 Project Overview

This system provides an efficient platform for students to submit exam complaints and for administrators to manage and respond to these complaints based on their institutional roles and responsibilities.

## 🚀 Key Features

### Student Features
- **Account Registration & Login**: Secure user authentication system
- **Complaint Submission**: Submit detailed exam complaints with form validation
- **Complaint Tracking**: Track complaint status and view administrator responses
- **Dashboard**: Personal dashboard to view all submitted complaints

### Admin Features
- **Role-Based Access Control**: Different access levels based on institutional position
  - **Lecturers**: View complaints within their department
  - **HODs**: View complaints within their department  
  - **Deans**: View complaints within their faculty
  - **System Administrators**: View all complaints
- **Complaint Management**: Review, respond to, and update complaint statuses
- **Analytics Dashboard**: View complaint statistics and trends
- **Email Notifications**: Automated email notifications for responses

### System Features
- **Responsive Design**: Mobile-friendly interface
- **Dark Mode Support**: Complete dark/light theme toggle
- **Real-time Notifications**: Toast notifications for user actions
- **Security**: Session-based authentication with password encryption

## 🛠️ Technology Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **React 18** - User interface library
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **Radix UI** - Accessible UI components

### Backend
- **Next.js API Routes** - Server-side API endpoints
- **MySQL** - Primary database with mysql2 driver
- **bcryptjs** - Password hashing
- **Nodemailer** - Email service
- **Zod** - Schema validation

## 📦 Installation & Setup

### Prerequisites
- Node.js 18+
- MySQL database
- Email service (SMTP)

### Installation Steps
```bash
# Clone repository
git clone <repository-url>
cd exam-complaint-system

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Start development server
npm run dev
```

### Environment Configuration
```env
# Database
MYSQLHOST="localhost"
MYSQLUSER="your-username"
MYSQLPASSWORD="your-password"
MYSQLDATABASE="exam_complaints"

# Email
EMAIL_HOST="smtp.gmail.com"
EMAIL_USER="your-email@gmail.com"
EMAIL_APP_PASSWORD="your-app-password"

# Application
NEXT_PUBLIC_APP_URL="http://localhost:3000"
SESSION_SECRET="your-session-secret"
```

## 🗄️ Database Schema

### Core Tables
- **users**: User accounts with role and position information
- **complaints**: Complaint records with department/faculty tracking
- **responses**: Administrator responses to complaints
- **complaint_status_history**: Audit trail of status changes

### Role-Based Access Implementation
The system enforces access control based on admin positions:
- Department-level access for Lecturers and HODs
- Faculty-level access for Deans
- System-wide access for Administrators

## 📚 System Architecture

### Authentication Flow
1. User registration with email verification
2. Secure login with session management
3. Role-based dashboard routing
4. Password reset functionality

### Complaint Management Flow
1. Student submits complaint with required details
2. System generates unique reference number
3. Complaint routed to appropriate administrator based on department/faculty
4. Administrator reviews and responds
5. Student receives email notification
6. Status updates tracked in history

## 🔒 Security Features

- **Session-Based Authentication**: Secure HTTP-only cookies
- **Password Security**: bcrypt hashing with validation
- **SQL Injection Protection**: Parameterized queries
- **Role-Based Authorization**: Position-specific access control
- **Input Validation**: Zod schema validation

## 🎯 Project Objectives

1. **Streamline Complaint Process**: Digitize the traditional paper-based complaint system
2. **Improve Transparency**: Provide real-time tracking and status updates
3. **Enhance Efficiency**: Role-based routing to appropriate administrators
4. **Maintain Security**: Secure user data and access control
5. **Ensure Accessibility**: Responsive design for all devices

## 📊 Expected Outcomes

- Reduced complaint processing time
- Improved student satisfaction through transparency
- Better tracking and analytics for institutional improvement
- Elimination of paper-based processes
- Enhanced communication between students and administration

## 🚀 Future Enhancements

- Mobile application development
- Integration with existing student information systems
- Advanced analytics and reporting features
- Automated complaint categorization using AI
- SMS notifications support

---

**Built with Next.js, TypeScript, and MySQL for academic excellence.**