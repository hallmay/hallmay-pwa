import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import TestWrapper from '../../mocks/TestWrapper';
import SilobagsPage from '../../../features/silobags/SilobagsPage';
import { useSiloBags } from '../../../features/silobags/hooks/useSilobags';

// Mock all the hooks and components
vi.mock('../../../features/silobags/hooks/useSilobags', () => ({
  useSiloBags: vi.fn(() => ({
    siloBags: [
      {
        id: '1',
        name: 'Silo 1',
        crop: { id: '1', name: 'Maíz' },
        field: { id: '1', name: 'Campo 1' },
        status: 'active',
        kg_stored: 1000,
        location: 'Sector A'
      },
      {
        id: '2',
        name: 'Silo 2',
        crop: { id: '2', name: 'Soja' },
        field: { id: '2', name: 'Campo 2' },
        status: 'closed',
        kg_stored: 2000,
        location: 'Sector B'
      }
    ],
    loading: false,
    error: null
  }))
}));

vi.mock('../../../shared/hooks/field/useCampaignFields', () => ({
  useCampaignFields: vi.fn(() => ({
    campaignFields: [
      { field: { id: '1', name: 'Campo 1' } },
      { field: { id: '2', name: 'Campo 2' } }
    ]
  }))
}));

vi.mock('../../../shared/hooks/campaign/useActiveCampaign', () => ({
  useActiveCampaign: vi.fn(() => ({
    campaign: { id: '1', name: 'Campaña 2024' }
  }))
}));

vi.mock('../../../shared/hooks/crop/useCrops', () => ({
  useCrops: vi.fn(() => ({
    crops: [
      { id: '1', name: 'Maíz' },
      { id: '2', name: 'Soja' }
    ]
  }))
}));

vi.mock('../../../features/silobags/hooks/useSilobagManager', () => ({
  useSiloBagManager: vi.fn(() => ({
    modalState: { type: null, data: null },
    openModal: vi.fn(),
    closeModal: vi.fn(),
    handlers: {
      create: vi.fn(),
      extract: vi.fn(),
      close: vi.fn()
    }
  }))
}));

// Mock components
vi.mock('../../../features/silobags/components/Filters', () => ({
  default: ({ selectedField, onFieldChange, selectedCrop, onCropChange }: any) => (
    <div data-testid="filters">
      <select 
        data-testid="field-filter" 
        value={selectedField} 
        onChange={(e) => onFieldChange(e.target.value)}
      >
        <option value="all">Todos los campos</option>
        <option value="1">Campo 1</option>
        <option value="2">Campo 2</option>
      </select>
      <select 
        data-testid="crop-filter" 
        value={selectedCrop} 
        onChange={(e) => onCropChange(e.target.value)}
      >
        <option value="all">Todos los cultivos</option>
        <option value="1">Maíz</option>
        <option value="2">Soja</option>
      </select>
    </div>
  )
}));

vi.mock('../../../features/silobags/components/SilobagCard', () => ({
  default: ({ silo, onExtract, onClose }: any) => (
    <div data-testid={`silobag-card-${silo.id}`}>
      <h3>{silo.name}</h3>
      <p>{silo.crop.name}</p>
      <p>{silo.field.name}</p>
      <p>{silo.status}</p>
      {silo.status === 'active' && (
        <>
          <button onClick={() => onExtract()} data-testid={`extract-${silo.id}`}>
            Extraer
          </button>
          <button onClick={() => onClose()} data-testid={`close-${silo.id}`}>
            Cerrar
          </button>
        </>
      )}
    </div>
  )
}));

vi.mock('../../../shared/components/layout/PageHeader', () => ({
  default: ({ title, breadcrumbs, children }: any) => (
    <div data-testid="page-header">
      <h1>{title}</h1>
      {breadcrumbs && (
        <nav data-testid="breadcrumbs">
          {breadcrumbs.map((crumb: any, index: number) => (
            <span key={index}>{crumb.label}</span>
          ))}
        </nav>
      )}
      {children}
    </div>
  )
}));

vi.mock('../../../shared/components/commons/Button', () => ({
  default: ({ children, onClick, icon: Icon }: any) => (
    <button onClick={onClick} data-testid="create-button">
      {Icon && <Icon data-testid="plus-icon" />}
      {children}
    </button>
  )
}));

vi.mock('../../../shared/components/layout/PageLoader', () => ({
  default: ({ title, breadcrumbs, message }: any) => (
    <div data-testid="page-loader">
      <h1>{title}</h1>
      <p>{message}</p>
    </div>
  )
}));

// Mock modals
vi.mock('../../../features/silobags/components/modals/CreateSilobagModal', () => ({
  default: ({ isOpen, onClose, onSubmit }: any) => (
    isOpen ? (
      <div data-testid="create-modal">
        <button onClick={onClose} data-testid="close-create-modal">Close</button>
        <button onClick={onSubmit} data-testid="submit-create-modal">Submit</button>
      </div>
    ) : null
  )
}));

vi.mock('../../../features/silobags/components/modals/ExtractKgsModal', () => ({
  default: ({ isOpen, onClose, onSubmit }: any) => (
    isOpen ? (
      <div data-testid="extract-modal">
        <button onClick={onClose} data-testid="close-extract-modal">Close</button>
        <button onClick={onSubmit} data-testid="submit-extract-modal">Submit</button>
      </div>
    ) : null
  )
}));

