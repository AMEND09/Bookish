import { useState } from 'react';

interface ModalConfig {
  title: string;
  message: string;
  type?: 'confirm' | 'alert' | 'success' | 'info';
  confirmText?: string;
  cancelText?: string;
}

export const useConfirmationModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState<ModalConfig>({
    title: '',
    message: ''
  });
  const [onConfirmCallback, setOnConfirmCallback] = useState<(() => void) | null>(null);

  const showConfirm = (
    title: string,
    message: string,
    onConfirm: () => void,
    options?: {
      confirmText?: string;
      cancelText?: string;
    }
  ) => {
    setConfig({
      title,
      message,
      type: 'confirm',
      confirmText: options?.confirmText,
      cancelText: options?.cancelText
    });
    setOnConfirmCallback(() => onConfirm);
    setIsOpen(true);
  };

  const showAlert = (
    title: string,
    message: string,
    type: 'alert' | 'success' | 'info' = 'info'
  ) => {
    setConfig({
      title,
      message,
      type
    });
    setOnConfirmCallback(null);
    setIsOpen(true);
  };

  const close = () => {
    setIsOpen(false);
    setOnConfirmCallback(null);
  };

  return {
    isOpen,
    config,
    onConfirm: onConfirmCallback,
    close,
    showConfirm,
    showAlert
  };
};