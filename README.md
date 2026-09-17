# Student Management System

A full-stack CRUD web application for managing student records using React, REST APIs, and an SQLite database.

## Architecture Overview

```text
             USER
               │
               ▼
      ┌────────────────┐
      │ React Frontend │ (Vite + TypeScript + Tailwind CSS)
      └────────────────┘
               │
          HTTP / JSON
               │
               ▼
       ┌───────────────┐
       │ REST API      │ (Express / Django REST Specification)
       └───────────────┘
               │
               ▼
       ┌───────────────┐
       │ SQLite DB     │ (db.sqlite3 with ACID compliance)
       └───────────────┘
```

## Student Entity Schema

| Field  | Data Type | Constraints             | Description             |
| :----- | :-------- | :---------------------- | :---------------------- |
| id     | INTEGER   | PRIMARY KEY AUTOINCREMENT| Unique student ID       |
| name   | TEXT      | NOT NULL                | Student's full name     |
| email  | TEXT      | UNIQUE, NOT NULL        | Student's email address |
| phone  | TEXT      | NOT NULL                | Student's phone number  |
| age    | INTEGER   | NOT NULL                | Student's age (14–100)  |
| course | TEXT      | NOT NULL                | Course enrolled (BCA...) |

## REST API Endpoints

| Operation         | HTTP Method | Endpoint              | Description                        |
| ----------------- | ----------- | --------------------- | ---------------------------------- |
| Create Student    | POST        | `/api/students/`      | Add a new student record           |
| Read All Students | GET         | `/api/students/`      | Retrieve all students (with search)|
| Read One Student  | GET         | `/api/students/{id}/` | Retrieve details for a single ID   |
| Update Student    | PUT / PATCH | `/api/students/{id}/` | Modify an existing student record  |
| Delete Student    | DELETE      | `/api/students/{id}/` | Remove a record with confirmation  |
| Health Check      | GET         | `/api/health`         | Verify server and database status  |
| Seed Reset        | POST        | `/api/students/reset` | Restore initial default demo data  |

## Key Features

1. **Full CRUD Operations**: Create new students, read full directory or individual profiles, edit existing details, and delete records with safety confirmation.
2. **Real-time Search & Filter**: Instant search across Student Name, Email, Course, or Student ID.
3. **Multi-layer Validation**:
   - Client-side pre-validation with inline error feedback.
   - Server-side validation rejecting invalid emails, empty mandatory fields, non-numeric ages, and duplicate email entries (HTTP 400).
4. **Interactive Postman / Testing Suite**: Built-in test runner for the 10 Functional Test Cases (`TC01` to `TC10`) and custom raw HTTP requests.
5. **Demonstration Guide**: Integrated 8-step demonstration helper for presentations and evaluations.
