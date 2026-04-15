"use client"
import React from 'react';
import { CheckCircle2, XCircle, AlertTriangle, HelpCircle } from 'lucide-react';

export type NotificationType = 'success' | 'error' | 'warning' | 'confirm';

interface NotificationModalProps {
    isOpen: boolean;
    type: NotificationType;
    title: string;
    message: string;
    onClose: () => void;
    onConfirm?: () => void;
}

export function NotificationModal({ isOpen, type, title, message, onClose, onConfirm }: NotificationModalProps) {
    if (!isOpen) return null;

    const icons = {
        success: <CheckCircle2 className="text-green-500" size={48} />,
        error: <XCircle className="text-red-500" size={48} />,
        warning: <AlertTriangle className="text-amber-500" size={48} />,
        confirm: <HelpCircle className="text-blue-500" size={48} />
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={type !== 'confirm' ? onClose : undefined} />

            <div className="bg-white w-full max-w-sm rounded-[2.5rem] shadow-2xl relative z-10 overflow-hidden transform animate-in zoom-in-95 duration-200 p-8 flex flex-col items-center text-center">
                <div className="mb-6 transform animate-bounce-short">
                    {icons[type]}
                </div>

                <h3 className="font-display text-2xl font-bold mb-2 tracking-tight text-on-surface">
                    {title}
                </h3>

                <p className="text-on-surface-variant font-medium opacity-70 mb-8 leading-relaxed">
                    {message}
                </p>

                <div className="flex gap-3 w-full mt-auto">
                    {type === 'confirm' ? (
                        <>
                            <button
                                onClick={onClose}
                                className="flex-1 py-4 font-bold rounded-2xl border border-ghost hover:bg-black/5 active:scale-95 transition-all text-sm md:text-base"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={() => { onConfirm?.(); onClose(); }}
                                className="flex-1 py-4 font-bold rounded-2xl btn-primary shadow-lg shadow-primary/20 active:scale-95 transition-all text-sm md:text-base"
                            >
                                Confirmar
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={onClose}
                            className="w-full py-4 font-bold rounded-2xl btn-primary shadow-lg shadow-primary/20 active:scale-95 transition-all"
                        >
                            Entendido
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
