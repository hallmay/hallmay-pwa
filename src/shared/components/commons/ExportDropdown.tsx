import { Download, FileSpreadsheet, FileText } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import Button from "./Button"

const ExportDropdown = ({ onExport }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!isOpen) return;

        const handleClickOutside = (event: MouseEvent | TouchEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        const timerId = setTimeout(() => {
            document.addEventListener('mousedown', handleClickOutside);
            document.addEventListener('touchstart', handleClickOutside);
        }, 0);

        return () => {
            clearTimeout(timerId);
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('touchstart', handleClickOutside);
        };
    }, [isOpen]);

    return (
        <div ref={dropdownRef} className="relative">
            {/* Botón principal que abre el dropdown */}
            <Button onClick={() => setIsOpen(!isOpen)} variant="primary" icon={Download} className="lg:px-6 lg:py-3 lg:text-base">
                Exportar
            </Button>

            {/* Menú dropdown condicional */}
            {isOpen && (
                <div className="absolute right-0 top-14 bg-white border border-gray-200 rounded-lg shadow-lg py-1 w-64 z-50 animate-fade-in-fast">
                    <button
                        onClick={() => onExport('xlsx')}
                        className="w-full flex items-center space-x-3 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900 rounded-md transition-all duration-150"
                    >
                        <FileSpreadsheet size={16} className="text-gray-500" />
                        <span>Exportar a Excel (.xlsx)</span>
                    </button>
                    <button
                        onClick={() => onExport('csv')}
                        className="w-full flex items-center space-x-3 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900 rounded-md transition-all duration-150"
                    >
                        <FileText size={16} className="text-gray-500" />
                        <span>Exportar a CSV (.csv)</span>
                    </button>
                </div>
            )}
        </div>
    );
};

export default ExportDropdown;