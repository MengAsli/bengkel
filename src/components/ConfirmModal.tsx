import React from "react";
import { AlertTriangle, HelpCircle } from "lucide-react";

interface ConfirmModalProps {
  isOpen: boolean;
  title?: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "info";
}

export default function ConfirmModal({
  isOpen,
  title = "Konfirmasi",
  message,
  onConfirm,
  onCancel,
  confirmText = "Ya, Lanjutkan",
  cancelText = "Batal",
  variant = "danger"
}: ConfirmModalProps) {
  if (!isOpen) return null;

  const getThemeClass = () => {
    switch (variant) {
      case "danger":
        return {
          bg: "bg-rose-50 text-rose-600",
          btn: "bg-rose-600 hover:bg-rose-700 shadow-rose-100 text-white"
        };
      case "warning":
        return {
          bg: "bg-amber-50 text-amber-600",
          btn: "bg-amber-600 hover:bg-amber-700 shadow-amber-100 text-white"
        };
      case "info":
        default:
          return {
            bg: "bg-blue-50 text-blue-600",
            btn: "bg-teal-600 hover:bg-teal-700 shadow-teal-100 text-white"
          };
    }
  };

  const theme = getThemeClass();

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl border border-slate-100 p-6 max-w-md w-full shadow-2xl space-y-4">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl ${theme.bg}`}>
            {variant === "danger" ? <AlertTriangle className="w-5 h-5" /> : <HelpCircle className="w-5 h-5" />}
          </div>
          <h3 className="text-lg font-bold font-display text-slate-800">{title}</h3>
        </div>
        
        <p className="text-slate-600 text-sm leading-relaxed">{message}</p>
        
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-semibold text-slate-500 hover:text-slate-705 bg-slate-50 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onCancel();
            }}
            className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all cursor-pointer shadow-sm ${theme.btn}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
