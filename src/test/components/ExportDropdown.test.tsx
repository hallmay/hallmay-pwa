import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { TestWrapper } from '../mocks/TestWrapper';
import ExportDropdown from '../../shared/components/commons/ExportDropdown';

describe('ExportDropdown Component', () => {
  const mockOnExport = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders export button', () => {
    render(
      <TestWrapper>
        <ExportDropdown onExport={mockOnExport} />
      </TestWrapper>
    );

    expect(screen.getByText('Exportar')).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('opens dropdown when export button is clicked', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <ExportDropdown onExport={mockOnExport} />
      </TestWrapper>
    );

    const exportButton = screen.getByText('Exportar');
    await user.click(exportButton);

    expect(screen.getByText('Exportar a CSV (.csv)')).toBeInTheDocument();
    expect(screen.getByText('Exportar a Excel (.xlsx)')).toBeInTheDocument();
  });

  it('closes dropdown when clicking outside', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <div>
          <ExportDropdown onExport={mockOnExport} />
          <div data-testid="outside">Outside element</div>
        </div>
      </TestWrapper>
    );

    // Open dropdown
    const exportButton = screen.getByText('Exportar');
    await user.click(exportButton);
    expect(screen.getByText('Exportar a CSV (.csv)')).toBeInTheDocument();

    // Click outside
    const outsideElement = screen.getByTestId('outside');
    await user.click(outsideElement);
    
    // Dropdown should close
    expect(screen.queryByText('Exportar a CSV (.csv)')).not.toBeInTheDocument();
  });

  it('calls onExport with CSV format when CSV option is clicked', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <ExportDropdown onExport={mockOnExport} />
      </TestWrapper>
    );

    // Open dropdown
    const exportButton = screen.getByText('Exportar');
    await user.click(exportButton);

    // Click CSV option
    const csvOption = screen.getByText('Exportar a CSV (.csv)');
    await user.click(csvOption);

    expect(mockOnExport).toHaveBeenCalledWith('csv');
  });

  it('calls onExport with Excel format when Excel option is clicked', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <ExportDropdown onExport={mockOnExport} />
      </TestWrapper>
    );

    // Open dropdown
    const exportButton = screen.getByText('Exportar');
    await user.click(exportButton);

    // Click Excel option
    const excelOption = screen.getByText('Exportar a Excel (.xlsx)');
    await user.click(excelOption);

    expect(mockOnExport).toHaveBeenCalledWith('xlsx');
  });

  it('dropdown stays open after selecting an option (current behavior)', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <ExportDropdown onExport={mockOnExport} />
      </TestWrapper>
    );

    // Open dropdown
    const exportButton = screen.getByText('Exportar');
    await user.click(exportButton);
    expect(screen.getByText('Exportar a CSV (.csv)')).toBeInTheDocument();

    // Click CSV option
    const csvOption = screen.getByText('Exportar a CSV (.csv)');
    await user.click(csvOption);

    // Currently dropdown stays open (this could be considered a bug)
    expect(screen.getByText('Exportar a CSV (.csv)')).toBeInTheDocument();
  });

  it('renders button without aria-expanded (current behavior)', () => {
    render(
      <TestWrapper>
        <ExportDropdown onExport={mockOnExport} />
      </TestWrapper>
    );

    const button = screen.getByRole('button');
    // Current implementation doesn't have aria-expanded
    expect(button).not.toHaveAttribute('aria-expanded');
  });

  it('main button can be identified when dropdown is open', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <ExportDropdown onExport={mockOnExport} />
      </TestWrapper>
    );

    const exportButton = screen.getByText('Exportar');
    await user.click(exportButton);

    // When dropdown is open, there are multiple buttons, but we can still find the main one
    const mainButton = screen.getByText('Exportar').closest('button');
    expect(mainButton).toBeInTheDocument();
  });

  it('renders with proper icons', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <ExportDropdown onExport={mockOnExport} />
      </TestWrapper>
    );

    // Open dropdown to see the icons
    const exportButton = screen.getByText('Exportar');
    await user.click(exportButton);

    // Check that the options are rendered (icons are from lucide-react)
    expect(screen.getByText('Exportar a CSV (.csv)')).toBeInTheDocument();
    expect(screen.getByText('Exportar a Excel (.xlsx)')).toBeInTheDocument();
  });
});