vi.mock('../../../features/silobags/components/modals/CloseSilobagModal', () => ({
  default: ({ isOpen, onClose, onSubmit }: any) => (
    isOpen ? (
      <div data-testid="close-modal">
        <button onClick={onClose} data-testid="close-close-modal">Close</button>
        <button onClick={onSubmit} data-testid="submit-close-modal">Submit</button>
      </div>
    ) : null
  )
}));

// Mock lucide-react
vi.mock('lucide-react', () => ({
  PlusCircle: () => <div data-testid="plus-circle-icon">Plus</div>
}));

describe('SilobagsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders page header with correct title', () => {
    render(
      <TestWrapper>
        <SilobagsPage />
      </TestWrapper>
    );

    expect(screen.getByTestId('page-header')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /silos/i })).toBeInTheDocument();
    expect(screen.getByTestId('breadcrumbs')).toBeInTheDocument();
  });

  it('renders create button with icon', () => {
    render(
      <TestWrapper>
        <SilobagsPage />
      </TestWrapper>
    );

    expect(screen.getByTestId('create-button')).toBeInTheDocument();
    expect(screen.getByText('Crear Silobolsa')).toBeInTheDocument();
    expect(screen.getByTestId('plus-circle-icon')).toBeInTheDocument();
  });

  it('renders filters component', () => {
    render(
      <TestWrapper>
        <SilobagsPage />
      </TestWrapper>
    );

    expect(screen.getByTestId('filters')).toBeInTheDocument();
    expect(screen.getByTestId('field-filter')).toBeInTheDocument();
    expect(screen.getByTestId('crop-filter')).toBeInTheDocument();
  });

  it('renders silobag cards for each silo', () => {
    render(
      <TestWrapper>
        <SilobagsPage />
      </TestWrapper>
    );

    expect(screen.getByTestId('silobag-card-1')).toBeInTheDocument();
    expect(screen.getByTestId('silobag-card-2')).toBeInTheDocument();
    expect(screen.getByText('Silo 1')).toBeInTheDocument();
    expect(screen.getByText('Silo 2')).toBeInTheDocument();
    // Use getAllByText to handle multiple instances of "Maíz" (in filter and card)
    expect(screen.getAllByText('Maíz')).toHaveLength(2);
    expect(screen.getAllByText('Soja')).toHaveLength(2);
  });

  it('shows extract and close buttons only for active silos', () => {
    render(
      <TestWrapper>
        <SilobagsPage />
      </TestWrapper>
    );

    // Silo 1 is active, should have buttons
    expect(screen.getByTestId('extract-1')).toBeInTheDocument();
    expect(screen.getByTestId('close-1')).toBeInTheDocument();

    // Silo 2 is closed, should not have buttons
    expect(screen.queryByTestId('extract-2')).not.toBeInTheDocument();
    expect(screen.queryByTestId('close-2')).not.toBeInTheDocument();
  });

  it('handles field filter changes', () => {
    render(
      <TestWrapper>
        <SilobagsPage />
      </TestWrapper>
    );

    const fieldFilter = screen.getByTestId('field-filter');
    fireEvent.change(fieldFilter, { target: { value: '1' } });

    expect(fieldFilter).toHaveValue('1');
  });

  it('handles crop filter changes', () => {
    render(
      <TestWrapper>
        <SilobagsPage />
      </TestWrapper>
    );

    const cropFilter = screen.getByTestId('crop-filter');
    fireEvent.change(cropFilter, { target: { value: '2' } });

    expect(cropFilter).toHaveValue('2');
  });

  it('shows loading state when data is loading', () => {
    // Override the hook mock for this specific test
    vi.mocked(useSiloBags).mockReturnValue({
      siloBags: [],
      loading: true,
      error: null
    });

    render(
      <TestWrapper>
        <SilobagsPage />
      </TestWrapper>
    );

    expect(screen.getByTestId('page-loader')).toBeInTheDocument();
    expect(screen.getByText('Cargando silos...')).toBeInTheDocument();
  });

  it('shows error state when there is an error', () => {
    // Override the hook mock for this specific test
    vi.mocked(useSiloBags).mockReturnValue({
      siloBags: [],
      loading: false,
      error: 'Error al cargar silos'
    });

    render(
      <TestWrapper>
        <SilobagsPage />
      </TestWrapper>
    );

    expect(screen.getByText('Error: Error al cargar silos')).toBeInTheDocument();
  });

  it('shows empty state when no silos are found', () => {
    // Override the hook mock for this specific test
    vi.mocked(useSiloBags).mockReturnValue({
      siloBags: [],
      loading: false,
      error: null
    });

    render(
      <TestWrapper>
        <SilobagsPage />
      </TestWrapper>
    );

    expect(screen.getByText('No se encontraron silos con los filtros seleccionados.')).toBeInTheDocument();
  });

  it('renders without crashing', () => {
    render(
      <TestWrapper>
        <SilobagsPage />
      </TestWrapper>
    );

    expect(screen.getByTestId('page-header')).toBeInTheDocument();
  });

  it('exports SilobagsPage as default export', () => {
    expect(SilobagsPage).toBeDefined();
    expect(typeof SilobagsPage).toBe('function');
  });
});
