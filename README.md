# Exam Complaint System

A comprehensive web application for managing student exam complaints with advanced analytics, file management, and notification systems.

## 🚀 Features

### Student Features
- **Account Management**: Registration, login, and profile management
- **Complaint Submission**: Submit detailed exam complaints with evidence upload
- **Complaint Tracking**: Track status and view responses from administrators
- **File Upload**: Upload evidence files (images, documents) stored securely in Google Cloud Storage
- **Notifications**: Real-time notifications for complaint status updates
- **Dashboard**: Personal dashboard to view all submitted complaints

### Admin Features
- **Advanced Analytics Dashboard**: Interactive charts and metrics for complaint trends
- **Complaint Management**: Review, respond to, and update complaint statuses
- **User Management**: Manage student accounts and permissions
- **File Management**: Secure file handling with Google Cloud Storage integration
- **Notification System**: Send updates and notifications to students
- **Reporting**: Export analytics data and generate reports

### Technical Features
- **Responsive Design**: Mobile-first approach with beautiful UI
- **Real-time Updates**: Live status updates and notifications
- **Security**: Secure authentication with role-based access control
- **File Storage**: Scalable file storage with Google Cloud Storage
- **Database**: MySQL with Prisma ORM for reliable data management
- **Modern UI**: Built with Tailwind CSS and Radix UI components

## 🛠️ Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **React 18** - User interface library
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **Radix UI** - Headless UI components
- **Framer Motion** - Animation library
- **Recharts** - Chart library for analytics
- **Lucide React** - Icon library

### Backend
- **Next.js API Routes** - Server-side API endpoints
- **MySQL** - Primary database
- **Prisma** - Database ORM and query builder
- **Google Cloud Storage** - File storage service
- **bcryptjs** - Password hashing
- **UUID** - Unique identifier generation

### Development Tools
- **TypeScript** - Static type checking
- **ESLint** - Code linting
- **Prisma Client** - Database client generation
- **Next.js Dev Server** - Development environment

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- MySQL database
- Google Cloud Storage account
- Git

### 1. Clone the Repository
```bash
git clone <repository-url>
cd exam-complaint-system
```

### 2. Install Dependencies
```bash
npm install
# or
pnpm install
```

### 3. Environment Configuration
Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="mysql://username:password@localhost:3306/exam_complaints"

# Google Cloud Storage
GCS_PROJECT_ID="your-gcs-project-id"
GCS_KEY_FILE_PATH="path/to/your/service-account-key.json"
GCS_BUCKET_NAME="your-bucket-name"

# Application
NEXTAUTH_SECRET="your-nextauth-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# Email (Optional)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
```

### 4. Database Setup
```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma db push

# (Optional) Seed the database
npm run seed
```

### 5. Google Cloud Storage Setup
1. Create a Google Cloud Project
2. Enable the Cloud Storage API
3. Create a service account and download the JSON key file
4. Create a storage bucket
5. Update the environment variables with your GCS configuration

### 6. Start Development Server
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## 🚀 Deployment

### Production Build
```bash
npm run build
npm start
```

### Environment Variables for Production
Ensure all environment variables are properly set in your production environment:
- Update `NEXTAUTH_URL` to your production domain
- Use production database credentials
- Configure production GCS bucket and credentials

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/check-auth` - Check authentication status

### Complaint Endpoints
- `GET /api/complaints` - Get user complaints
- `POST /api/complaints` - Create new complaint
- `GET /api/complaints/[id]` - Get specific complaint
- `PATCH /api/complaints/[id]/status` - Update complaint status (Admin)
- `POST /api/complaints/[id]/responses` - Add response to complaint (Admin)

### File Upload Endpoints
- `POST /api/upload` - Upload files to Google Cloud Storage

### Notification Endpoints
- `GET /api/notifications` - Get user notifications
- `POST /api/notifications` - Create notification
- `PATCH /api/notifications` - Mark notification as read
- `DELETE /api/notifications` - Delete notification

### Admin Endpoints
- `GET /api/admin/analytics` - Get analytics data
- `GET /api/admin/complaints` - Get all complaints
- `GET /api/admin/users` - Get all users

## 🗄️ Database Schema

