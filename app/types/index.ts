// Define types for our data structures
export interface Complaint {
  id: string
  student?: string
  fullName?: string
  studentId?: string
  email?: string
  phone?: string
  examName: string
  referenceNumber: string;
  examDate?: string
  createdAt?: string
  date?: string
  type: string
  complaintType?: string
  level?: string
  program?: string
  userDepartment?: string // Optional field for user's department
  userLevel?: string
  userFaculty?: string
  status: string
  description?: string
  desiredResolution?: string
  evidence?: string
  evidenceFile?: string
  responses: Response[]
  course?: string
  department?: string
  faculty?: string
  statusHistory?: StatusHistoryEntry[];
}

export interface Response {
  id: string
  text: string
  date: string
  author: string
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  studentId?: string; // Make optional since admins may not have this
  staffId?: string;   // Add staffId for admins
  role: "admin" | "student"
  position?: string;
  department?: string;
  faculty?: string;
  courses?: string;
  phone?: string;
  level?: string;
  profilePicUrl?: string;
}

export type StatusHistoryEntry = {
  id: string
  new_status: string
  old_status: string
  changed_by_name: string
  formatted_date: string
  notes?: string
}
