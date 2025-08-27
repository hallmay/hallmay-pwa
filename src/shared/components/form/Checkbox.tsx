import { Check } from "lucide-react";
import React from "react";

interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'checked' | 'value'> {
    label: string;
    checked: boolean;
    value: boolean;

}
export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
    ({ label, name, value, checked, className, ...rest }, ref) => (
        <label htmlFor={name} className={`flex items-center gap-2 cursor-pointer ${className}`}>
            <div className="relative flex items-center">
                <input
                    id={name}
                    name={name}
                    checked={checked}
                    type="checkbox"
                    ref={ref}
                    className="peer relative h-5 w-5 cursor-pointer appearance-none rounded-md border-2 border-gray-300 transition-all checked:border-primary-darker checked:bg-primary-darker focus:outline-none focus:ring-2 focus:ring-primary-darker/50"
                    {...rest}
                />
                <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 text-white opacity-0 transition-opacity peer-checked:opacity-100">
                    <Check size={14} strokeWidth={3} />
                </div>
            </div>
            <span className="text-sm text-text-secondary font-medium">{label}</span>
        </label>
    )
);

export default Checkbox;