### Users Table
- `id` - Unique identifier
- `email` - User email (unique)
- `password` - Hashed password
- `firstName` - User's first name
- `lastName` - User's last name
- `studentId` - Student ID (unique)
- `role` - User role (student/admin)
- `profilePicture` - Profile picture URL

### Complaints Table
- `id` - Unique identifier
- `referenceNumber` - Unique complaint reference
- `fullName` - Complainant's full name
- `studentId` - Student ID
- `email` - Contact email
- `phone` - Contact phone (optional)
- `examName` - Name of the exam
- `examDate` - Date of the exam
- `complaintType` - Type of complaint
- `description` - Detailed description
- `desiredResolution` - Desired outcome
- `evidenceFile` - Evidence file URL
- `status` - Current status (pending/under-review/resolved)
- `userId` - Foreign key to Users

### Notifications Table
- `id` - Unique identifier
- `title` - Notification title
- `message` - Notification message
- `type` - Type (info/success/warning/error)
- `userId` - Foreign key to Users
- `relatedId` - Related entity ID (optional)
- `isRead` - Read status
- `readAt` - Read timestamp

## 🎨 UI Components

The application uses a comprehensive component library built with Radix UI and Tailwind CSS:

### Core Components
- **Button** - Various button styles and states
- **Card** - Content containers with headers and actions
- **Dialog** - Modal dialogs and confirmations
- **Form** - Form inputs with validation
- **Table** - Data tables with sorting and filtering
- **Toast** - Notification toasts
- **Sidebar** - Navigation sidebars for students and admins

### Specialized Components
- **Dashboard Layout** - Admin and student dashboard layouts
- **Loading Overlay** - Loading states for async operations
- **Theme Toggle** - Dark/light mode switcher
- **Chart Components** - Analytics charts using Recharts

## 🔒 Security Features

- **Authentication**: Secure session-based authentication
- **Authorization**: Role-based access control (RBAC)
- **Password Security**: bcrypt password hashing
- **File Security**: Secure file uploads with type validation
- **SQL Injection Protection**: Parameterized queries with Prisma
- **XSS Protection**: Input sanitization and validation
- **CSRF Protection**: Built-in Next.js CSRF protection

## 📊 Analytics Dashboard

The admin analytics dashboard provides comprehensive insights:

### Metrics Tracked
- Total complaints over time
- Status distribution (Pending, Under Review, Resolved)
- Complaint types analysis
- Hourly submission patterns
- User activity metrics
- Response time analytics

### Chart Types
- **Line Charts**: Trend analysis over time
- **Bar Charts**: Category comparisons
- **Pie Charts**: Distribution visualization
- **Area Charts**: Volume metrics

## 🧪 Testing

### Database Connection Test
```bash
npm run test:db
```

### Manual Testing Checklist
- [ ] User registration and login
- [ ] Complaint submission with file upload
- [ ] Admin complaint management
- [ ] Notification system
- [ ] Analytics dashboard
- [ ] Mobile responsiveness
- [ ] File upload to GCS
- [ ] Session management

## 🚨 Troubleshooting

### Common Issues

**Database Connection Error**
- Verify DATABASE_URL in .env file
- Ensure MySQL server is running
- Check database credentials and permissions

**File Upload Issues**
- Verify GCS credentials and bucket configuration
- Check file permissions and bucket policies
- Ensure service account has proper roles

**Build Errors**
- Clear Next.js cache: `rm -rf .next`
- Reinstall dependencies: `rm -rf node_modules && npm install`
- Check TypeScript errors: `npm run lint`

**Session Issues**
- Clear browser cookies
- Check NEXTAUTH_SECRET configuration
- Verify session storage implementation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Use conventional commit messages
- Ensure responsive design
- Add proper error handling
- Include type definitions
- Write descriptive comments

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **Next.js Team** - For the amazing React framework
- **Vercel** - For hosting and deployment platform
- **Radix UI** - For accessible UI components
- **Tailwind CSS** - For utility-first CSS framework
- **Prisma** - For database toolkit and ORM
- **Google Cloud** - For file storage services

## 📞 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation and troubleshooting guide

---

**Built with ❤️ using Next.js, TypeScript, and modern web technologies.**
