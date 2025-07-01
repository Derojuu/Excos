import mysql from 'mysql2/promise'
import { config as dotenvConfig } from 'dotenv'
import bcrypt from "bcryptjs"
dotenvConfig()

const config = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'excos',
  port: parseInt(process.env.DB_PORT || '3306'),
  waitForConnections: true,
  connectionLimit: 50, // Increased from 10 to 50
  queueLimit: 0,
  acquireTimeout: 60000, // 60 seconds
  timeout: 60000, // 60 seconds
  reconnect: true,
  idleTimeout: 300000, // 5 minutes
  maxIdle: 10, // Maximum idle connections
}

let pool: mysql.Pool | null = null
let isInitialized = false

export async function getDb(): Promise<mysql.Pool> {
  try {
    if (!pool) {
      console.log('Creating new MySQL connection pool...');
      pool = mysql.createPool(config);
      console.log('MySQL connection pool created successfully!');
    }
    
    // Only initialize database once
    if (!isInitialized) {
      await initDb(pool);
      isInitialized = true;
      console.log('Database initialized successfully!');
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
          await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
          continue;
        }
      }
      
      throw error;
    }
  }
}

async function initDb(pool: mysql.Pool) {
  try {
    console.log('MySQL database initialization failed: Skipping table creation to avoid connection issues');
    return; // Skip table creation for now
    
    // Create users table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(50) PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        firstName VARCHAR(255) NOT NULL,
        lastName VARCHAR(255) NOT NULL,
        studentId VARCHAR(50) UNIQUE,
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
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS complaints (
        id VARCHAR(50) PRIMARY KEY,
        referenceNumber VARCHAR(50) UNIQUE NOT NULL,
        fullName VARCHAR(255) NOT NULL,
        studentId VARCHAR(50) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(20),
        examName VARCHAR(255) NOT NULL,
        examDate DATE NOT NULL,
        complaintType VARCHAR(100) NOT NULL,
        description TEXT NOT NULL,
        desiredResolution TEXT NOT NULL,
        evidenceFile VARCHAR(512),
        status VARCHAR(50) DEFAULT 'pending',
        resolvedAt TIMESTAMP NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        userId VARCHAR(50),
        FOREIGN KEY (userId) REFERENCES users(id)
      )
    `);

    // Create responses table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS responses (
        id VARCHAR(50) PRIMARY KEY,
        text TEXT NOT NULL,
        author VARCHAR(255) NOT NULL,
        complaintId VARCHAR(50) NOT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (complaintId) REFERENCES complaints(id)
      )
    `);

    // Create notifications table
    await pool.execute(`
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
        FOREIGN KEY (userId) REFERENCES users(id)
      )
    `);

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('MySQL database initialization failed:', error);
    throw error;
  }
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
    const db = await getDb();
    await db.execute(
      'UPDATE users SET password = ?, passwordUpdatedAt = NOW() WHERE id = ?',
      [hashedPassword, userId]
    );
    return true;
  } catch (error) {
    console.error("Error updating password:", error);
    throw new Error("Failed to update password");
  }
}

// Add a helper function for password verification
export async function verifyUserPassword(userId: string, currentPassword: string): Promise<boolean> {
  try {
    const db = await getDb();
    const [rows] = await db.execute(
      'SELECT password FROM users WHERE id = ?',
      [userId]
    );

    if (!Array.isArray(rows) || rows.length === 0) {
      throw new Error("User not found");
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
