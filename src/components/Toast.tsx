import React from 'react';

export interface ToastData {
  id: string;
  message: string;
  icon?: string;
  type?: 'success' | 'error' | 'info';
}

interface ToastProps {
  toasts: ToastData[];
  onDismiss: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto bg-[#26364a] border border-[#464554] text-[#d3e4fe] px-4 py-2.5 rounded-lg shadow-2xl flex items-center gap-2.5 transition-all transform translate-y-0 opacity-100 max-w-md animate-in fade-in slide-in-from-bottom-2 duration-200"
        >
          <span className="material-symbols-outlined text-[#4edea3] text-lg">
            {toast.icon || 'check_circle'}
          </span>
          <span className="text-xs sm:text-sm font-medium">{toast.message}</span>
          <button
            onClick={() => onDismiss(toast.id)}
            className="ml-auto text-[#908fa0] hover:text-[#d3e4fe] p-0.5"
          >
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        </div>
      ))}
    </div>
  );
};
