import { getDb, generateId, generateReferenceNumber } from '../lib/db.ts';

async function createTestComplaints() {
  try {
    const db = await getDb();
    
    // First, get a student user
    const [studentRows] = await db.execute(
      'SELECT id FROM users WHERE role = "student" LIMIT 1'
    );

    if (!Array.isArray(studentRows) || studentRows.length === 0) {
      console.log('No student users found. Please create a student user first.');
      return;
    }

    const studentId = studentRows[0].id;

    // Test complaint data with different course/department/faculty combinations
    const testComplaints = [
      {
        fullName: 'Test Student',
        studentId: 'ST001',
        email: 'student@test.com',
        phone: '1234567890',
        examName: 'Introduction to Programming Final Exam',
        examDate: '2024-01-15',
        complaintType: 'grading',
        description: 'I believe there was an error in grading my programming assignment question.',
        desiredResolution: 'Please review and re-grade my answer for question 3.',
        course: 'CS101',
        department: 'Computer Science',
        faculty: 'Engineering',
        status: 'pending'
      },
      {
        fullName: 'Test Student',
        studentId: 'ST001',
        email: 'student@test.com',
        phone: '1234567890',
        examName: 'Data Structures Midterm',
        examDate: '2024-01-20',
        complaintType: 'technical',
        description: 'The online exam platform crashed during my test and I lost 30 minutes.',
        desiredResolution: 'Please allow me to retake the exam or extend my time.',
        course: 'CS202',
        department: 'Computer Science',
        faculty: 'Engineering',
        status: 'under-review'
      },
      {
        fullName: 'Test Student',
        studentId: 'ST001',
        email: 'student@test.com',
        phone: '1234567890',
        examName: 'Advanced Algorithms Final',
        examDate: '2024-01-25',
        complaintType: 'content',
        description: 'Question 5 was not covered in the course material or lectures.',
        desiredResolution: 'Please remove question 5 from grading or provide partial credit.',
        course: 'CS303',
        department: 'Computer Science',
        faculty: 'Engineering',
        status: 'resolved'
      },
      {
        fullName: 'Test Student',
        studentId: 'ST001',
        email: 'student@test.com',
        phone: '1234567890',
        examName: 'Calculus II Final Exam',
        examDate: '2024-01-30',
        complaintType: 'grading',
        description: 'My answer for the integration problem was marked wrong but I believe it is correct.',
        desiredResolution: 'Please review my calculation steps for problem 7.',
        course: 'MATH201',
        department: 'Mathematics',
        faculty: 'Science',
        status: 'pending'
      },
      {
        fullName: 'Test Student',
        studentId: 'ST001',
        email: 'student@test.com',
        phone: '1234567890',
        examName: 'Physics Lab Practical',
        examDate: '2024-02-05',
        complaintType: 'administration',
        description: 'I was not informed about the change in exam location and missed the first 15 minutes.',
        desiredResolution: 'Please provide make-up time or consideration for the missed portion.',
        course: 'PHY151',
        department: 'Physics',
        faculty: 'Science',
        status: 'under-review'
      },
      {
        fullName: 'Test Student',
        studentId: 'ST001',
        email: 'student@test.com',
        phone: '1234567890',
        examName: 'English Literature Essay Exam',
        examDate: '2024-02-10',
        complaintType: 'grading',
        description: 'The grading seems inconsistent with the rubric provided at the start of the course.',
        desiredResolution: 'Please review my essay against the original rubric and provide detailed feedback.',
        course: 'ENG201',
        department: 'English',
        faculty: 'Arts',
        status: 'pending'
      }
    ];

    for (const complaint of testComplaints) {
      const complaintId = generateId();
      const referenceNumber = generateReferenceNumber();
      const mysqlDate = new Date(complaint.examDate).toISOString().slice(0, 19).replace('T', ' ');

      await db.execute(`
        INSERT INTO complaints (
          id, referenceNumber, userId, fullName, studentId, email, phone, 
          examName, examDate, complaintType, description, desiredResolution, 
          course, department, faculty, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        complaintId,
        referenceNumber,
        studentId,
        complaint.fullName,
        complaint.studentId,
        complaint.email,
        complaint.phone,
        complaint.examName,
        mysqlDate,
        complaint.complaintType,
        complaint.description,
        complaint.desiredResolution,
        complaint.course,
        complaint.department,
        complaint.faculty,
        complaint.status
      ]);

      console.log(`Created complaint: ${complaint.examName} (${complaint.course}) - ${complaint.status}`);
    }

    console.log('\nTest complaints created successfully!');
    console.log('\nComplaint Distribution:');
    console.log('- CS101, CS202, CS303 (Computer Science/Engineering) - For Lecturer testing');
    console.log('- MATH201, PHY151 (Mathematics/Physics under Science) - For different faculties');
    console.log('- ENG201 (English under Arts) - For faculty-level testing');

  } catch (error) {
    console.error('Error creating test complaints:', error);
  } finally {
    process.exit(0);
  }
}

createTestComplaints();
