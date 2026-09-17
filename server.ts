import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { DatabaseSync } from 'node:sqlite';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize SQLite database file in project root
const dbPath = path.join(process.cwd(), 'db.sqlite3');
const db = new DatabaseSync(dbPath);

// Create Student table if not exists according to ER specification
db.exec(`
  CREATE TABLE IF NOT EXISTS students (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT NOT NULL,
    age INTEGER NOT NULL,
    course TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
  );
`);

// Pre-seed initial students if empty
const countStmt = db.prepare('SELECT COUNT(*) as count FROM students');
const countRow = countStmt.get() as { count: number };

if (countRow.count === 0) {
  const insertSeed = db.prepare(
    'INSERT INTO students (name, email, phone, age, course) VALUES (?, ?, ?, ?, ?)'
  );
  insertSeed.run('Rahul Kumar', 'rahul@gmail.com', '9876543210', 20, 'BCA');
  insertSeed.run('Priya Sharma', 'priya@gmail.com', '9876543211', 21, 'B.Sc');
  insertSeed.run('Arjun Singh', 'arjun@gmail.com', '9876543212', 20, 'BCA');
  insertSeed.run('Ananya Patel', 'ananya@gmail.com', '9876543213', 22, 'MCA');
  insertSeed.run('Rohan Verma', 'rohan@gmail.com', '9876543214', 19, 'B.Tech');
  console.log('Database initialized with seed student records.');
}

// Validation helper
function validateStudentData(data: any, isUpdate = false) {
  const errors: Record<string, string> = {};

  if (!isUpdate || data.name !== undefined) {
    if (!data.name || typeof data.name !== 'string' || data.name.trim() === '') {
      errors.name = 'Name is required.';
    }
  }

  if (!isUpdate || data.email !== undefined) {
    if (!data.email || typeof data.email !== 'string' || data.email.trim() === '') {
      errors.email = 'Email is required.';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.email.trim())) {
        errors.email = 'Please enter a valid email address.';
      }
    }
  }

  if (!isUpdate || data.phone !== undefined) {
    if (!data.phone || typeof data.phone !== 'string' || data.phone.trim() === '') {
      errors.phone = 'Phone number is required.';
    } else {
      const digitsOnly = data.phone.replace(/\D/g, '');
      if (digitsOnly.length < 7 || digitsOnly.length > 15) {
        errors.phone = 'Please enter a valid phone number (7 to 15 digits).';
      }
    }
  }

  if (!isUpdate || data.age !== undefined) {
    const ageNum = Number(data.age);
    if (data.age === undefined || data.age === null || data.age === '' || isNaN(ageNum)) {
      errors.age = 'Age must be a valid number.';
    } else if (!Number.isInteger(ageNum) || ageNum < 14 || ageNum > 100) {
      errors.age = 'Age must be an integer between 14 and 100.';
    }
  }

  if (!isUpdate || data.course !== undefined) {
    if (!data.course || typeof data.course !== 'string' || data.course.trim() === '') {
      errors.course = 'Course is required.';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

// ----------------------------------------------------
// REST API Endpoints (Section 9: CRUD REST pattern)
// ----------------------------------------------------

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    message: 'Student Management System API is active',
    database: 'SQLite 3 (node:sqlite)',
    uptime: process.uptime(),
  });
});

