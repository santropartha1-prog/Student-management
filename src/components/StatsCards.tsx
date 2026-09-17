import React from 'react';
import { Users, BookOpen, Clock, Database } from 'lucide-react';
import { Student } from '../types';

interface StatsCardsProps {
  students: Student[];
}

export const StatsCards: React.FC<StatsCardsProps> = ({ students }) => {
  const totalStudents = students.length;

  const uniqueCourses = new Set(students.map((s) => s.course.trim().toUpperCase())).size;

  const avgAge =
    totalStudents > 0
      ? (students.reduce((acc, s) => acc + s.age, 0) / totalStudents).toFixed(1)
      : '0';

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {/* Total Students */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center gap-3.5">
        <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0">
          <Users className="w-5 h-5" />
        </div>
        <div>
          <p className="text-xs text-slate-500 font-medium">Total Students</p>
          <h3 className="text-xl font-bold text-slate-900 tracking-tight">{totalStudents}</h3>
        </div>
      </div>

      {/* Courses Offered */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center gap-3.5">
        <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
          <BookOpen className="w-5 h-5" />
        </div>
        <div>
          <p className="text-xs text-slate-500 font-medium">Active Courses</p>
          <h3 className="text-xl font-bold text-slate-900 tracking-tight">{uniqueCourses}</h3>
        </div>
      </div>

      {/* Average Age */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center gap-3.5">
        <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
          <Clock className="w-5 h-5" />
        </div>
        <div>
          <p className="text-xs text-slate-500 font-medium">Average Age</p>
          <h3 className="text-xl font-bold text-slate-900 tracking-tight">
            {avgAge} <span className="text-xs text-slate-500 font-normal">yrs</span>
          </h3>
        </div>
      </div>

      {/* Database Engine */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center gap-3.5">
        <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center flex-shrink-0">
          <Database className="w-5 h-5" />
        </div>
        <div>
          <p className="text-xs text-slate-500 font-medium">Database</p>
          <h3 className="text-sm font-bold text-slate-900 tracking-tight">
            SQLite 3 <span className="text-[11px] font-mono text-slate-500 font-normal">db.sqlite3</span>
          </h3>
        </div>
      </div>
    </div>
  );
};
