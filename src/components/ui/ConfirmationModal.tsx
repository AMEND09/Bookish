import React from 'react';
import { AlertTriangle, CheckCircle, Info, X } from 'lucide-react';

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
  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'alert':
        return <AlertTriangle className="w-6 h-6 text-red-500" />;
      case 'success':
        return <CheckCircle className="w-6 h-6 text-green-500" />;
      case 'info':
        return <Info className="w-6 h-6 text-blue-500" />;
      default:
        return <AlertTriangle className="w-6 h-6 text-[#D2691E]" />;
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
      <div className="bg-white rounded-xl shadow-xl max-w-sm w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#F0EDE8]">
          <div className="flex items-center gap-3">
            {getIcon()}
            <h3 className="font-serif text-lg font-medium text-[#3A3A3A]">{title}</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#F0EDE8] transition-colors"
          >
            <X className="w-5 h-5 text-[#8B7355]" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          <p className="text-sm text-[#3A3A3A] leading-relaxed">{message}</p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 p-4 pt-0">
          {type === 'confirm' && (
            <>
              <button
                onClick={onClose}
                className="flex-1 py-2 px-4 bg-white border border-[#E8E3DD] text-[#8B7355] rounded-lg font-medium text-sm hover:bg-[#F7F5F3] transition-colors"
              >
                {cancelText}
              </button>
              <button
                onClick={handleConfirm}
                className="flex-1 py-2 px-4 bg-[#D2691E] text-white rounded-lg font-medium text-sm hover:bg-[#B8541A] transition-colors"
              >
                {confirmText}
              </button>
            </>
          )}
          
          {(type === 'alert' || type === 'success' || type === 'info') && (
            <button
              onClick={onClose}
              className="w-full py-2 px-4 bg-[#8B7355] text-white rounded-lg font-medium text-sm hover:bg-[#7A6349] transition-colors"
            >
              OK
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;