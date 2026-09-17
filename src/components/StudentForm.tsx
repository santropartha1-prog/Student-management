import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Calendar, BookOpen, PlusCircle, CheckCircle, X, AlertCircle } from 'lucide-react';
import { Student, StudentFormData, FormValidationErrors } from '../types';

interface StudentFormProps {
  initialData?: Student | null;
  onSubmit: (data: StudentFormData) => Promise<void>;
  onCancelEdit?: () => void;
  isLoading: boolean;
  serverError?: string | null;
  serverErrors?: Record<string, string>;
}

const COMMON_COURSES = ['BCA', 'B.Sc', 'MCA', 'B.Tech', 'B.Com', 'MBA', 'M.Tech', 'BBA'];

export const StudentForm: React.FC<StudentFormProps> = ({
  initialData,
  onSubmit,
  onCancelEdit,
  isLoading,
  serverError,
  serverErrors,
}) => {
  const isEditMode = Boolean(initialData);

  const [formData, setFormData] = useState<StudentFormData>({
    name: '',
    email: '',
    phone: '',
    age: '',
    course: '',
  });

  const [errors, setErrors] = useState<FormValidationErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // When editing student changes or is reset
  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        email: initialData.email,
        phone: initialData.phone,
        age: String(initialData.age),
        course: initialData.course,
      });
      setErrors({});
      setTouched({});
    } else {
      setFormData({
        name: '',
        email: '',
        phone: '',
        age: '',
        course: '',
      });
      setErrors({});
      setTouched({});
    }
  }, [initialData]);

  // Combine server errors when provided
  useEffect(() => {
    if (serverErrors && Object.keys(serverErrors).length > 0) {
      setErrors((prev) => ({ ...prev, ...serverErrors }));
    }
  }, [serverErrors]);

  const validate = (data: StudentFormData): FormValidationErrors => {
    const errs: FormValidationErrors = {};

    // 1. Name validation
    if (!data.name.trim()) {
      errs.name = 'Name is required.';
    } else if (data.name.trim().length < 2) {
      errs.name = 'Name must be at least 2 characters.';
    }

    // 2. Email validation
    if (!data.email.trim()) {
      errs.email = 'Email is required.';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.email.trim())) {
        errs.email = 'Please enter a valid email address.';
      }
    }

    // 3. Phone validation
    if (!data.phone.trim()) {
      errs.phone = 'Phone number is required.';
    } else {
      const digits = data.phone.replace(/\D/g, '');
      if (digits.length < 7 || digits.length > 15) {
        errs.phone = 'Please enter a valid phone number (7 to 15 digits).';
      }
    }

    // 4. Age validation
    if (!data.age || String(data.age).trim() === '') {
      errs.age = 'Age is required.';
    } else {
      const ageNum = Number(data.age);
      if (isNaN(ageNum)) {
        errs.age = 'Age must be a number.';
      } else if (!Number.isInteger(ageNum) || ageNum < 14 || ageNum > 100) {
        errs.age = 'Age must be an integer between 14 and 100.';
      }
    }

    // 5. Course validation
    if (!data.course.trim()) {
      errs.course = 'Course is required.';
    }

    return errs;
  };

  const handleChange = (field: keyof StudentFormData, value: string) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);

    if (touched[field]) {
      const validationErrs = validate(updated);
      setErrors((prev) => ({
        ...prev,
        [field]: validationErrs[field],
      }));
    }
  };

  const handleBlur = (field: keyof StudentFormData) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const validationErrs = validate(formData);
    setErrors((prev) => ({
      ...prev,
      [field]: validationErrs[field],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Mark all as touched
    setTouched({
      name: true,
      email: true,
      phone: true,
      age: true,
      course: true,
    });

    const validationErrs = validate(formData);
    setErrors(validationErrs);

    if (Object.keys(validationErrs).length > 0) {
      return;
    }

    await onSubmit(formData);
  };

  const handleSelectCoursePill = (course: string) => {
    handleChange('course', course);
    setTouched((prev) => ({ ...prev, course: true }));
  };

  return (
    <div
      id="student-form-card"
      className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden transition-all"
    >
      {/* Form Header */}
      <div
        className={`px-5 py-4 border-b flex items-center justify-between ${
          isEditMode
            ? 'bg-amber-50/70 border-amber-200 text-amber-900'
            : 'bg-slate-50/80 border-slate-200 text-slate-900'
        }`}
      >
        <div className="flex items-center gap-2.5">
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              isEditMode ? 'bg-amber-500 text-white' : 'bg-indigo-600 text-white'
            }`}
          >
            {isEditMode ? <CheckCircle className="w-4 h-4" /> : <PlusCircle className="w-4 h-4" />}
          </div>
          <div>
            <h2 className="text-base font-bold tracking-tight">
              {isEditMode ? `Edit Student (ID: #${initialData?.id})` : 'Add Student Form'}
            </h2>
            <p className="text-xs text-slate-500">
              {isEditMode
                ? 'Update the student record and save changes to SQLite database'
                : 'Enter student details to register a new record'}
            </p>
          </div>
        </div>

        {isEditMode && onCancelEdit && (
          <button
            type="button"
            id="btn-cancel-edit-top"
            onClick={onCancelEdit}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-slate-900 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
            <span>Cancel</span>
          </button>
        )}
      </div>

      {/* Form Content */}
      <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4" noValidate>
        {/* Global Server Error Banner */}
        {serverError && (
          <div
            id="form-server-error"
            className="p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-start gap-2 text-rose-800 text-xs"
          >
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Operation Failed</p>
              <p>{serverError}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Student Name */}
          <div className="space-y-1.5">
            <label htmlFor="student-name-input" className="block text-xs font-semibold text-slate-700">
              Student Name <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                id="student-name-input"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                onBlur={() => handleBlur('name')}
                placeholder="e.g. Rahul Kumar"
                className={`w-full pl-9 pr-3 py-2 text-sm rounded-lg border transition-colors bg-white focus:outline-none focus:ring-2 ${
                  errors.name
                    ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-200 text-rose-900'
                    : 'border-slate-300 focus:border-indigo-500 focus:ring-indigo-100 text-slate-900'
                }`}
                disabled={isLoading}
              />
            </div>
            {errors.name && (
              <p id="error-student-name" className="text-xs text-rose-600 font-medium">
                {errors.name}
              </p>
            )}
          </div>

          {/* Email Address */}
          <div className="space-y-1.5">
            <label htmlFor="student-email-input" className="block text-xs font-semibold text-slate-700">
              Email Address <span className="text-rose-500">* (Unique)</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                id="student-email-input"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                onBlur={() => handleBlur('email')}
                placeholder="e.g. rahul@gmail.com"
                className={`w-full pl-9 pr-3 py-2 text-sm rounded-lg border transition-colors bg-white focus:outline-none focus:ring-2 ${
                  errors.email
                    ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-200 text-rose-900'
                    : 'border-slate-300 focus:border-indigo-500 focus:ring-indigo-100 text-slate-900'
                }`}
                disabled={isLoading}
              />
            </div>
            {errors.email && (
              <p id="error-student-email" className="text-xs text-rose-600 font-medium">
                {errors.email}
              </p>
            )}
          </div>

          {/* Phone Number */}
          <div className="space-y-1.5">
            <label htmlFor="student-phone-input" className="block text-xs font-semibold text-slate-700">
              Phone Number <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Phone className="w-4 h-4" />
              </div>
              <input
                type="tel"
                id="student-phone-input"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                onBlur={() => handleBlur('phone')}
                placeholder="e.g. 9876543210"
                className={`w-full pl-9 pr-3 py-2 text-sm rounded-lg border transition-colors bg-white focus:outline-none focus:ring-2 ${
                  errors.phone
                    ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-200 text-rose-900'
                    : 'border-slate-300 focus:border-indigo-500 focus:ring-indigo-100 text-slate-900'
                }`}
                disabled={isLoading}
              />
            </div>
            {errors.phone && (
              <p id="error-student-phone" className="text-xs text-rose-600 font-medium">
                {errors.phone}
              </p>
            )}
          </div>

          {/* Age */}
          <div className="space-y-1.5">
            <label htmlFor="student-age-input" className="block text-xs font-semibold text-slate-700">
              Age <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Calendar className="w-4 h-4" />
              </div>
              <input
                type="number"
                id="student-age-input"
                min="14"
                max="100"
                value={formData.age}
                onChange={(e) => handleChange('age', e.target.value)}
                onBlur={() => handleBlur('age')}
                placeholder="e.g. 20"
                className={`w-full pl-9 pr-3 py-2 text-sm rounded-lg border transition-colors bg-white focus:outline-none focus:ring-2 ${
                  errors.age
                    ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-200 text-rose-900'
                    : 'border-slate-300 focus:border-indigo-500 focus:ring-indigo-100 text-slate-900'
                }`}
                disabled={isLoading}
              />
            </div>
            {errors.age && (
              <p id="error-student-age" className="text-xs text-rose-600 font-medium">
                {errors.age}
              </p>
            )}
          </div>
        </div>

        {/* Course */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="student-course-input" className="block text-xs font-semibold text-slate-700">
              Course <span className="text-rose-500">*</span>
            </label>
            <span className="text-[11px] text-slate-400">Select or type custom course</span>
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <BookOpen className="w-4 h-4" />
            </div>
            <input
              type="text"
              id="student-course-input"
              value={formData.course}
              onChange={(e) => handleChange('course', e.target.value)}
              onBlur={() => handleBlur('course')}
              placeholder="e.g. BCA, B.Sc, MCA, B.Tech"
              className={`w-full pl-9 pr-3 py-2 text-sm rounded-lg border transition-colors bg-white focus:outline-none focus:ring-2 ${
                errors.course
                  ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-200 text-rose-900'
                  : 'border-slate-300 focus:border-indigo-500 focus:ring-indigo-100 text-slate-900'
              }`}
              disabled={isLoading}
            />
          </div>

          {/* Quick course pills */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {COMMON_COURSES.map((c) => (
              <button
                key={c}
                type="button"
                id={`btn-course-preset-${c.toLowerCase().replace(/[^a-z0-9]/g, '')}`}
                onClick={() => handleSelectCoursePill(c)}
                className={`text-xs px-2.5 py-0.5 rounded-full border transition-all cursor-pointer ${
                  formData.course.toUpperCase() === c.toUpperCase()
                    ? 'bg-indigo-600 text-white border-indigo-600 font-semibold'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          {errors.course && (
            <p id="error-student-course" className="text-xs text-rose-600 font-medium">
              {errors.course}
            </p>
          )}
        </div>

        {/* Buttons */}
        <div className="pt-2 flex items-center justify-end gap-3">
          {isEditMode && onCancelEdit && (
            <button
              type="button"
              id="btn-cancel-student-edit"
              onClick={onCancelEdit}
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
          )}

          <button
            type="submit"
            id={isEditMode ? 'btn-update-student' : 'btn-add-student'}
            disabled={isLoading}
            className={`inline-flex items-center justify-center gap-2 px-6 py-2 rounded-lg text-sm font-semibold text-white shadow-xs transition-colors cursor-pointer disabled:opacity-50 ${
              isEditMode
                ? 'bg-amber-600 hover:bg-amber-700 focus:ring-2 focus:ring-amber-400'
                : 'bg-indigo-600 hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-400'
            }`}
          >
            {isLoading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>{isEditMode ? 'Updating...' : 'Adding...'}</span>
              </>
            ) : isEditMode ? (
              <>
                <CheckCircle className="w-4 h-4" />
                <span>Update Student</span>
              </>
            ) : (
              <>
                <PlusCircle className="w-4 h-4" />
                <span>Add Student</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
