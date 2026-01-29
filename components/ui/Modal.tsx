import React, { useEffect, useState } from 'react';
import { X, CheckCircle2, AlertCircle } from 'lucide-react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    message: string;
    type?: 'success' | 'error' | 'info';
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, message, type = 'info' }) => {
    const [show, setShow] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setShow(true);
        } else {
            const timer = setTimeout(() => setShow(false), 300); // Wait for transition
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    if (!show && !isOpen) return null;

    return (
        <div className={`fixed inset-0 z-50 flex items-center justify-center px-4 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm"
                onClick={onClose}
            ></div>

            {/* Modal Content */}
            <div className={`
        relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 transform transition-all duration-300
        ${isOpen ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'}
      `}>
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-stone-400 hover:text-stone-600 transition-colors"
                >
                    <X size={20} />
                </button>

                <div className="flex flex-col items-center text-center">
                    <div className={`
            w-16 h-16 rounded-full flex items-center justify-center mb-4
            ${type === 'success' ? 'bg-green-50 text-green-500' :
                            type === 'error' ? 'bg-rose-50 text-rose-500' : 'bg-blue-50 text-blue-500'}
          `}>
                        {type === 'success' ? <CheckCircle2 size={32} /> :
                            type === 'error' ? <AlertCircle size={32} /> : <AlertCircle size={32} />}
                    </div>

                    <h3 className="font-serif text-2xl text-stone-800 mb-2">{title}</h3>
                    <p className="font-sans text-stone-500 text-sm leading-relaxed mb-6">
                        {message}
                    </p>

                    <button
                        onClick={onClose}
                        className={`
              w-full py-3 rounded-xl font-bold text-sm uppercase tracking-wider transition-all transform active:scale-95
              ${type === 'success' ? 'bg-green-500 hover:bg-green-600 text-white shadow-lg shadow-green-100' :
                                type === 'error' ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-lg shadow-rose-100' :
                                    'bg-stone-800 hover:bg-stone-900 text-white shadow-lg shadow-stone-200'}
            `}
                    >
                        Okay
                    </button>
                </div>
            </div>
        </div>
    );
};
