import { vi, describe, it, expect, beforeEach } from 'vitest'; 
import '@testing-library/jest-dom/vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TournamentPage } from './TournamentPage';
import apiClient from '@/api/client';

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
  start_date: "2026-05-01T10:00:00Z",
  reg_start: "2026-04-01T10:00:00Z",
  reg_end: "2026-04-20T10:00:00Z",
  max_teams: 10
};

const placeholderTabs = ['Шукають команду', 'Команди (3)', 'Результати'];

describe('TournamentPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (apiClient.get as any).mockResolvedValue({ data: mockTournament });
  });

  it('renders loading state initially', () => {
    render(<TournamentPage />);
    expect(screen.getByText('Завантаження турніру...')).toBeInTheDocument();
  });

  it('shows error state on API failure', async () => {
    (apiClient.get as any).mockRejectedValueOnce({ response: { data: { message: 'Помилка сервера' } } });
    render(<TournamentPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Ой, халепа!')).toBeInTheDocument();
      expect(screen.getByText('Помилка сервера')).toBeInTheDocument();
    });
  });

  it('shows DescriptionTab by default after successful data fetch', async () => {
    render(<TournamentPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Що потрібно зробити?')).toBeInTheDocument();
    });
    
    expect(screen.getByText(mockTournament.description)).toBeInTheDocument();
  });

  it.each(placeholderTabs)('shows PlaceholderTab on "%s" click', async (tabName) => {
    render(<TournamentPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Що потрібно зробити?')).toBeInTheDocument();
    });

    await userEvent.click(screen.getByText(tabName));
    
    expect(screen.getByText('В розробці...')).toBeInTheDocument();
    expect(screen.queryByText('Що потрібно зробити?')).not.toBeInTheDocument();
  });
});