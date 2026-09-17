import React from 'react';
import { Database, ShieldCheck, PlayCircle, Terminal, RefreshCw, GraduationCap } from 'lucide-react';

interface HeaderProps {
  totalStudents: number;
  dbConnected: boolean;
  onOpenTester: () => void;
  onOpenDemo: () => void;
  onResetData: () => void;
  isResetting: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  totalStudents,
  dbConnected,
  onOpenTester,
  onOpenDemo,
  onResetData,
  isResetting,
}) => {
  return (
    <header className="bg-slate-900 text-slate-100 border-b border-slate-800 sticky top-0 z-30 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between py-4 gap-4">
          {/* Title & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-inner flex-shrink-0">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white font-sans">
                  STUDENT MANAGEMENT SYSTEM
                </h1>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Full-Stack CRUD
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5 flex items-center gap-2">
                <span>React Frontend</span>
                <span className="text-slate-600">•</span>
                <span>REST API</span>
                <span className="text-slate-600">•</span>
                <span>SQLite DB</span>
              </p>
            </div>
          </div>

          {/* Controls & Badges */}
          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
            {/* DB & Server Status */}
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-800 text-xs font-medium text-slate-300 border border-slate-700">
              <span className={`w-2 h-2 rounded-full ${dbConnected ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'}`} />
              <Database className="w-3.5 h-3.5 text-slate-400" />
              <span>SQLite</span>
            </div>

            {/* Admin Role Badge */}
            <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-indigo-950/80 text-xs font-medium text-indigo-300 border border-indigo-800/60">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
              <span>Admin / Staff</span>
            </div>

            {/* Total Records Counter */}
            <div className="inline-flex items-center px-2.5 py-1 rounded-md bg-slate-800 text-xs font-medium text-slate-300 border border-slate-700">
              <span className="text-slate-400 mr-1.5">Students:</span>
              <span className="font-bold text-white bg-slate-700 px-1.5 py-0.2 rounded">{totalStudents}</span>
            </div>

            {/* Action Buttons */}
            <button
              id="btn-open-demo-guide"
              onClick={onOpenDemo}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-slate-700 transition-colors shadow-sm cursor-pointer"
              title="View 8-step demonstration workflow"
            >
              <PlayCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>Demo Steps</span>
            </button>

            <button
              id="btn-open-api-tester"
              onClick={onOpenTester}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white transition-colors shadow-sm cursor-pointer"
              title="Open Postman-style API Testing Suite (TC01-TC10)"
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>API Tests</span>
            </button>

            <button
              id="btn-reset-seed-data"
              onClick={onResetData}
              disabled={isResetting}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-xs font-medium text-slate-300 border border-slate-700 transition-colors cursor-pointer"
              title="Reset records to default sample students"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-slate-400 ${isResetting ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Reset Data</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
