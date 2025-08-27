interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ children, className = '', ...props }) => (
    <div className={`bg-surface p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-200/80 ${className}`} {...props}>
        {children}
    </div>
);

export default Card;