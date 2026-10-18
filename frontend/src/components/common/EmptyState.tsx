import React from 'react';
import { LucideIcon, Search } from 'lucide-react';

export interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  message?: string;
  actionText?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = Search,
  title,
  description,
  message,
  actionText,
  actionLabel,
  onAction,
}) => {
  const displayDesc = description || message || '';
  const displayBtnLabel = actionLabel || actionText;

  return (
    <div className="text-center py-12 px-4 bg-white border border-dashed border-gray-300 rounded-xl max-w-lg mx-auto my-8">
      <div className="w-12 h-12 bg-gray-100 text-gray-500 rounded-full flex items-center justify-center mx-auto mb-4">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-1">{title}</h3>
      {displayDesc && <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">{displayDesc}</p>}
      {displayBtnLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none transition-colors"
        >
          {displayBtnLabel}
        </button>
      )}
    </div>
  );
};
