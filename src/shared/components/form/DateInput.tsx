import { useState, useRef, useEffect, type FC } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css"; // Estilos base del calendario
import { Calendar as CalendarIcon } from "lucide-react";

// Estilos personalizados para un look más profesional y oscuro, como pediste.
const css = `
  .rdp-root {
    --rdp-cell-size: 40px;
    --rdp-accent-color: #2A6449; /* Tu color primario oscuro para la selección */
    --rdp-background-color: #f0f0f0; /* Un gris claro para el hover */
    --rdp-outline: 2px solid var(--rdp-accent-color);
    margin: 1em;
  }
  /* Estilo para los menús de mes y año */
  .rdp-caption_dropdowns {
    background-color: #1f2937; /* Fondo oscuro */
    color: white;
    padding: 8px;
    border-radius: 8px;
  }
  .rdp-vhidden { /* Oculta labels innecesarios en los dropdowns */
    display: none;
  }
  .rdp-caption_label {
    font-weight: 700;
    color: #1f2937; /* Texto oscuro para el título */
  }
  .rdp-head_cell {
    font-weight: 600;
    font-size: 0.8rem;
    color: #4b5563; /* Gris oscuro para los días de la semana */
  }
  .rdp-day_selected {
    background-color: var(--rdp-accent-color);
    color: white;
    font-weight: 700;
  }
  .rdp-button:hover:not([disabled]):not(.rdp-day_selected) {
    background-color: var(--rdp-background-color);
  }
  /* Estilo para las flechas de navegación */
  .rdp-nav_button {
      color: #111827; /* Flechas negras */
  }
`;

interface DateInputProps {
    label?: string;
    name: string;
    error?: string;
    value?: Date | null;
    onChange: (date?: Date) => void;
    disabled?: boolean;
    className?: string;
    required?: boolean;
    minDate?: Date; // fechas anteriores se bloquean
    maxDate?: Date; // fechas posteriores se bloquean
}

