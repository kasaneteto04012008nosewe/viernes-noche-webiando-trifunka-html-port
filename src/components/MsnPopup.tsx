import React from 'react';
import { X } from 'lucide-react';

interface MsnPopupProps {
  onClose?: () => void;
}

export const MsnPopup: React.FC<MsnPopupProps> = ({ onClose }) => {
  return (
    <div className="fixed bottom-6 right-6 z-50 animate-bounce-in transition-all transform duration-300 hover:scale-105">
      <div className="relative bg-slate-900/90 p-1.5 rounded-lg border-2 border-blue-400/80 shadow-[0_0_25px_rgba(59,130,246,0.6)] backdrop-blur-md">
        {onClose && (
          <button
            onClick={onClose}
            className="absolute -top-3 -right-3 bg-red-600 hover:bg-red-500 text-white rounded-full p-1 border-2 border-white shadow-md transition-transform hover:scale-110"
            title="Cerrar notificación"
          >
            <X className="w-4 h-4" />
          </button>
        )}
        <div className="relative overflow-hidden rounded">
          <img
            src="/assets/aistudio/popup_42b64190.png"
            alt="solayer dice: ZUMBAO"
            className="w-[260px] md:w-[320px] h-auto object-contain block shadow-inner"
          />
        </div>
      </div>
    </div>
  );
};
