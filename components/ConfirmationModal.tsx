
import React, { useEffect, useState } from 'react';
import { SpinnerIcon } from './icons';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
  title: string;
  message: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
}) => {
  const [isConfirming, setIsConfirming] = useState(false);
  
  useEffect(() => {
    if (isOpen) {
      setIsConfirming(false);
    }
    
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isConfirming) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen, onClose, isConfirming]);

  if (!isOpen) return null;

  const handleConfirmClick = async () => {
    setIsConfirming(true);
    await onConfirm();
    // Parent component is responsible for closing the modal, which will reset state.
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center"
      onClick={!isConfirming ? onClose : undefined}
      aria-modal="true"
      role="dialog"
    >
      <div
        className="bg-slate-800 rounded-lg shadow-xl p-6 w-full max-w-md m-4 border border-slate-700"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-semibold text-white mb-4">{title}</h2>
        <p className="text-slate-300 mb-6">{message}</p>
        <div className="flex justify-end space-x-4">
          <button
            onClick={onClose}
            disabled={isConfirming}
            className="px-4 py-2 rounded-md bg-slate-600 text-white hover:bg-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:ring-offset-slate-800 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirmClick}
            disabled={isConfirming}
            className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-slate-800 w-24 h-10 flex justify-center items-center disabled:bg-red-800 disabled:cursor-wait"
          >
            {isConfirming ? <SpinnerIcon className="h-5 w-5 animate-spin" /> : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
