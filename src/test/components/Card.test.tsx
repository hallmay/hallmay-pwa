import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Card } from '../../shared/components/commons/Card';

describe('Card Component', () => {
  it('renders children correctly', () => {
    render(
      <Card>
        <h1>Card Title</h1>
        <p>Card content</p>
      </Card>
    );
    
    expect(screen.getByText('Card Title')).toBeInTheDocument();
    expect(screen.getByText('Card content')).toBeInTheDocument();
  });

  it('applies default classes', () => {
    render(<Card data-testid="card">Content</Card>);
    
    const card = screen.getByTestId('card');
    expect(card).toHaveClass('bg-surface', 'p-4', 'sm:p-6', 'rounded-2xl', 'shadow-sm', 'border', 'border-gray-200/80');
  });

  it('applies custom className', () => {
    render(<Card className="custom-class" data-testid="card">Content</Card>);
    
    const card = screen.getByTestId('card');
    expect(card).toHaveClass('custom-class');
    expect(card).toHaveClass('bg-surface'); // Still has default classes
  });

  it('forwards HTML attributes', () => {
    render(<Card id="test-card" role="article">Content</Card>);
    
    const card = screen.getByRole('article');
    expect(card).toHaveAttribute('id', 'test-card');
  });

  it('renders as a div element', () => {
    render(<Card data-testid="card">Content</Card>);
    
    const card = screen.getByTestId('card');
    expect(card.tagName).toBe('DIV');
  });
});
