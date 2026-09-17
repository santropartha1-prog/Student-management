import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import { Student } from '../types';

interface DeleteConfirmModalProps {
  student: Student | null;
  isOpen: boolean;
  isDeleting: boolean;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  student,
  isOpen,
  isDeleting,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen || !student) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div
        id="delete-confirmation-dialog"
        className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150"
      >
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="space-y-2 flex-1">
              <h3 className="text-base font-bold text-slate-900">
                Confirm Record Deletion
              </h3>
              <p className="text-sm text-slate-600">
                Are you sure you want to delete this student?
              </p>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1">
                <p>
                  <span className="font-semibold text-slate-700">ID:</span> #{student.id}
                </p>
                <p>
                  <span className="font-semibold text-slate-700">Name:</span> {student.name}
                </p>
                <p>
                  <span className="font-semibold text-slate-700">Email:</span> {student.email}
                </p>
                <p>
                  <span className="font-semibold text-slate-700">Course:</span> {student.course}
                </p>
              </div>
              <p className="text-xs text-rose-600 font-medium">
                This action will permanently remove the record from SQLite database.
              </p>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              id="btn-cancel-delete"
              onClick={onCancel}
              disabled={isDeleting}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              id="btn-confirm-delete"
              onClick={onConfirm}
              disabled={isDeleting}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              {isDeleting ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Deleting...</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
