import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import PageLoader from '../../shared/components/layout/PageLoader';
import type { Breadcrumb } from '../../shared/components/layout/PageHeader';

describe('PageLoader Component', () => {
  const mockBreadcrumbs: Breadcrumb[] = [
    { label: 'Home', path: '/' },
    { label: 'Current Page' }
  ];

  it('renders with title and breadcrumbs', () => {
    render(
      <PageLoader
        title="Test Page"
        breadcrumbs={mockBreadcrumbs}
      />
    );

    expect(screen.getByText('Test Page')).toBeInTheDocument();
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Current Page')).toBeInTheDocument();
  });

  it('renders with custom loading message', () => {
    render(
      <PageLoader
        title="Loading Page"
        breadcrumbs={mockBreadcrumbs}
        message="Loading custom data..."
      />
    );

    expect(screen.getByText('Loading custom data...')).toBeInTheDocument();
  });

  it('renders default loading spinner when no message is provided', () => {
    render(
      <PageLoader
        title="Loading Page"
        breadcrumbs={mockBreadcrumbs}
      />
    );

    // Should render the loading spinner component
    expect(screen.getByText('Cargando datos...')).toBeInTheDocument();
    const spinner = document.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });

  it('renders page header and card container', () => {
    const { container } = render(
      <PageLoader
        title="Test Page"
        breadcrumbs={mockBreadcrumbs}
      />
    );

    expect(container.querySelector('.space-y-6')).toBeInTheDocument();
  });
});
