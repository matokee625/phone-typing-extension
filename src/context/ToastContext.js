'use client';

import { createContext, useContext, useState, useCallback } from 'react';
import { FiCheckCircle, FiAlertCircle, FiInfo, FiX } from 'react-icons/fi';

const ToastContext = createContext();

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'success', duration = 3500) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 5);
    setToasts((prev) => [...prev, { id, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      {/* Toast Container */}
      <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2 max-w-sm w-full px-4 pointer-events-none">
        {toasts.map((toast) => {
          const isSuccess = toast.type === 'success';
          const isError = toast.type === 'error';
          const isInfo = toast.type === 'info';

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-center justify-between gap-3 p-4 rounded-xl shadow-lg border text-sm font-medium transition-all transform animate-in slide-in-from-bottom-3 duration-200 ${
                isSuccess
                  ? 'bg-[#E31E24] text-white border-[#c41a1f]'
                  : isError
                  ? 'bg-rose-700 text-white border-rose-600'
                  : 'bg-gray-900 text-white border-gray-800'
              }`}
            >
              <div className="flex items-center gap-3">
                {isSuccess && <FiCheckCircle className="w-5 h-5 text-amber-300 flex-shrink-0" />}
                {isError && <FiAlertCircle className="w-5 h-5 text-rose-300 flex-shrink-0" />}
                {isInfo && <FiInfo className="w-5 h-5 text-blue-300 flex-shrink-0" />}
                <span>{toast.message}</span>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-white/80 hover:text-white p-1"
                aria-label="Dismiss toast"
              >
                <FiX className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

