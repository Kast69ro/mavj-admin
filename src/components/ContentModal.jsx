import React from 'react';
import { X, AlertTriangle } from 'lucide-react';

const SIZES = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-lg' };

const ContentModal = ({ title, onClose, children, size = 'md' }) => (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onMouseDown={onClose}>
    <div
      className={`bg-white rounded-xl shadow-xl w-full ${SIZES[size]} max-h-[90vh] overflow-y-auto`}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <h3 className="font-semibold text-lg">{title}</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <X size={20} />
        </button>
      </div>
      <div className="p-5">{children}</div>
    </div>
  </div>
);

export const ErrorBox = ({ children }) =>
  children ? (
    <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3">{children}</div>
  ) : null;

export const ConfirmModal = ({ title, message, confirmLabel = 'Удалить', loading, error, onConfirm, onClose }) => (
  <ContentModal title={title} onClose={onClose} size="sm">
    <div className="space-y-4">
      <div className="flex gap-3">
        <div className="w-10 h-10 shrink-0 rounded-lg bg-red-50 flex items-center justify-center">
          <AlertTriangle size={20} className="text-red-600" />
        </div>
        <p className="text-sm text-gray-600">{message}</p>
      </div>
      <ErrorBox>{error}</ErrorBox>
      <div className="flex gap-2">
        <button
          onClick={onClose}
          className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium"
        >
          Отмена
        </button>
        <button
          onClick={onConfirm}
          disabled={loading}
          className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium disabled:opacity-50"
        >
          {loading ? 'Удаление…' : confirmLabel}
        </button>
      </div>
    </div>
  </ContentModal>
);

export const inputClass =
  'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent';

export const Field = ({ label, hint, children }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    {children}
    {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
  </div>
);

export default ContentModal;
