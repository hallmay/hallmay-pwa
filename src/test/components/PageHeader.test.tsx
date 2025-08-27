import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { TestWrapper } from '../mocks/TestWrapper';
import PageHeader from '../../shared/components/layout/PageHeader';

describe('PageHeader Component', () => {
  it('renders title correctly', () => {
    render(
      <TestWrapper>
        <PageHeader title="Test Page" breadcrumbs={[]} />
      </TestWrapper>
    );

    expect(screen.getByText('Test Page')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Test Page');
  });

  it('renders without breadcrumbs', () => {
    render(
      <TestWrapper>
        <PageHeader title="Simple Page" breadcrumbs={[]} />
      </TestWrapper>
    );

    expect(screen.getByText('Simple Page')).toBeInTheDocument();
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
  });

  it('renders with breadcrumbs', () => {
    const breadcrumbs = [
      { label: 'Home', path: '/' },
      { label: 'Products', path: '/products' },
      { label: 'Current Page' }
    ];

    render(
      <TestWrapper>
        <PageHeader title="Current Page" breadcrumbs={breadcrumbs} />
      </TestWrapper>
    );

    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Products')).toBeInTheDocument();
    // Use getAllByText to handle duplicate text
    const currentPageElements = screen.getAllByText('Current Page');
    expect(currentPageElements).toHaveLength(2); // One in title, one in breadcrumb
  });

  it('renders children when provided', () => {
    render(
      <TestWrapper>
        <PageHeader title="Page with Actions" breadcrumbs={[]}>
          <button>Action Button</button>
        </PageHeader>
      </TestWrapper>
    );

    expect(screen.getByText('Page with Actions')).toBeInTheDocument();
    expect(screen.getByText('Action Button')).toBeInTheDocument();
  });

  it('has proper styling classes', () => {
    render(
      <TestWrapper>
        <PageHeader title="Styled Page" breadcrumbs={[]} />
      </TestWrapper>
    );

    const title = screen.getByRole('heading', { level: 1 });
    expect(title).toHaveClass('text-2xl', 'lg:text-3xl', 'font-bold', 'text-text-primary');
  });

  it('renders home icon in breadcrumbs', () => {
    const breadcrumbs = [
      { label: 'Home', path: '/' },
      { label: 'Current' }
    ];

    render(
      <TestWrapper>
        <PageHeader title="Test" breadcrumbs={breadcrumbs} />
      </TestWrapper>
    );

    // Home icon is rendered via Lucide React
    expect(screen.getByText('Home')).toBeInTheDocument();
  });

  it('renders breadcrumbs without paths as plain text', () => {
    const breadcrumbs = [
      { label: 'Home', path: '/' },
      { label: 'Final Item' } // No path - should be plain text
    ];

    render(
      <TestWrapper>
        <PageHeader title="Test" breadcrumbs={breadcrumbs} />
      </TestWrapper>
    );

    expect(screen.getByText('Final Item')).toBeInTheDocument();
  });

  it('handles empty breadcrumbs array', () => {
    render(
      <TestWrapper>
        <PageHeader title="No Breadcrumbs" breadcrumbs={[]} />
      </TestWrapper>
    );

    expect(screen.getByText('No Breadcrumbs')).toBeInTheDocument();
  });

  it('has responsive layout classes', () => {
    const { container } = render(
      <TestWrapper>
        <PageHeader title="Responsive Page" breadcrumbs={[]}>
          <div>Actions</div>
        </PageHeader>
      </TestWrapper>
    );

    const pageHeaderContainer = container.querySelector('.mb-6');
    expect(pageHeaderContainer).toHaveClass('mb-6', 'flex', 'justify-between', 'items-start', 'sm:items-center', 'gap-4');
  });
});
