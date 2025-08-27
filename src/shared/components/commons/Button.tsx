import { Loader2, type LucideProps } from "lucide-react";

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children?: React.ReactNode;
    variant?: ButtonVariant;
    icon?: React.ElementType<LucideProps>;
    isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', icon: Icon, className = '', isLoading = false, ...props }) => {
    const baseStyle = `font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2`;
    const styles = {
        primary: 'bg-primary-darker text-white hover:bg-primary-medium focus:ring-primary-dark px-5 py-3',
        secondary: 'bg-primary-light text-primary-dark hover:bg-primary-light/80 focus:ring-primary-dark px-4 py-2.5',
        danger: 'bg-red-500 text-white hover:bg-red-600 focus:ring-red-700 px-4 py-2.5',
        outline: 'bg-transparent border border-gray-300 text-text-secondary hover:bg-gray-100 focus:ring-primary-dark px-4 py-2.5',
        ghost: 'bg-transparent text-text-secondary hover:bg-gray-200/70 focus:ring-primary-dark p-2',
    };
    return (
        <button className={`${baseStyle} ${styles[variant]} ${className}`} disabled={isLoading || props.disabled} {...props}>
            {isLoading ? <Loader2 size={20} className="animate-spin" /> : (Icon && <Icon size={16} />)}
            {children && <span>{children}</span>}
        </button>
    );
};

export default Button;