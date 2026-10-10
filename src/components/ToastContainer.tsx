import React from 'react';
import { useApp } from '../context/AppContext';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, dismissToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-3">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-start gap-2.5 p-3.5 rounded-xl shadow-lg border backdrop-blur-md transition-all duration-300 animate-in slide-in-from-top-2 ${
            toast.type === 'success'
              ? 'bg-[#1e5e3a] text-white border-[#86f8c2]/40'
              : toast.type === 'error'
              ? 'bg-[#ba1a1a] text-white border-red-300/40'
              : toast.type === 'warning'
              ? 'bg-[#844000] text-white border-[#ffdcc6]/40'
              : 'bg-[#161d18] text-white border-gray-600/40'
          }`}
        >
          <div className="flex-shrink-0 mt-0.5">
            {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-[#86f8c2]" />}
            {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-red-200" />}
            {toast.type === 'warning' && <AlertTriangle className="w-5 h-5 text-[#ffdcc6]" />}
            {toast.type === 'info' && <Info className="w-5 h-5 text-emerald-200" />}
          </div>
          <div className="flex-1 min-w-0 text-sm font-medium leading-snug">
            {toast.message}
          </div>
          <button
            onClick={() => dismissToast(toast.id)}
            className="flex-shrink-0 text-white/80 hover:text-white p-0.5"
            aria-label="Dismiss toast"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};
