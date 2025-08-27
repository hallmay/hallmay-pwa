interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    name: string;
    error?: string;
}

export const TextArea: React.FC<TextAreaProps> = ({ label, name, error, className = '', ...props }) => (
    <div className={`w-full ${className}`}>
        {label && <label htmlFor={name} className="block text-sm font-medium text-text-secondary mb-1.5">{label}</label>}
        <textarea
            id={name}
            name={name}
            rows={4}
            className={`w-full p-3 border ${error ? 'border-red-400' : 'border-gray-300'} rounded-xl shadow-sm focus:outline-none focus:ring-2 ${error ? 'focus:ring-red-500' : 'focus:ring-primary-dark'} focus:border-transparent`}
            {...props}
        />
        {error && <p className="text-red-500 text-xs mt-1.5">{error}</p>}
    </div>
);

export default TextArea;