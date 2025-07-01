import { getDb, generateId } from '../lib/db.ts';
import bcrypt from 'bcryptjs';

async function createTestAdmins() {
  try {
    const db = await getDb();
    
    // Test admin data
    const testAdmins = [
      {
        email: 'lecturer@test.com',
        firstName: 'John',
        lastName: 'Lecturer',
        staffId: 'LEC001',
        password: 'password123',
        position: 'lecturer',
        department: 'Computer Science',
        faculty: 'Engineering',
        courses: 'CS101, CS202, CS303'
      },
      {
        email: 'hod@test.com',
        firstName: 'Jane',
        lastName: 'HOD',
        staffId: 'HOD001',
        password: 'password123',
        position: 'hod',
        department: 'Computer Science',
        faculty: 'Engineering',
        courses: null
      },
      {
        email: 'dean@test.com',
        firstName: 'Bob',
        lastName: 'Dean',
        staffId: 'DEAN001',
        password: 'password123',
        position: 'dean',
        department: null,
        faculty: 'Engineering',
        courses: null
      },
      {
        email: 'sysadmin@test.com',
        firstName: 'Alice',
        lastName: 'Admin',
        staffId: 'SYS001',
        password: 'password123',
        position: 'admin',
        department: null,
        faculty: null,
        courses: null
      }
    ];

    for (const admin of testAdmins) {
      // Check if admin already exists
      const [existing] = await db.execute(
        'SELECT id FROM admins WHERE email = ? OR staffId = ?',
        [admin.email, admin.staffId]
      );

      if (Array.isArray(existing) && existing.length > 0) {
        console.log(`Admin ${admin.email} already exists, skipping...`);
        continue;
      }

      const adminId = generateId();
      const hashedPassword = await bcrypt.hash(admin.password, 10);

      await db.execute(`
        INSERT INTO admins (
          id, email, password, firstName, lastName, staffId, 
          position, department, faculty, courses, role
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        adminId,
        admin.email,
        hashedPassword,
        admin.firstName,
        admin.lastName,
        admin.staffId,
        admin.position,
        admin.department,
        admin.faculty,
        admin.courses,
        'admin'
      ]);

      console.log(`Created admin: ${admin.email} (${admin.position})`);
    }

    console.log('Test admin creation completed!');
    console.log('\nTest Login Credentials:');
    console.log('Lecturer: lecturer@test.com / password123');
    console.log('HOD: hod@test.com / password123');
    console.log('Dean: dean@test.com / password123');
    console.log('System Admin: sysadmin@test.com / password123');

  } catch (error) {
    console.error('Error creating test admins:', error);
  } finally {
    process.exit(0);
  }
}

createTestAdmins();
