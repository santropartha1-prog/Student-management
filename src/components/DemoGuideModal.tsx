import React from 'react';
import { X, CheckCircle2, Play, ArrowRight, ShieldCheck, Database, Layout, UserPlus, Edit, Trash2 } from 'lucide-react';

interface DemoGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPopulateSample: () => void;
}

export const DemoGuideModal: React.FC<DemoGuideModalProps> = ({
  isOpen,
  onClose,
  onPopulateSample,
}) => {
  if (!isOpen) return null;

  const steps = [
    {
      num: 'Step 1',
      title: 'Backend REST API Server Running',
      description: 'SQLite database db.sqlite3 initialized with table schema & REST API listening on /api/students/.',
      icon: Database,
      completed: true,
    },
    {
      num: 'Step 2',
      title: 'React Frontend Running',
      description: 'Vite SPA served with Tailwind CSS, reactive state, and client-side form validation.',
      icon: Layout,
      completed: true,
    },
    {
      num: 'Step 3',
      title: 'Open Student Management System',
      description: 'The administrator web interface is active in the current viewport with instant live data.',
      icon: ShieldCheck,
      completed: true,
    },
    {
      num: 'Step 4',
      title: 'Add a New Student',
      description: 'Fill in Name, Email, Phone, Age, Course and click [Add Student].',
      icon: UserPlus,
      action: 'Click below to pre-fill a sample student into the form',
    },
    {
      num: 'Step 5',
      title: 'Verify Student Appears in List',
      description: 'The newly added record appears in the table with its unique auto-incremented SQLite ID.',
      icon: CheckCircle2,
    },
    {
      num: 'Step 6',
      title: 'Edit Student Information',
      description: 'Click the Edit icon on a student row. The form populates into [Update Student] mode.',
      icon: Edit,
    },
    {
      num: 'Step 7',
      title: 'Show Updated Information',
      description: 'Change the course (e.g., from BCA to MCA) and click [Update Student]. The table updates immediately.',
      icon: CheckCircle2,
    },
    {
      num: 'Step 8',
      title: 'Delete the Student',
      description: 'Click the Delete icon on a row. Confirm deletion in the modal dialog to remove from SQLite.',
      icon: Trash2,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
      <div
        id="demo-guide-modal"
        className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
              <Play className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold">Demonstration Procedure</h3>
              <p className="text-xs text-slate-400">8-Step Demonstration Workflow (SOP Section 25)</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Steps List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3.5">
          <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-lg text-xs text-indigo-900">
            <p className="font-semibold">Evaluator / Demonstration Guide</p>
            <p className="mt-0.5">
              Follow these sequential steps to demonstrate end-to-end full-stack CRUD capabilities between React, Django REST endpoints, and SQLite.
            </p>
          </div>

          <div className="space-y-2.5">
            {steps.map((step, idx) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.num}
                  className="p-3.5 rounded-lg border border-slate-200 bg-white flex items-start gap-3.5 hover:border-slate-300 transition-colors"
                >
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5 ${
                      step.completed
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-indigo-100 text-indigo-700'
                    }`}
                  >
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-slate-900">{step.title}</h4>
                      {step.completed && (
                        <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Active
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5">{step.description}</p>
                    {step.action && (
                      <button
                        type="button"
                        onClick={() => {
                          onPopulateSample();
                          onClose();
                        }}
                        className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold border border-indigo-200 transition-colors cursor-pointer"
                      >
                        <span>Pre-fill Sample Student Now</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};
