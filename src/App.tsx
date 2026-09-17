import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { StatsCards } from './components/StatsCards';
import { StudentForm } from './components/StudentForm';
import { StudentList } from './components/StudentList';
import { StudentDetailModal } from './components/StudentDetailModal';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { ApiTesterModal } from './components/ApiTesterModal';
import { DemoGuideModal } from './components/DemoGuideModal';
import { Student, StudentFormData } from './types';
import { studentApi, ApiError } from './services/api';
import { CheckCircle2, AlertCircle, X, Sparkles } from 'lucide-react';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

export default function App() {
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormSubmitting, setIsFormSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [dbConnected, setDbConnected] = useState(true);

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('ALL');

  // Modal / Interaction states
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [detailStudentId, setDetailStudentId] = useState<number | null>(null);
  const [deletingStudent, setDeletingStudent] = useState<Student | null>(null);
  const [isTesterOpen, setIsTesterOpen] = useState(false);
  const [isDemoGuideOpen, setIsDemoGuideOpen] = useState(false);

  // Form error state from server
  const [formServerError, setFormServerError] = useState<string | null>(null);
  const [formServerErrors, setFormServerErrors] = useState<Record<string, string>>({});

  // Toast notifications
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Fetch student list from REST API backend
  const loadStudents = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await studentApi.getAll(searchQuery, selectedCourse);
      setStudents(data);
      setDbConnected(true);
    } catch (err: any) {
      console.error('Failed to load students:', err);
      setDbConnected(false);
      addToast(err.message || 'Could not load students from database', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, selectedCourse]);

  // Initial load and health check
  useEffect(() => {
    studentApi
      .checkHealth()
      .then(() => setDbConnected(true))
      .catch(() => setDbConnected(false));
  }, []);

  useEffect(() => {
    loadStudents();
  }, [loadStudents]);

  // Derive unique courses for filter dropdown
  const availableCourses = Array.from(
    new Set(students.map((s) => s.course.trim()).filter(Boolean))
  ).sort();

  // Create or Update Student
  const handleFormSubmit = async (formData: StudentFormData) => {
    setIsFormSubmitting(true);
    setFormServerError(null);
    setFormServerErrors({});

    try {
      if (editingStudent) {
        // Update (PUT)
        const updated = await studentApi.update(editingStudent.id, formData);
        addToast(`Student #${updated.id} (${updated.name}) updated successfully!`, 'success');
        setEditingStudent(null);
      } else {
        // Create (POST)
        const created = await studentApi.create(formData);
        addToast(`Student #${created.id} (${created.name}) created successfully!`, 'success');
      }

      await loadStudents();
    } catch (err: any) {
      if (err instanceof ApiError) {
        setFormServerError(err.message);
        if (err.data?.errors) {
          setFormServerErrors(err.data.errors);
        }
      } else {
        setFormServerError(err.message || 'Failed to save student');
      }
      addToast(err.message || 'Operation failed', 'error');
    } finally {
      setIsFormSubmitting(false);
    }
  };

  // Confirm Delete
  const handleConfirmDelete = async () => {
    if (!deletingStudent) return;
    setIsDeleting(true);
    try {
      await studentApi.delete(deletingStudent.id);
      addToast(`Student #${deletingStudent.id} (${deletingStudent.name}) deleted`, 'info');
      setDeletingStudent(null);
      // If the deleted student was being edited, clear it
      if (editingStudent?.id === deletingStudent.id) {
        setEditingStudent(null);
      }
      await loadStudents();
    } catch (err: any) {
      addToast(err.message || 'Failed to delete student', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  // Reset database with seeds
  const handleResetData = async () => {
    setIsResetting(true);
    try {
      await studentApi.resetDemo();
      addToast('SQLite database reset to initial seed records', 'info');
      setEditingStudent(null);
      setSearchQuery('');
      setSelectedCourse('ALL');
      await loadStudents();
    } catch (err: any) {
      addToast(err.message || 'Failed to reset database', 'error');
    } finally {
      setIsResetting(false);
    }
  };

  // Pre-fill a sample student for testing
  const handlePreFillSample = () => {
    setEditingStudent(null);
    const sampleNames = ['Kavita Mehta', 'Aakash Roy', 'Vikram Patel', 'Divya Nair'];
    const courses = ['BCA', 'B.Sc', 'MCA', 'B.Tech'];
    const randomIdx = Math.floor(Math.random() * sampleNames.length);
    const randomName = sampleNames[randomIdx];
    const emailPrefix = randomName.toLowerCase().replace(/\s+/g, '.');
    const randomSuffix = Math.floor(100 + Math.random() * 900);

    const formElement = document.getElementById('student-name-input') as HTMLInputElement;
    if (formElement) {
      formElement.focus();
      formElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    // Set sample student in form via event
    const emailInput = document.getElementById('student-email-input') as HTMLInputElement;
    const phoneInput = document.getElementById('student-phone-input') as HTMLInputElement;
    const ageInput = document.getElementById('student-age-input') as HTMLInputElement;
    const courseInput = document.getElementById('student-course-input') as HTMLInputElement;

    if (formElement && emailInput && phoneInput && ageInput && courseInput) {
      formElement.value = randomName;
      formElement.dispatchEvent(new Event('input', { bubbles: true }));

      emailInput.value = `${emailPrefix}${randomSuffix}@gmail.com`;
      emailInput.dispatchEvent(new Event('input', { bubbles: true }));

      phoneInput.value = `9876543${randomSuffix}`;
      phoneInput.dispatchEvent(new Event('input', { bubbles: true }));

      ageInput.value = String(20 + (randomIdx % 3));
      ageInput.dispatchEvent(new Event('input', { bubbles: true }));

      courseInput.value = courses[randomIdx];
      courseInput.dispatchEvent(new Event('input', { bubbles: true }));

      addToast(`Pre-filled sample: ${randomName}. Click "Add Student" to save!`, 'info');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-800 flex flex-col font-sans antialiased selection:bg-indigo-500 selection:text-white">
      {/* App Header */}
      <Header
        totalStudents={students.length}
        dbConnected={dbConnected}
        onOpenTester={() => setIsTesterOpen(true)}
        onOpenDemo={() => setIsDemoGuideOpen(true)}
        onResetData={handleResetData}
        isResetting={isResetting}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        {/* System Metric Summary Cards */}
        <StatsCards students={students} />

        {/* Quick Demonstration Banner */}
        <div className="p-3.5 bg-indigo-50/80 border border-indigo-200/80 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-indigo-950 shadow-2xs">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="font-bold">Live Demonstration Ready:</span>
              <span className="text-indigo-800 ml-1.5">
                Full-stack CRUD operations with REST APIs (`/api/students/`), server validations, and persistent SQLite storage.
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              type="button"
              id="btn-quick-sample-fill"
              onClick={handlePreFillSample}
              className="px-3 py-1 bg-white hover:bg-indigo-50 text-indigo-700 font-semibold rounded-md border border-indigo-300 transition-colors shadow-2xs cursor-pointer"
            >
              Fill Sample Data
            </button>
            <button
              type="button"
              id="btn-quick-open-suite"
              onClick={() => setIsTesterOpen(true)}
              className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-md transition-colors shadow-2xs cursor-pointer"
            >
              Run API Tests
            </button>
          </div>
        </div>

        {/* Core CRUD Application Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Add / Edit Student Form (Section 12.B) */}
          <div className="lg:col-span-5">
            <StudentForm
              initialData={editingStudent}
              onSubmit={handleFormSubmit}
              onCancelEdit={() => setEditingStudent(null)}
              isLoading={isFormSubmitting}
              serverError={formServerError}
              serverErrors={formServerErrors}
            />
          </div>

          {/* Right Column: Search & Student Directory List (Section 12.C & 12.D) */}
          <div className="lg:col-span-7">
            <StudentList
              students={students}
              isLoading={isLoading}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              selectedCourse={selectedCourse}
              onCourseChange={setSelectedCourse}
              onViewDetails={(student) => setDetailStudentId(student.id)}
              onEdit={(student) => {
                setEditingStudent(student);
                // Smooth scroll to form on mobile
                const formCard = document.getElementById('student-form-card');
                if (formCard) formCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
              onDelete={(student) => setDeletingStudent(student)}
              onRefresh={loadStudents}
              availableCourses={availableCourses}
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto py-6 border-t border-slate-200 bg-white text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">Student Management System</span>
            <span>•</span>
            <span>REST API (Django / Express Architecture)</span>
            <span>•</span>
            <span className="font-mono text-slate-600">SQLite (db.sqlite3)</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>GET, POST, PUT, DELETE Endpoints Active</span>
          </div>
        </div>
      </footer>

      {/* Modals & Dialogs */}
      {/* 1. Student Details Modal (Read One) */}
      <StudentDetailModal
        studentId={detailStudentId}
        onClose={() => setDetailStudentId(null)}
        onEdit={(student) => {
          setEditingStudent(student);
          const formCard = document.getElementById('student-form-card');
          if (formCard) formCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }}
        onDelete={(student) => setDeletingStudent(student)}
      />

      {/* 2. Delete Confirmation Modal (Section 8.D) */}
      <DeleteConfirmModal
        student={deletingStudent}
        isOpen={Boolean(deletingStudent)}
        isDeleting={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeletingStudent(null)}
      />

      {/* 3. API Tester Modal (Section 17 & 18) */}
      <ApiTesterModal
        isOpen={isTesterOpen}
        onClose={() => setIsTesterOpen(false)}
        onRefreshParent={loadStudents}
      />

      {/* 4. Demonstration Guide Modal (Section 25) */}
      <DemoGuideModal
        isOpen={isDemoGuideOpen}
        onClose={() => setIsDemoGuideOpen(false)}
        onPopulateSample={handlePreFillSample}
      />

      {/* Toast Notification Container */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none max-w-sm w-full">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`p-3.5 rounded-lg shadow-lg border text-xs font-medium flex items-center justify-between gap-2 pointer-events-auto transition-all animate-in slide-in-from-bottom-2 ${
              toast.type === 'success'
                ? 'bg-slate-900 text-white border-slate-800'
                : toast.type === 'error'
                ? 'bg-rose-600 text-white border-rose-700'
                : 'bg-indigo-600 text-white border-indigo-700'
            }`}
          >
            <div className="flex items-center gap-2">
              {toast.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              ) : toast.type === 'error' ? (
                <AlertCircle className="w-4 h-4 text-white flex-shrink-0" />
              ) : (
                <Sparkles className="w-4 h-4 text-indigo-200 flex-shrink-0" />
              )}
              <span>{toast.message}</span>
            </div>
            <button
              type="button"
              onClick={() => removeToast(toast.id)}
              className="p-1 text-white/70 hover:text-white cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
