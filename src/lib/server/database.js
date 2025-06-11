import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const dbFile = 'nomic-garden.db';
const dbPath = path.resolve(dbFile); // Store in project root

// Ensure the directory for the database file exists (though for root, it's not strictly necessary)
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

export const db = new Database(dbPath, { verbose: console.log });

function initDb() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      profile_picture_url TEXT,
      bio TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);
  console.log('Database initialized and `users` table ensured.');
}

// Call initDb to ensure schema is set up when this module is first imported
initDb();

console.log(`SQLite database initialized at: ${dbPath}`);

// User interaction functions
export function createUser(username, email, passwordHash) {
  try {
    const stmt = db.prepare(
      'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)'
    );
    const info = stmt.run(username, email, passwordHash);
    // Return the newly created user's ID and username.
    // The email is also included for completeness, though often just ID/username is sufficient.
    return { id: info.lastInsertRowid, username, email };
  } catch (error) {
    // Log the error for server-side debugging
    console.error('Error creating user:', error.message);
    // Check for unique constraint violation
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      throw new Error('Username or email already exists.');
    }
    throw new Error('Failed to create user due to a database error.');
  }
}

export function findUserByUsername(username) {
  try {
    const stmt = db.prepare('SELECT id, username, email, password_hash, profile_picture_url, bio, created_at FROM users WHERE username = ?');
    const user = stmt.get(username);
    return user || null;
  } catch (error) {
    console.error('Error finding user by username:', error.message);
    throw new Error('Database query failed while finding user by username.');
  }
}

export function findUserByEmail(email) {
  try {
    const stmt = db.prepare('SELECT id, username, email, password_hash, profile_picture_url, bio, created_at FROM users WHERE email = ?');
    const user = stmt.get(email);
    return user || null;
  } catch (error) {
    console.error('Error finding user by email:', error.message);
    throw new Error('Database query failed while finding user by email.');
  }
}
