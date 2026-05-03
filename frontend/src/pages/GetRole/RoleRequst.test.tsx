import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RoleRequestPage } from './RoleRequestPage';
import { requestRole } from '@/api/requests/requestRole';
import { auth } from '@/firebase';

vi.mock('react-redux', () => ({
  useSelector: vi.fn(),
}));

vi.mock('react-router-dom', () => ({
  useNavigate: vi.fn(),
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('@/api/requests/requestRole', () => ({
  requestRole: vi.fn(),
}));

vi.mock('@/firebase', () => ({
  auth: {
    currentUser: { uid: 'mock-user-123' },
  },
}));

vi.mock('lottie-react', () => ({
  default: () => <div data-testid="lottie-mock" />,
}));

describe('RoleRequestPage Component', () => {
  const mockNavigate = vi.fn();
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useNavigate).mockReturnValue(mockNavigate);
    (auth as { currentUser: any }).currentUser = { uid: 'mock-user-123' };

    queryClient = new QueryClient({
      defaultOptions: {
        mutations: {
          retry: false,
        },
      },
    });
  });

  const renderWithProviders = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <RoleRequestPage />
      </QueryClientProvider>
    );
  };

  it('matches snapshot', () => {
    vi.mocked(useSelector).mockReturnValue({ id: '123' });
    const { container } = renderWithProviders();

    expect(container).toMatchSnapshot();
  });

  it('renders correctly with hardcoded organizer role and warning message', () => {
    vi.mocked(useSelector).mockReturnValue({ id: '123' });
    renderWithProviders();

    expect(screen.getByText('Заявка на роль Організатора')).toBeInTheDocument();
    expect(screen.getByText(/Наразі ви можете отримати лише роль Організатора/i)).toBeInTheDocument();
    expect(screen.getByTestId('lottie-mock')).toBeInTheDocument();
  });

  it('allows user to type in form fields', () => {
    vi.mocked(useSelector).mockReturnValue({ id: '123' });
    renderWithProviders();

    const nameInput = screen.getByLabelText(/ПІБ \*/i);
    fireEvent.change(nameInput, { target: { value: 'Ivan Franko' } });

    expect((nameInput as HTMLInputElement).value).toBe('Ivan Franko');
  });

  it('shows error toast when user is not in redux store on submit', () => {
    vi.mocked(useSelector).mockReturnValue(null);
    const { container } = renderWithProviders();

    fireEvent.submit(container.querySelector('form')!);

    expect(toast.error).toHaveBeenCalledWith('Користувач не знайдений або не авторизований!', { id: 'auth-error' });
    expect(requestRole).not.toHaveBeenCalled();
  });

  it('returns early and does not submit if auth.currentUser is null', async () => {
    vi.mocked(useSelector).mockReturnValue({ id: '123' });
    (auth as { currentUser: any }).currentUser = null;

    const { container } = renderWithProviders();
    fireEvent.submit(container.querySelector('form')!);

    await waitFor(() => {
      expect(requestRole).not.toHaveBeenCalled();
    });
  });

  it('submits form successfully with all fields and navigates to home', async () => {
    vi.mocked(useSelector).mockReturnValue({ id: '123' });
    vi.mocked(requestRole).mockResolvedValue(200 as any);

    const { container } = renderWithProviders();

    fireEvent.change(screen.getByLabelText(/ПІБ \*/i), { target: { value: 'Tolka' } });
    fireEvent.change(screen.getByLabelText(/Email \/ Telegram \*/i), { target: { value: '@tolka' } });
    fireEvent.change(screen.getByLabelText(/Ваш вік \*/i), { target: { value: '25' } });
    fireEvent.change(screen.getByLabelText(/Чи маєте релевантний досвід\? \*/i), { target: { value: 'Yes' } });
    fireEvent.change(screen.getByLabelText(/Чому ви хочете отримати цю роль\? \*/i), { target: { value: 'Because' } });
    fireEvent.change(screen.getByLabelText(/Що ви плануєте робити на цій ролі\? \*/i), { target: { value: 'Work' } });

    fireEvent.submit(container.querySelector('form')!);

    await waitFor(() => {
      expect(requestRole).toHaveBeenCalledWith('organizer', { uid: 'mock-user-123' }, '123', [
        { option_name: 'ПІБ', value: 'Tolka' },
        { option_name: 'Контакти', value: '@tolka' },
        { option_name: 'Вік', value: '25' },
        { option_name: 'Досвід', value: 'Yes' },
        { option_name: 'Причина', value: 'Because' },
        { option_name: 'Плани', value: 'Work' },
      ]);
    });

    expect(toast.success).toHaveBeenCalledWith('Заявку відправлено! Очікуйте на відповідь', { id: 'role-submit' });
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('shows duplicate error toast on 400 response with specific detail', async () => {
    vi.mocked(useSelector).mockReturnValue({ id: '123' });
    vi.mocked(requestRole).mockRejectedValue({
      response: { status: 400, data: { detail: 'Role requests already exists!' } }
    });

    const { container } = renderWithProviders();

    fireEvent.submit(container.querySelector('form')!);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Ви вже подавали заявку на цю роль! Очікуйте на рішення.', { id: 'role-error' });
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  it('shows fallback error toast on random API failure', async () => {
    vi.mocked(useSelector).mockReturnValue({ id: '123' });
    vi.mocked(requestRole).mockRejectedValue(new Error('Internal Server Error'));

    const { container } = renderWithProviders();

    fireEvent.submit(container.querySelector('form')!);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Щось пішло не так. Спробуйте пізніше.', { id: 'role-error' });
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });
});