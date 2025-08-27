
// src/components/commons/form/Input.tsx

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    name: string;
    error?: string;
    inputClassName?: string; // Nueva prop para clases del input
}

const Input: React.FC<InputProps> = ({ label, name, error, className = '', inputClassName = '', ...props }) => (
    <div className={`w-full ${className}`}>
        {label && <label htmlFor={name} className="block text-sm font-medium text-text-secondary mb-1.5">{label}</label>}
        <input
            id={name}
            name={name}
            className={`w-full p-3 border rounded-xl shadow-sm focus:outline-none focus:ring-2 ${error ? 'border-red-400 focus:ring-red-500' : 'border-gray-300 focus:ring-primary-dark'} ${inputClassName}`}
            {...props}
        />
        {error && <p className="text-red-500 text-xs mt-1.5">{error}</p>}
    </div>
);

export default Input;