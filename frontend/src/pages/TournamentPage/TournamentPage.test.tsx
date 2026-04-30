import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'; 
import '@testing-library/jest-dom/vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TournamentPage } from './TournamentPage';
import apiClient from '@/api/client';

// --- Mocks ---
vi.mock('@/api/client', () => ({
  default: {
    get: vi.fn(),
  },
}));

vi.mock('react-router-dom', () => ({
  useParams: () => ({ id: '123' }),
}));

vi.mock('../../components/Hero', () => ({
  Hero: ({ title }: any) => <div data-testid="mock-hero">{title}</div>
}));

const mockTournament = {
  title: "SLOVO JAM",
  description: "Тестовий опис завдання турніру",
  reg_start: "2026-04-01T10:00:00Z",
  reg_end: "2026-04-20T10:00:00Z",
  start_date: "2026-05-01T10:00:00Z",
  max_teams: 10
};

const placeholderTabs = ['Шукають команду', 'Команди (3)', 'Результати'];

describe('TournamentPage', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { 
          retry: false, 
          retryDelay: 0 
        },
      },
    });

    (apiClient.get as any).mockResolvedValue({ data: mockTournament });
    
    vi.useFakeTimers({ toFake: ['Date'] });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const renderWithProviders = () => {
    const user = userEvent.setup({ delay: null }); 
    const view = render(
      <QueryClientProvider client={queryClient}>
        <TournamentPage />
      </QueryClientProvider>
    );
    return { user, ...view };
  };
  
  it('renders loading state initially', () => {
    renderWithProviders();
    expect(screen.getByText('Завантаження турніру...')).toBeInTheDocument();
  });

  it('shows error state on API failure', async () => {
    (apiClient.get as any).mockRejectedValue({ response: { data: { message: 'Помилка сервера' } } });
    renderWithProviders();
    
    await waitFor(() => {
      expect(screen.getByText('Ой, халепа!')).toBeInTheDocument();
      expect(screen.getByText('Помилка сервера')).toBeInTheDocument();
    });
  });

  it('retries fetch when "Спробувати знову" button is clicked', async () => {
    (apiClient.get as any)
      .mockRejectedValueOnce({ response: { data: { message: 'Network error' } } })
      .mockRejectedValueOnce({ response: { data: { message: 'Network error' } } });
      
    const { user } = renderWithProviders();
    
    await waitFor(() => {
      expect(screen.getByText('Ой, халепа!')).toBeInTheDocument();
    });

    (apiClient.get as any).mockResolvedValueOnce({ data: mockTournament });
    
    const retryButton = screen.getByRole('button', { name: 'Спробувати знову' });
    await user.click(retryButton);

    await waitFor(() => {
      expect(apiClient.get).toHaveBeenCalledTimes(3); 
      expect(screen.getByText('SLOVO JAM')).toBeInTheDocument();
    });
  });

  it('shows "До початку реєстрації" state when before reg_start', async () => {
    vi.setSystemTime(new Date('2026-03-25T10:00:00Z'));
    renderWithProviders();
    
    await waitFor(() => {
      expect(screen.getByText('До початку реєстрації')).toBeInTheDocument();
      expect(screen.getByText('Очікування результатів')).toBeInTheDocument();
    });
  });

  it('shows "Реєстрація" state when between reg_start and reg_end', async () => {
    vi.setSystemTime(new Date('2026-04-10T10:00:00Z'));
    renderWithProviders();
    
    await waitFor(() => {
      expect(screen.getByText('До кінця реєстрації')).toBeInTheDocument();
      expect(screen.getByText('Реєстрація')).toBeInTheDocument();
    });
  });

  it('shows "До старту турніру" state when between reg_end and start_date', async () => {
    vi.setSystemTime(new Date('2026-04-25T10:00:00Z'));
    renderWithProviders();
    
    await waitFor(() => {
      expect(screen.getByText('До старту турніру')).toBeInTheDocument();
    });
  });

  it('shows "Активно" state when within 48h after start_date', async () => {
    vi.setSystemTime(new Date('2026-05-02T10:00:00Z'));
    renderWithProviders();
    
    await waitFor(() => {
      expect(screen.getByText('До здачі роботи')).toBeInTheDocument();
      expect(screen.getByText('Активно')).toBeInTheDocument();
    });
  });

  it('shows "Завершено" state when more than 48h after start_date passed', async () => {
    vi.setSystemTime(new Date('2026-05-10T10:00:00Z'));
    renderWithProviders();
    
    await waitFor(() => {
      const finishedElements = screen.getAllByText('Завершено');
      expect(finishedElements.length).toBeGreaterThan(0);
    });
  });

  it('shows DescriptionTab by default after successful data fetch', async () => {
    renderWithProviders();
    
    await waitFor(() => {
      expect(screen.getByText('Що потрібно зробити?')).toBeInTheDocument();
    });
    
    expect(screen.getByText(mockTournament.description)).toBeInTheDocument();
  });

  it.each(placeholderTabs)('shows PlaceholderTab on "%s" click', async (tabName) => {
    const { user } = renderWithProviders();
    
    await waitFor(() => {
      expect(screen.getByText('Що потрібно зробити?')).toBeInTheDocument();
    });

    const tabButton = screen.getByText(tabName);
    await user.click(tabButton);
    
    expect(screen.getByText('В розробці...')).toBeInTheDocument();
    expect(screen.queryByText('Що потрібно зробити?')).not.toBeInTheDocument();
  });
  
  it('navigates back to DescriptionTab when clicked', async () => {
    const { user } = renderWithProviders();
    
    await waitFor(() => {
      expect(screen.getByText('Що потрібно зробити?')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Результати'));
    expect(screen.getByText('В розробці...')).toBeInTheDocument();

    await user.click(screen.getByText('Опис завдання'));
    expect(screen.getByText('Що потрібно зробити?')).toBeInTheDocument();
  });
});