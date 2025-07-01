import mysql from 'mysql2/promise'
import { config as dotenvConfig } from 'dotenv'
import bcrypt from "bcryptjs"
dotenvConfig()

const config = {
  host: process.env.MYSQLHOST,
  user: process.env.MYSQLUSER,
  password: process.env.MYSQLPASSWORD,
  database: process.env.MYSQLDATABASE,
  port: parseInt(process.env.MYSQLPORT || '3306'),
  waitForConnections: true,
  connectionLimit: 50, // Increased from 10 to 50
  queueLimit: 0,
  acquireTimeout: 60000, // 60 seconds timeout
  timeout: 60000, // 60 seconds query timeout
  reconnect: true,
  idleTimeout: 300000, // 5 minutes idle timeout
  maxIdle: 10, // Maximum idle connections
  // Add SSL for Railway production
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined,
}

let pool: mysql.Pool | null = null
let isInitialized = false

// Initialize database tables once when the module loads
export async function initDb() {
  if (isInitialized) return;
  
  try {
    const db = await getDb();
    
    // Create users table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(50) PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        firstName VARCHAR(255) NOT NULL,
        lastName VARCHAR(255) NOT NULL,
        studentId VARCHAR(50) UNIQUE,
        staffId VARCHAR(50) UNIQUE,
        role VARCHAR(50) NOT NULL,
        level VARCHAR(50),
        position VARCHAR(255),
        phone VARCHAR(20),
        department VARCHAR(255),
        faculty VARCHAR(255),
        courses TEXT,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        passwordUpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        profilePicUrl VARCHAR(512) NULL
      )
    `);

    // Create complaints table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS complaints (
        id VARCHAR(50) PRIMARY KEY,
        referenceNumber VARCHAR(50) UNIQUE NOT NULL,
        fullName VARCHAR(255) NOT NULL,
        studentId VARCHAR(50) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(20),
        examName VARCHAR(255) NOT NULL,
        examDate VARCHAR(50) NOT NULL,
        complaintType VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        desiredResolution TEXT NOT NULL,
        evidenceFile VARCHAR(255),
        status VARCHAR(50) DEFAULT 'pending',
        course VARCHAR(255),
        department VARCHAR(255),
        faculty VARCHAR(255),
        userId VARCHAR(50) NOT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users(id)
      )
    `);

    // Create password_reset_tokens table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS password_reset_tokens (
        id VARCHAR(50) PRIMARY KEY,
        userId VARCHAR(50) NOT NULL,
        role VARCHAR(50) NOT NULL,
        token VARCHAR(255) NOT NULL,
        expiresAt TIMESTAMP NOT NULL
      )
    `);

    // Create complaint_status_history table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS complaint_status_history (
        id VARCHAR(50) PRIMARY KEY,
        complaint_id VARCHAR(50) NOT NULL,
        old_status VARCHAR(50),
        new_status VARCHAR(50) NOT NULL,
        changed_by VARCHAR(50) NOT NULL,
        changed_by_name VARCHAR(255) NOT NULL,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (complaint_id) REFERENCES complaints(id),
        FOREIGN KEY (changed_by) REFERENCES users(id)
      )
    `);

    // Create responses table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS responses (
        id VARCHAR(50) PRIMARY KEY,
        text TEXT NOT NULL,
        author VARCHAR(100) NOT NULL,
        authorId VARCHAR(50) NOT NULL,
        complaintId VARCHAR(50) NOT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT FK_responses_users FOREIGN KEY (authorId) REFERENCES users(id),
        CONSTRAINT FK_responses_complaints FOREIGN KEY (complaintId) REFERENCES complaints(id)
      )
    `);

    // Create notifications table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS notifications (
        id VARCHAR(50) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        type VARCHAR(50) DEFAULT 'info',
        userId VARCHAR(50) NOT NULL,
        relatedId VARCHAR(50),
        isRead BOOLEAN DEFAULT FALSE,
        readAt TIMESTAMP NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_user_notifications (userId, createdAt DESC),
        INDEX idx_unread_notifications (userId, isRead)
      )
    `);

    isInitialized = true;
    console.log('Database tables initialized successfully');
  } catch (error) {
    console.error('Database initialization failed:', error);
  }
}

export async function getDb(): Promise<mysql.Pool> {
  try {
    if (!pool) {
      console.log('Creating new MySQL connection pool...');
      pool = mysql.createPool(config);
      console.log('MySQL connection pool created successfully!');
    }
    
    return pool;
  } catch (error) {
    console.error('MySQL connection failed:', error);
    throw error;
  }
}

// Function to close the connection pool
export async function closeDb(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
    isInitialized = false;
    console.log('Database connection pool closed');
  }
}

// Function to test database connection
export async function testConnection(): Promise<boolean> {
  try {
    const db = await getDb();
    await db.execute('SELECT 1');
    return true;
  } catch (error) {
    console.error('Database connection test failed:', error);
    return false;
  }
}

// Function to safely execute queries with connection retry
export async function executeQuery(query: string, params: any[] = []): Promise<any> {
  let retries = 3;
  
  while (retries > 0) {
    try {
      const db = await getDb();
      return await db.execute(query, params);
    } catch (error: any) {
      retries--;
      console.error(`Query execution failed (${3 - retries}/3):`, error?.message);
      
      if (error?.code === 'ER_CON_COUNT_ERROR' || error?.code === 'ECONNRESET') {
        // Connection issues - close pool and retry
        if (pool) {
          await pool.end();
          pool = null;
          isInitialized = false;
        }
        
        if (retries > 0) {
          console.log('Retrying query with new connection pool...');
          await new Promise(resolve => setTimeout(resolve, 1000));
          continue;
        }
      }
      throw error;
    }
  }
  throw new Error('Query failed after 3 retries');
}

// Helper function to generate a unique ID
export function generateId(): string {
  return (
    Date.now().toString(36) +
    Math.random().toString(36).substr(2, 9)
  );
}

// Add a helper function for password updates
export async function updateUserPassword(userId: string, hashedPassword: string): Promise<boolean> {
  try {
    const pool = await getDb();
    const [result] = await pool.execute(
      `UPDATE users 
       SET password = ?, 
           passwordUpdatedAt = NOW(),
           updatedAt = NOW()
       WHERE id = ?`,
      [hashedPassword, userId]
    );
    
    return (result as any).affectedRows > 0;
  } catch (error) {
    console.error("Error updating password:", error);
    throw new Error("Failed to update password");
  }
}

// Update the verifyUserPassword function
export async function verifyUserPassword(userId: string, currentPassword: string): Promise<boolean> {
  try {
    const pool = await getDb();
    const [rows] = await pool.execute(
      `SELECT password FROM users WHERE id = ?`,
      [userId]
    );

    if (!Array.isArray(rows) || rows.length === 0) {
      return false;
    }

    return await bcrypt.compare(currentPassword, (rows[0] as any).password);
  } catch (error) {
    console.error("Error verifying password:", error);
    throw new Error("Failed to verify password");
  }
}

// Function to generate a unique reference number
export function generateReferenceNumber() {
  return 'REF-' + Math.floor(100000 + Math.random() * 900000);
}
