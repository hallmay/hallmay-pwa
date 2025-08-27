// src/components/commons/form/Select.tsx - Versión Mejorada
import { ChevronDown, Check } from "lucide-react";
import { type FC, useState, useRef, useEffect, useMemo } from "react";

// Interfaz más flexible para las opciones
export type SelectOption = {
    id?: string | number;
    value?: string | number;
    name?: string;
    label?: string;
    disabled?: boolean;
    group?: string;
};

interface SelectProps {
    label?: string;
    name: string;
    items: SelectOption[];
    error?: string;
    placeholder?: string;
    value?: string | number;
    onChange: (value: string | number) => void;
    disabled?: boolean;
    className?: string;
    required?: boolean;
    searchable?: boolean;
    clearable?: boolean;
    loading?: boolean;
    emptyMessage?: string;
}

export const Select: FC<SelectProps> = ({
    label,
    name,
    items,
    error,
    className = '',
    placeholder = 'Seleccionar...',
    value,
    onChange,
    disabled = false,
    required = false,
    searchable = false,
    clearable = false,
    loading = false,
    emptyMessage = 'No hay opciones disponibles'
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const dropdownRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);

    // Normalizar el valor de cada item
    const normalizedItems = useMemo(() =>
        items.map(item => ({
            ...item,
            value: item.id ?? item.value ?? '',
            label: item.name ?? item.label ?? '',
        })),
        [items]
    );

    // Filtrar items si es searchable
    const filteredItems = useMemo(() => {
        if (!searchable || !searchTerm) return normalizedItems;

        return normalizedItems.filter(item =>
            item.label.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [normalizedItems, searchTerm, searchable]);

    // Groupear items si tienen propiedad group
    const groupedItems = useMemo(() => {
        const groups: Record<string, SelectOption[]> = {};
        const ungrouped: SelectOption[] = [];

        filteredItems.forEach(item => {
            if (item.group) {
                if (!groups[item.group]) groups[item.group] = [];
                groups[item.group].push(item);
            } else {
                ungrouped.push(item);
            }
        });

        return { groups, ungrouped };
    }, [filteredItems]);

    const selectedItem = normalizedItems.find(item => item.value === value);

    // Cerrar dropdown al hacer clic fuera
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                setSearchTerm('');
            }
        };

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
            if (searchable && searchInputRef.current) {
                searchInputRef.current.focus();
            }
        }

        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isOpen, searchable]);

    const handleSelect = (itemValue: string | number) => {
        onChange(itemValue);
        setIsOpen(false);
        setSearchTerm('');
    };

    const handleClear = (e: React.MouseEvent) => {
        e.stopPropagation();
        onChange('');
    };

    const handleToggle = () => {
        if (!disabled && !loading) {
            setIsOpen(!isOpen);
        }
    };

    const renderItems = (itemsToRender: SelectOption[]) => (
        itemsToRender.map((item) => {
            const isSelected = item.value === value;
            const isDisabled = item.disabled || false;

            return (
                <div
                    key={`${item.value}`}
                    onClick={() => !isDisabled && handleSelect(item.value)}
                    className={`cursor-pointer select-none relative py-2 pl-3 pr-9 text-gray-900 hover:bg-gray-100 ${isSelected ? 'bg-blue-50' : ''
                        } ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                    role="option"
                    aria-selected={isSelected}
                >
                    <span className={`block truncate ${isSelected ? 'font-semibold' : 'font-normal'}`}>
                        {item.label}
                    </span>
                    {isSelected && (
                        <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-primary-darker">
                            <Check className="h-5 w-5" aria-hidden="true" />
                        </span>
                    )}
                </div>
            );
        })
    );

    return (
        <div className={`w-full ${className}`} ref={dropdownRef}>
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
                    className={`w-full p-3 pr-10 text-left border ${error ? 'border-red-400' : 'border-gray-300'
                        } ${disabled || loading ? 'bg-gray-200 cursor-not-allowed' : 'bg-gray-50'
                        } rounded-xl shadow-sm focus:outline-none focus:ring-2 ${error ? 'focus:ring-red-500' : 'focus:ring-primary-darker'
                        }`}
                    aria-haspopup="listbox"
                    aria-expanded={isOpen}
                    disabled={disabled || loading}
                >
                    <span className={`block truncate ${selectedItem ? 'text-gray-900' : 'text-gray-400'}`}>
                        {loading ? 'Cargando...' : (selectedItem?.label || placeholder)}
                    </span>

                    <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5">
                        {clearable && selectedItem && !disabled && !loading ? (
                            <button
                                type="button"
                                onClick={handleClear}
                                className="pointer-events-auto p-1 hover:bg-gray-200 rounded"
                            >
                                ×
                            </button>
                        ) : (
                            <ChevronDown
                                className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''
                                    }`}
                                aria-hidden="true"
                            />
                        )}
                    </span>
                </button>

                {isOpen && !disabled && !loading && (
                    <div
                        className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-xl max-h-60 overflow-auto focus:outline-none animate-fade-in-fast border border-gray-200"
                        role="listbox"
                    >
                        {searchable && (
                            <div className="p-2 border-b border-gray-100">
                                <input
                                    ref={searchInputRef}
                                    type="text"
                                    className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Buscar..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        )}

                        {filteredItems.length === 0 ? (
                            <div className="py-4 text-center text-gray-500 text-sm">
                                {emptyMessage}
                            </div>
                        ) : (
                            <>
                                {/* Items sin grupo */}
                                {groupedItems.ungrouped.length > 0 && renderItems(groupedItems.ungrouped)}

                                {/* Items agrupados */}
                                {Object.entries(groupedItems.groups).map(([groupName, groupItems]) => (
                                    <div key={groupName}>
                                        <div className="py-2 px-3 text-xs font-semibold text-gray-500 uppercase bg-gray-50 border-b border-gray-100">
                                            {groupName}
                                        </div>
                                        {renderItems(groupItems)}
                                    </div>
                                ))}
                            </>
                        )}
                    </div>
                )}
            </div>

            {error && <p className="text-red-500 text-xs mt-1.5">{error}</p>}
        </div>
    );
};

export default Select;