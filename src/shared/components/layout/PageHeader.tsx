import { Home } from "lucide-react";
import type { FC } from "react";

export interface Breadcrumb {
    label: string;
    path?: string;
}

interface PageHeaderProps {
    title: string;
    breadcrumbs: Breadcrumb[];
    children?: React.ReactNode;
}

const PageHeader: FC<PageHeaderProps> = ({ title, breadcrumbs = [], children }) => (
    <div className="mb-6 flex justify-between items-start sm:items-center gap-4">
        <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-text-primary">{title}</h1>
            {breadcrumbs.length > 0 && (
                <div className="text-sm text-text-secondary mt-1 flex items-center gap-1.5">
                    <Home size={14} />
                    {breadcrumbs.map((crumb, index) => (
                        <span key={index} className="flex items-center gap-1.5">
                            / <span className={index === breadcrumbs.length - 1 ? 'font-semibold text-text-primary' : ''}>{crumb.label}</span>
                        </span>
                    ))}
                </div>
            )}
        </div>
        {/* El contenedor de botones ahora se alinea a la derecha por defecto */}
        <div className="flex items-center flex-shrink-0">
            {children}
        </div>
    </div>
);

export default PageHeader;