// Read All Students: GET /api/students/ & GET /api/students
const handleGetAllStudents = (req: Request, res: Response) => {
  try {
    const search = typeof req.query.search === 'string' ? req.query.search.trim() : '';
    const course = typeof req.query.course === 'string' ? req.query.course.trim() : '';

    let query = 'SELECT * FROM students';
    const params: (string | number)[] = [];
    const conditions: string[] = [];

    if (search) {
      conditions.push('(name LIKE ? OR email LIKE ? OR course LIKE ? OR phone LIKE ? OR CAST(id AS TEXT) = ?)');
      const wildcard = `%${search}%`;
      params.push(wildcard, wildcard, wildcard, wildcard, search);
    }

    if (course && course !== 'ALL') {
      conditions.push('course = ?');
      params.push(course);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY id ASC';

    const stmt = db.prepare(query);
    const rows = stmt.all(...params);
    res.json(rows);
  } catch (error: any) {
    console.error('Error fetching students:', error);
    res.status(500).json({ error: 'Failed to retrieve students from database' });
  }
};

app.get('/api/students', handleGetAllStudents);
app.get('/api/students/', handleGetAllStudents);

// Read One Student: GET /api/students/:id/ & GET /api/students/:id
const handleGetOneStudent = (req: Request, res: Response) => {
  try {
    const studentId = Number(req.params.id);
    if (isNaN(studentId)) {
      res.status(400).json({ error: 'Invalid student ID format' });
      return;
    }

    const stmt = db.prepare('SELECT * FROM students WHERE id = ?');
    const student = stmt.get(studentId);

    if (!student) {
      res.status(404).json({ error: `Student with ID ${studentId} not found` });
      return;
    }

    res.json(student);
  } catch (error: any) {
    console.error('Error fetching student by ID:', error);
    res.status(500).json({ error: 'Failed to retrieve student record' });
  }
};

app.get('/api/students/:id', handleGetOneStudent);
app.get('/api/students/:id/', handleGetOneStudent);

// Create Student: POST /api/students/ & POST /api/students
const handleCreateStudent = (req: Request, res: Response) => {
  try {
    const { name, email, phone, age, course } = req.body || {};

    // 1. Validation
    const validation = validateStudentData({ name, email, phone, age, course });
    if (!validation.isValid) {
      res.status(400).json({
        error: Object.values(validation.errors)[0],
        errors: validation.errors,
      });
      return;
    }

    const cleanEmail = email.trim().toLowerCase();

    // 2. Check duplicate email (Unique constraint)
    const checkStmt = db.prepare('SELECT id FROM students WHERE LOWER(email) = ?');
    const existing = checkStmt.get(cleanEmail);
    if (existing) {
      res.status(400).json({
        error: 'A student with this email address already exists.',
        field: 'email',
        errors: { email: 'A student with this email address already exists.' },
      });
      return;
    }

    // 3. Insert into SQLite
    const insertStmt = db.prepare(
      'INSERT INTO students (name, email, phone, age, course, created_at, updated_at) VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)'
    );
    const result = insertStmt.run(name.trim(), cleanEmail, phone.trim(), Number(age), course.trim());

    // 4. Retrieve created student
    const getStmt = db.prepare('SELECT * FROM students WHERE id = ?');
    const createdStudent = getStmt.get(Number(result.lastInsertRowid));

    res.status(201).json(createdStudent);
  } catch (error: any) {
    console.error('Error creating student:', error);
    res.status(500).json({ error: error.message || 'Failed to save student record' });
  }
};

app.post('/api/students', handleCreateStudent);
app.post('/api/students/', handleCreateStudent);

// Update Student: PUT/PATCH /api/students/:id/ & /api/students/:id
const handleUpdateStudent = (req: Request, res: Response) => {
  try {
    const studentId = Number(req.params.id);
    if (isNaN(studentId)) {
      res.status(400).json({ error: 'Invalid student ID format' });
      return;
    }

    // Check if student exists
    const findStmt = db.prepare('SELECT * FROM students WHERE id = ?');
    const existingStudent = findStmt.get(studentId) as any;
    if (!existingStudent) {
      res.status(404).json({ error: `Student with ID ${studentId} not found` });
      return;
    }

    const { name, email, phone, age, course } = req.body || {};

    const isPatch = req.method === 'PATCH';
    const validation = validateStudentData({ name, email, phone, age, course }, isPatch);

    if (!validation.isValid) {
      res.status(400).json({
        error: Object.values(validation.errors)[0],
        errors: validation.errors,
      });
      return;
    }

    const updatedName = name !== undefined ? name.trim() : existingStudent.name;
    const updatedEmail = email !== undefined ? email.trim().toLowerCase() : existingStudent.email;
    const updatedPhone = phone !== undefined ? phone.trim() : existingStudent.phone;
    const updatedAge = age !== undefined ? Number(age) : existingStudent.age;
    const updatedCourse = course !== undefined ? course.trim() : existingStudent.course;

    // Check duplicate email for other students
    if (updatedEmail !== existingStudent.email) {
      const checkDup = db.prepare('SELECT id FROM students WHERE LOWER(email) = ? AND id != ?');
      const dup = checkDup.get(updatedEmail, studentId);
      if (dup) {
        res.status(400).json({
          error: 'Another student already has this email address.',
          field: 'email',
          errors: { email: 'Another student already has this email address.' },
        });
        return;
      }
    }

    const updateStmt = db.prepare(`
      UPDATE students 
      SET name = ?, email = ?, phone = ?, age = ?, course = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    updateStmt.run(updatedName, updatedEmail, updatedPhone, updatedAge, updatedCourse, studentId);

    const getStmt = db.prepare('SELECT * FROM students WHERE id = ?');
    const updatedRecord = getStmt.get(studentId);

    res.json(updatedRecord);
  } catch (error: any) {
    console.error('Error updating student:', error);
    res.status(500).json({ error: error.message || 'Failed to update student record' });
  }
};

app.put('/api/students/:id', handleUpdateStudent);
app.put('/api/students/:id/', handleUpdateStudent);
app.patch('/api/students/:id', handleUpdateStudent);
app.patch('/api/students/:id/', handleUpdateStudent);

// Delete Student: DELETE /api/students/:id/ & DELETE /api/students/:id
const handleDeleteStudent = (req: Request, res: Response) => {
  try {
    const studentId = Number(req.params.id);
    if (isNaN(studentId)) {
      res.status(400).json({ error: 'Invalid student ID format' });
      return;
    }

    const findStmt = db.prepare('SELECT * FROM students WHERE id = ?');
    const existing = findStmt.get(studentId);
    if (!existing) {
      res.status(404).json({ error: `Student with ID ${studentId} not found` });
      return;
    }

    const deleteStmt = db.prepare('DELETE FROM students WHERE id = ?');
    deleteStmt.run(studentId);

    res.json({ message: 'Student deleted successfully', id: studentId });
  } catch (error: any) {
    console.error('Error deleting student:', error);
    res.status(500).json({ error: error.message || 'Failed to delete student record' });
  }
};

app.delete('/api/students/:id', handleDeleteStudent);
app.delete('/api/students/:id/', handleDeleteStudent);

// Reset / Re-seed database (helpful for testing & demo resets)
app.post('/api/students/reset', (req: Request, res: Response) => {
  try {
    db.exec('DELETE FROM students;');
    db.exec('DELETE FROM sqlite_sequence WHERE name="students";');
    const insertSeed = db.prepare(
      'INSERT INTO students (name, email, phone, age, course) VALUES (?, ?, ?, ?, ?)'
    );
    insertSeed.run('Rahul Kumar', 'rahul@gmail.com', '9876543210', 20, 'BCA');
    insertSeed.run('Priya Sharma', 'priya@gmail.com', '9876543211', 21, 'B.Sc');
    insertSeed.run('Arjun Singh', 'arjun@gmail.com', '9876543212', 20, 'BCA');
    insertSeed.run('Ananya Patel', 'ananya@gmail.com', '9876543213', 22, 'MCA');
    insertSeed.run('Rohan Verma', 'rohan@gmail.com', '9876543214', 19, 'B.Tech');

    const all = db.prepare('SELECT * FROM students ORDER BY id ASC').all();
    res.json({ message: 'Database reset to initial seed state', students: all });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to reset database' });
  }
});

// Database summary endpoint
app.get('/api/stats', (req: Request, res: Response) => {
  try {
    const totalStmt = db.prepare('SELECT COUNT(*) as total FROM students');
    const total = (totalStmt.get() as any).total;

    const courseStmt = db.prepare('SELECT course, COUNT(*) as count FROM students GROUP BY course');
    const courses = courseStmt.all();

    const ageStmt = db.prepare('SELECT AVG(age) as avgAge, MIN(age) as minAge, MAX(age) as maxAge FROM students');
    const ageStats = ageStmt.get();

    res.json({
      total,
      courses,
      ageStats,
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to get stats' });
  }
});

// ----------------------------------------------------
// Vite Dev Server / Static Dist Serving
// ----------------------------------------------------
async function start() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

start();
