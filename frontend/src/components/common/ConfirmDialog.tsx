import React, { useEffect, useRef } from 'react';
import { AlertTriangle, X } from 'lucide-react';

export interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  confirmLabel?: string;
  cancelText?: string;
  isDangerous?: boolean;
  isDestructive?: boolean;
  children?: React.ReactNode;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  confirmLabel,
  cancelText = 'Cancel',
  isDangerous = false,
  isDestructive = false,
  children,
  onConfirm,
  onCancel,
}) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  const confirmBtnRef = useRef<HTMLButtonElement>(null);

  const isHazard = isDangerous || isDestructive;
  const finalConfirmText = confirmLabel || confirmText;

  useEffect(() => {
    if (isOpen) {
      confirmBtnRef.current?.focus();
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onCancel();
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true" aria-labelledby="dialog-title">
      <div className="fixed inset-0 bg-black/50 transition-opacity" onClick={onCancel} />

      <div className="flex min-h-full items-end sm:items-center justify-center p-4 text-center sm:p-0">
        <div
          ref={dialogRef}
          className="relative transform overflow-hidden rounded-2xl bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg p-6 border border-gray-100"
        >
          <div className="flex items-start gap-4">
            <div
              className={`mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full sm:mx-0 sm:h-10 sm:w-10 ${
                isHazard ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
              }`}
            >
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div className="mt-0 text-left flex-1">
              <h3 className="text-base font-semibold leading-6 text-gray-900" id="dialog-title">
                {title}
              </h3>
              <div className="mt-2">
                <p className="text-sm text-gray-500">{message}</p>
              </div>
              {children && <div className="mt-4">{children}</div>}
            </div>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-500 p-1 rounded-md"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="mt-6 sm:flex sm:flex-row-reverse sm:gap-3">
            <button
              ref={confirmBtnRef}
              type="button"
              onClick={onConfirm}
              className={`inline-flex w-full justify-center rounded-lg px-4 py-2.5 text-sm font-semibold text-white shadow-sm sm:w-auto ${
                isHazard
                  ? 'bg-red-600 hover:bg-red-500 focus-visible:outline-red-600'
                  : 'bg-green-600 hover:bg-green-500 focus-visible:outline-green-600'
              }`}
            >
              {finalConfirmText}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="mt-3 inline-flex w-full justify-center rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
            >
              {cancelText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
