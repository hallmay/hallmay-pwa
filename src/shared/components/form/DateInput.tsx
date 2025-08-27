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
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Cierra el calendario al hacer clic fuera
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        if (isOpen) document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isOpen]);

    const handleSelect = (selectedDate?: Date) => {
        onChange(selectedDate);
        setIsOpen(false);
    };

    const handleToggle = () => {
        if (!disabled) setIsOpen(!isOpen);
    };

    // Formato de fecha simple como pediste
    const displayValue = value
        ? format(value, "dd/MM/yyyy")
        : "Seleccionar fecha...";

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
                >
                    <span className={`block truncate ${value ? 'text-gray-900' : 'text-gray-400'}`}>
                        {displayValue}
                    </span>
                    <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5">
                        <CalendarIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                    </span>
                </button>
                {isOpen && (
                    <div className="absolute z-10 mt-1 w-auto bg-white shadow-lg rounded-xl animate-fade-in-fast border border-gray-200">
                        <DayPicker
                            mode="single"
                            selected={value}
                            onSelect={handleSelect}
                            locale={es}
                            captionLayout="dropdown" // El mejor layout para seleccionar año/mes
                            fromYear={2020}
                            toYear={2030}
                        />
                    </div>
                )}
            </div>
            {error && <p className="text-red-500 text-xs mt-1.5">{error}</p>}
        </div>
    );
};

export default DateInput;