export const DateInput: FC<DateInputProps> = ({
    label,
    name,
    error,
    className = '',
    value,
    onChange,
    disabled = false,
    required = false,
    minDate,
    maxDate,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const popupRef = useRef<HTMLDivElement>(null);
    const [popupStyle, setPopupStyle] = useState<React.CSSProperties | undefined>();
    const [isMobile, setIsMobile] = useState(false);

    // Cierra el calendario al hacer clic fuera
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setIsOpen(false);
                buttonRef.current?.focus();
            }
        };
        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
            document.addEventListener('keydown', handleKey);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener('keydown', handleKey);
        };
    }, [isOpen]);

    // Track viewport width for mobile behavior
    useEffect(() => {
        const compute = () => setIsMobile(window.innerWidth < 500);
        compute();
        window.addEventListener('resize', compute);
        return () => window.removeEventListener('resize', compute);
    }, []);

    // Position popup to avoid overflow (desktop)
    useEffect(() => {
        if (!isOpen || isMobile) return;
        const btn = buttonRef.current;
        if (!btn) return;
        const rect = btn.getBoundingClientRect();
        const calendarWidth = 320; // approximate calendar width
        const spaceBelow = window.innerHeight - rect.bottom;
        const openUpwards = spaceBelow < 340; // not enough space below
        const left = Math.min(rect.left, window.innerWidth - calendarWidth - 8);
        setPopupStyle({
            position: 'fixed',
            top: openUpwards ? rect.top - 340 : rect.bottom + 4,
            left,
        });
    }, [isOpen, isMobile]);

    const handleSelect = (selectedDate?: Date) => {
        if (selectedDate && minDate && selectedDate < minDate) {
            return; // invalid
        }
        if (selectedDate && maxDate && selectedDate > maxDate) {
            return; // ignorar selección inválida
        }
        onChange(selectedDate);
        setIsOpen(false);
    };

    // Limpiar si el valor actual queda inválido al cambiar minDate o maxDate externamente
    useEffect(() => {
        if (value && minDate && value < minDate) {
            onChange(undefined);
        }
        if (value && maxDate && value > maxDate) {
            onChange(undefined);
        }
    }, [minDate, maxDate]);

    const handleToggle = () => {
        if (disabled) return;
        if (!isOpen) {
            // Pre-calculate position to avoid flash
            const btn = buttonRef.current;
            if (btn) {
                const rect = btn.getBoundingClientRect();
                const calendarWidth = 320;
                const spaceBelow = window.innerHeight - rect.bottom;
                const openUpwards = spaceBelow < 340;
                const left = Math.min(rect.left, window.innerWidth - calendarWidth - 8);
                if (!isMobile) {
                    setPopupStyle({
                        position: 'fixed',
                        top: openUpwards ? rect.top - 340 : rect.bottom + 4,
                        left,
                        visibility: 'visible'
                    });
                }
            }
            setIsOpen(true);
        } else {
            setIsOpen(false);
        }
    };

    // Formato de fecha simple como pediste
    const displayValue = value
        ? format(value, "dd/MM/yyyy")
        : "Seleccionar fecha...";

    const disabledDaysArray = [
        ...(minDate ? [{ before: minDate }] : []),
        ...(maxDate ? [{ after: maxDate }] : []),
    ];

    return (
        <div className={`w-full ${className}`} ref={dropdownRef}>
            <style>{css}</style>
            {label && (
                <label htmlFor={name} className="block text-sm font-medium text-gray-600 mb-1.5">
                    {label} {required && <span className="text-red-500">*</span>}
                </label>
            )}
            <div className="relative">
                <button
                    type="button"
                    id={name}
                    onClick={handleToggle}
                    className={`w-full p-3 pr-10 text-left border ${error ? 'border-red-400' : 'border-gray-300'} 
                    ${disabled ? 'bg-gray-200 cursor-not-allowed' : 'bg-gray-50'} 
                    rounded-xl shadow-sm focus:outline-none focus:ring-2 ${error ? 'focus:ring-red-500' : 'focus:ring-primary-darker'}`}
                    aria-expanded={isOpen}
                    disabled={disabled}
                    ref={buttonRef}
                >
                    <span className={`block truncate ${value ? 'text-gray-900' : 'text-gray-400'}`}>
                        {displayValue}
                    </span>
                    <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5">
                        <CalendarIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                    </span>
                </button>
                {isOpen && (
                    isMobile ? (
                        <div
                            ref={popupRef}
                            className="fixed inset-x-0 bottom-0 z-50 bg-white border-t border-gray-200 shadow-xl rounded-t-2xl p-2 pt-3 animate-slide-up"
                            style={{ maxHeight: '70vh' }}
                            role="dialog"
                            aria-modal="true"
                        >
                            <div className="flex items-center justify-between px-4 mb-2">
                                <span className="text-sm font-medium text-gray-700">Seleccionar fecha</span>
                                <button
                                    type="button"
                                    onClick={() => { setIsOpen(false); buttonRef.current?.focus(); }}
                                    className="text-xs px-2 py-1 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-600"
                                >Cerrar</button>
                            </div>
                            <div className="overflow-auto">
                                <DayPicker
                                    mode="single"
                                    selected={value || undefined}
                                    onSelect={handleSelect}
                                    locale={es}
                                    captionLayout="dropdown"
                                    fromYear={2020}
                                    toYear={2030}
                                    disabled={disabledDaysArray.length ? disabledDaysArray : undefined}
                                />
                            </div>
                        </div>
                    ) : (
                        <div
                            ref={popupRef}
                            className="z-50 bg-white shadow-lg rounded-xl animate-fade-in-fast border border-gray-200"
                            style={popupStyle}
                        >
                            <DayPicker
                                mode="single"
                                selected={value || undefined}
                                onSelect={handleSelect}
                                locale={es}
                                captionLayout="dropdown"
                                fromYear={2020}
                                toYear={2030}
                                disabled={disabledDaysArray.length ? disabledDaysArray : undefined}
                            />
                        </div>
                    )
                )}
            </div>
            {error && <p className="text-red-500 text-xs mt-1.5">{error}</p>}
        </div>
    );
};

export default DateInput;