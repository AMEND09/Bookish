import React from 'react';
import { AlertTriangle, CheckCircle, Info, X } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  title: string;
  message: string;
  type?: 'confirm' | 'alert' | 'success' | 'info';
  confirmText?: string;
  cancelText?: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  type = 'confirm',
  confirmText = 'Confirm',
  cancelText = 'Cancel'
}) => {
  const { theme } = useTheme();
  
  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'alert':
        return <AlertTriangle className="w-8 h-8 text-red-500" />;
      case 'success':
        return <CheckCircle className="w-8 h-8 text-green-500" />;
      case 'info':
        return <Info className="w-8 h-8 text-blue-500" />;      default:
        return <AlertTriangle className="w-8 h-8" style={{ color: theme.colors.primary }} />;
    }
  };

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="rounded-xl shadow-xl w-full max-w-sm mx-auto" style={{ backgroundColor: theme.colors.surface }}>
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center gap-3 mb-4">
            {getIcon()}
            <div className="flex-1">
              <h3 className="font-serif text-lg font-medium" style={{ color: theme.colors.textPrimary }}>{title}</h3>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full transition-colors hover:opacity-80"
              style={{ backgroundColor: theme.colors.borderLight, color: theme.colors.textSecondary }}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Message */}
          <p className="text-sm leading-relaxed mb-6" style={{ color: theme.colors.textPrimary }}>
            {message}
          </p>

          {/* Actions */}
          <div className="flex gap-3">
            {type === 'confirm' && (
              <button
                onClick={onClose}
                className="flex-1 py-3 px-4 rounded-lg font-medium text-sm transition-colors hover:opacity-80"
                style={{ 
                  backgroundColor: theme.colors.borderLight,
                  color: theme.colors.textSecondary
                }}
              >
                {cancelText}
              </button>
            )}
            
            <button
              onClick={handleConfirm}
              className={`flex-1 py-3 px-4 rounded-lg font-medium text-sm transition-colors ${
                type === 'success' 
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : type === 'alert'
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'text-white hover:opacity-80'
              }`}
              style={type === 'confirm' ? { backgroundColor: theme.colors.primary } : {}}
            >
              {type === 'confirm' ? confirmText : 'OK'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;