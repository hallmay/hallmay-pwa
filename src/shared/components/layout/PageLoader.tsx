import type { FC } from 'react';
import PageHeader, { type Breadcrumb } from './PageHeader';
import LoadingSpinner from '../commons/LoadingSpinner';
import Card from '../commons/Card';

interface PageLoaderProps {
    title: string;
    breadcrumbs: Breadcrumb[];
    message?: string;
}

const PageLoader: FC<PageLoaderProps> = ({ title, breadcrumbs, message }) => (
    <div className="space-y-6">
        <PageHeader title={title} breadcrumbs={breadcrumbs} />
        <Card>
            <LoadingSpinner message={message} />
        </Card>
    </div>
);

export default PageLoader;