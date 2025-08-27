import { X } from "lucide-react";
import Button from "./Button";
import { useEffect } from "react";

interface ModalProps {
    children: React.ReactNode;
    isOpen: boolean;
    onClose: () => void;
    title: string;
}


export const Modal: React.FC<ModalProps> = ({ children, isOpen, onClose, title }) => {
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); };
        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'hidden';
        }
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'auto';
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[99] flex justify-center items-center p-4 animate-fade-in"
            onClick={onClose} role="dialog" aria-modal="true" >
            <div
                className="bg-surface rounded-2xl shadow-2xl p-6 w-full max-w-lg transform transition-all duration-300 animate-slide-up"
                onClick={e => e.stopPropagation()} >
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-text-primary">{title}</h2>
                    <Button variant="ghost" onClick={onClose} aria-label="Cerrar modal" className="-mr-2 -mt-2">
                        <X size={24} />
                    </Button>
                </div>
                {children}
            </div>
        </div>
    );
};

export default Modal;