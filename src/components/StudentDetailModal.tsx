import React, { useEffect, useState } from 'react';
import { X, User, Mail, Phone, Calendar, BookOpen, Clock, Edit2, Trash2, CheckCircle } from 'lucide-react';
import { Student } from '../types';
import { studentApi } from '../services/api';

interface StudentDetailModalProps {
  studentId: number | null;
  onClose: () => void;
  onEdit: (student: Student) => void;
  onDelete: (student: Student) => void;
}

export const StudentDetailModal: React.FC<StudentDetailModalProps> = ({
  studentId,
  onClose,
  onEdit,
  onDelete,
}) => {
  const [student, setStudent] = useState<Student | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!studentId) {
      setStudent(null);
      return;
    }

    const fetchDetail = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await studentApi.getById(studentId);
        setStudent(data);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch student details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetail();
  }, [studentId]);

  if (!studentId) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div
        id="student-detail-modal"
        className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-sm">
              #{studentId}
            </div>
            <div>
              <h3 className="text-base font-bold">Student Record Details</h3>
              <p className="text-xs text-slate-400 font-mono">GET /api/students/{studentId}/</p>
            </div>
          </div>
          <button
            type="button"
            id="btn-close-detail-modal"
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {isLoading ? (
            <div className="py-8 flex flex-col items-center justify-center gap-2">
              <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs text-slate-500">Querying SQLite database...</p>
            </div>
          ) : error ? (
            <div className="p-4 bg-rose-50 text-rose-800 rounded-lg text-sm border border-rose-200">
              <p className="font-semibold">Error Loading Record</p>
              <p className="text-xs mt-1">{error}</p>
            </div>
          ) : student ? (
            <div className="space-y-5">
              {/* Profile Card Summary */}
              <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                <div className="w-14 h-14 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xl font-bold flex-shrink-0 shadow-xs">
                  {student.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <h4 className="text-lg font-bold text-slate-900 truncate">{student.name}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-indigo-100 text-indigo-800">
                      {student.course}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">Age: {student.age} years</span>
                  </div>
                </div>
              </div>

              {/* Data Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                <div className="p-3 rounded-lg border border-slate-200 bg-white">
                  <div className="flex items-center gap-1.5 text-slate-500 mb-1">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-semibold">Email Address</span>
                  </div>
                  <p className="font-mono text-slate-800 text-sm font-medium">{student.email}</p>
                </div>

                <div className="p-3 rounded-lg border border-slate-200 bg-white">
                  <div className="flex items-center gap-1.5 text-slate-500 mb-1">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-semibold">Phone Number</span>
                  </div>
                  <p className="font-mono text-slate-800 text-sm font-medium">{student.phone}</p>
                </div>

                <div className="p-3 rounded-lg border border-slate-200 bg-white">
                  <div className="flex items-center gap-1.5 text-slate-500 mb-1">
                    <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-semibold">Course Enrolled</span>
                  </div>
                  <p className="text-slate-800 text-sm font-medium">{student.course}</p>
                </div>

                <div className="p-3 rounded-lg border border-slate-200 bg-white">
                  <div className="flex items-center gap-1.5 text-slate-500 mb-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-semibold">Registered Age</span>
                  </div>
                  <p className="text-slate-800 text-sm font-medium">{student.age} years old</p>
                </div>
              </div>

              {/* Metadata Timestamps */}
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/60 text-[11px] text-slate-500 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Created: {student.created_at || 'Just now'}</span>
                </div>
                {student.updated_at && (
                  <span>Updated: {student.updated_at}</span>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-between border-t border-slate-200">
                <button
                  type="button"
                  id="btn-modal-delete-student"
                  onClick={() => {
                    onClose();
                    onDelete(student);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Student</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    id="btn-modal-edit-student"
                    onClick={() => {
                      onClose();
                      onEdit(student);
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-xs cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit Record</span>
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};
