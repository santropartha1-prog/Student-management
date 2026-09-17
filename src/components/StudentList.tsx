import React, { useState } from 'react';
import { Search, Edit2, Trash2, Eye, Filter, ArrowUpDown, RefreshCw, XCircle } from 'lucide-react';
import { Student } from '../types';

interface StudentListProps {
  students: Student[];
  isLoading: boolean;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCourse: string;
  onCourseChange: (course: string) => void;
  onViewDetails: (student: Student) => void;
  onEdit: (student: Student) => void;
  onDelete: (student: Student) => void;
  onRefresh: () => void;
  availableCourses: string[];
}

type SortField = 'id' | 'name' | 'email' | 'age' | 'course';
type SortOrder = 'asc' | 'desc';

export const StudentList: React.FC<StudentListProps> = ({
  students,
  isLoading,
  searchQuery,
  onSearchChange,
  selectedCourse,
  onCourseChange,
  onViewDetails,
  onEdit,
  onDelete,
  onRefresh,
  availableCourses,
}) => {
  const [sortField, setSortField] = useState<SortField>('id');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const sortedStudents = [...students].sort((a, b) => {
    let comparison = 0;
    if (sortField === 'id' || sortField === 'age') {
      comparison = a[sortField] - b[sortField];
    } else {
      comparison = a[sortField].localeCompare(b[sortField]);
    }
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  // Unique course badge colors
  const getCourseBadgeClass = (course: string) => {
    const c = course.toUpperCase();
    if (c.includes('BCA')) return 'bg-blue-50 text-blue-700 border-blue-200';
    if (c.includes('BSC') || c.includes('B.SC')) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (c.includes('MCA')) return 'bg-purple-50 text-purple-700 border-purple-200';
    if (c.includes('TECH') || c.includes('B.TECH')) return 'bg-amber-50 text-amber-700 border-amber-200';
    if (c.includes('MBA')) return 'bg-indigo-50 text-indigo-700 border-indigo-200';
    return 'bg-slate-100 text-slate-700 border-slate-200';
  };

  return (
    <div
      id="student-list-container"
      className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden"
    >
      {/* Search & Filter Bar (Section 12.C & 16) */}
      <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/50 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <span>Student Records</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                {students.length} {students.length === 1 ? 'record' : 'records'}
              </span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Browse, search, inspect, modify or delete student database entries
            </p>
          </div>

          <button
            type="button"
            id="btn-refresh-students"
            onClick={onRefresh}
            disabled={isLoading}
            className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
            title="Refresh from SQLite database"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh Table</span>
          </button>
        </div>

        {/* Search controls */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-1">
          {/* Search Input (Section 16: Name, Email, Course, Student ID) */}
          <div className="sm:col-span-8 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              id="search-student-input"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search by name, email, course, or ID (e.g., 'Rahul' or 'BCA')..."
              className="w-full pl-9 pr-8 py-2 text-sm bg-white rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 text-slate-900"
            />
            {searchQuery && (
              <button
                type="button"
                id="btn-clear-search"
                onClick={() => onSearchChange('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                title="Clear search"
              >
                <XCircle className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Course Filter Dropdown */}
          <div className="sm:col-span-4 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Filter className="w-4 h-4" />
            </div>
            <select
              id="course-filter-select"
              value={selectedCourse}
              onChange={(e) => onCourseChange(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm bg-white rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 text-slate-900 cursor-pointer"
            >
              <option value="ALL">All Courses</option>
              {availableCourses.map((course) => (
                <option key={course} value={course}>
                  {course}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Table Section (Section 12.D) */}
      <div className="overflow-x-auto">
        <table id="students-table" className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold text-xs uppercase tracking-wider">
              <th
                className="py-3 px-4 cursor-pointer hover:bg-slate-100 transition-colors w-16"
                onClick={() => handleSort('id')}
              >
                <div className="flex items-center gap-1">
                  <span>ID</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th
                className="py-3 px-4 cursor-pointer hover:bg-slate-100 transition-colors"
                onClick={() => handleSort('name')}
              >
                <div className="flex items-center gap-1">
                  <span>Student Name</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th
                className="py-3 px-4 cursor-pointer hover:bg-slate-100 transition-colors"
                onClick={() => handleSort('email')}
              >
                <div className="flex items-center gap-1">
                  <span>Email</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="py-3 px-4">Phone</th>
              <th
                className="py-3 px-4 cursor-pointer hover:bg-slate-100 transition-colors w-20"
                onClick={() => handleSort('age')}
              >
                <div className="flex items-center gap-1">
                  <span>Age</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th
                className="py-3 px-4 cursor-pointer hover:bg-slate-100 transition-colors"
                onClick={() => handleSort('course')}
              >
                <div className="flex items-center gap-1">
                  <span>Course</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="py-3 px-4 text-right pr-6 w-36">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {isLoading && students.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-500">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                    <span className="text-xs">Connecting to SQLite database...</span>
                  </div>
                </td>
              </tr>
            ) : sortedStudents.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-500">
                  <div className="max-w-xs mx-auto space-y-2">
                    <p className="text-sm font-semibold text-slate-700">No student records found</p>
                    <p className="text-xs text-slate-500">
                      {searchQuery || selectedCourse !== 'ALL'
                        ? 'No students match your search filter. Try clearing your query.'
                        : 'No students currently exist in the database. Use the form above to add a student.'}
                    </p>
                    {(searchQuery || selectedCourse !== 'ALL') && (
                      <button
                        type="button"
                        id="btn-reset-filters"
                        onClick={() => {
                          onSearchChange('');
                          onCourseChange('ALL');
                        }}
                        className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium text-indigo-600 bg-indigo-50 rounded-md hover:bg-indigo-100 transition-colors mt-2 cursor-pointer"
                      >
                        Reset Filters
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              sortedStudents.map((student) => (
                <tr
                  key={student.id}
                  id={`student-row-${student.id}`}
                  className="hover:bg-slate-50/80 transition-colors group"
                >
                  {/* ID */}
                  <td className="py-3 px-4 font-mono text-xs font-bold text-slate-600">
                    #{student.id}
                  </td>

                  {/* Name with initial avatar */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-xs font-bold flex-shrink-0 group-hover:bg-indigo-100 group-hover:text-indigo-700 transition-colors">
                        {student.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">
                        {student.name}
                      </span>
                    </div>
                  </td>

                  {/* Email */}
                  <td className="py-3 px-4 text-slate-600 font-mono text-xs">
                    {student.email}
                  </td>

                  {/* Phone */}
                  <td className="py-3 px-4 text-slate-600 font-mono text-xs">
                    {student.phone}
                  </td>

                  {/* Age */}
                  <td className="py-3 px-4 text-slate-700 text-xs font-medium">
                    {student.age} yrs
                  </td>

                  {/* Course */}
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getCourseBadgeClass(
                        student.course
                      )}`}
                    >
                      {student.course}
                    </span>
                  </td>

                  {/* Actions (View, Edit, Delete) */}
                  <td className="py-3 px-4 text-right pr-6">
                    <div className="inline-flex items-center gap-1.5 justify-end">
                      {/* View Details */}
                      <button
                        type="button"
                        id={`btn-view-student-${student.id}`}
                        onClick={() => onViewDetails(student)}
                        className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors cursor-pointer"
                        title="View student profile details (GET /api/students/{id}/)"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {/* Edit */}
                      <button
                        type="button"
                        id={`btn-edit-student-${student.id}`}
                        onClick={() => onEdit(student)}
                        className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-md transition-colors cursor-pointer"
                        title="Edit student record"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      {/* Delete */}
                      <button
                        type="button"
                        id={`btn-delete-student-${student.id}`}
                        onClick={() => onDelete(student)}
                        className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                        title="Delete student record"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
