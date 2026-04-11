import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { RoleRequestPage } from './RoleRequestPage';
import { requestRole } from '@/api/requests/requestRole';
import apiClient from '@/api/client';

vi.mock('react-redux', () => ({
  useSelector: vi.fn(),
}));

vi.mock('react-router-dom', () => ({
  useNavigate: vi.fn(),
}));


vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));


vi.mock('@/api/requests/requestRole', () => ({
  requestRole: vi.fn(),
}));

vi.mock('@/api/client', () => ({
  default: {
    get: vi.fn(),
  },
}));

vi.mock('lottie-react', () => ({
  default: () => <div data-testid="lottie-mock" />,
}));

describe('RoleRequestPage Component', () => {
  const mockNavigate = vi.fn();

  const mockRoles = [
    { name: 'admin', display_name: 'Administrator', description: 'Admin role' },
    { name: 'moderator', display_name: 'Moderator', description: 'Mod role' },
    { name: 'user', display_name: 'User', description: 'Regular user' },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useNavigate).mockReturnValue(mockNavigate);
    vi.mocked(apiClient.get).mockResolvedValue({ data: mockRoles });
  });

  it('renders loading state initially', () => {
    vi.mocked(useSelector).mockReturnValue({ id: '123' });
    render(<RoleRequestPage />);

    expect(screen.getByText('Завантаження ролей...')).toBeInTheDocument();
  });

  it('fetches and displays roles correctly, filtering out "user"', async () => {
    vi.mocked(useSelector).mockReturnValue({ id: '123' });
    render(<RoleRequestPage />);
    await waitFor(() => {
      expect(screen.getByText('Administrator')).toBeInTheDocument();
      expect(screen.getByText('Moderator')).toBeInTheDocument();
    });
    expect(screen.queryByText('User')).not.toBeInTheDocument();

    expect(screen.getByText('Заявка на роль administrator')).toBeInTheDocument();
  });

  it('shows error toast if role fetching fails', async () => {
    vi.mocked(useSelector).mockReturnValue({ id: '123' });
    vi.mocked(apiClient.get).mockRejectedValue(new Error('Network Error'));

    render(<RoleRequestPage />);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Не вдалося завантажити список ролей');
    });
  });

  it('shows error when user is missing on submit', async () => {
    vi.mocked(useSelector).mockReturnValue(null);
    const { container } = render(<RoleRequestPage />);

    await waitFor(() => expect(screen.getByText('Administrator')).toBeInTheDocument());

    fireEvent.submit(container.querySelector('form')!);

    expect(toast.error).toHaveBeenCalledWith('Користувач не знайдений або не авторизований!');
  });

  it('submits form as Tolka and navigates on success', async () => {
    vi.mocked(useSelector).mockReturnValue({ id: '123' });
    vi.mocked(requestRole).mockResolvedValue(200);

    const { container } = render(<RoleRequestPage />);

    await waitFor(() => expect(screen.getByText('Administrator')).toBeInTheDocument());

    fireEvent.click(screen.getByText('Moderator'));

    fireEvent.change(screen.getByLabelText(/ПІБ \*/i), { target: { value: 'Толька' } });
    fireEvent.change(screen.getByLabelText(/Email \/ Telegram \*/i), { target: { value: '@tolka_boss' } });
    fireEvent.change(screen.getByLabelText(/Ваш вік \*/i), { target: { value: '22' } });
    fireEvent.change(screen.getByLabelText(/Чи маєте релевантний досвід\? \*/i), { target: { value: 'Досвід бути Толькою' } });
    fireEvent.change(screen.getByLabelText(/Чому ви хочете отримати цю роль\? \*/i), { target: { value: 'Бо я Толька' } });
    fireEvent.change(screen.getByLabelText(/Що ви плануєте робити на цій ролі\? \*/i), { target: { value: 'Наводити порядки' } });

    fireEvent.submit(container.querySelector('form')!);

    await waitFor(() => {
      expect(requestRole).toHaveBeenCalledWith('moderator', '123', [
        { option_name: 'ПІБ', value: 'Толька' },
        { option_name: 'Контакти', value: '@tolka_boss' },
        { option_name: 'Вік', value: '22' },
        { option_name: 'Досвід', value: 'Досвід бути Толькою' },
        { option_name: 'Причина', value: 'Бо я Толька' },
        { option_name: 'Плани', value: 'Наводити порядки' },
      ]);
    });

    expect(toast.success).toHaveBeenCalledWith('Заявку відправлено! Очікуйте на відповідь');
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('shows duplicate error on 400 response', async () => {
    vi.mocked(useSelector).mockReturnValue({ id: '123' });
    vi.mocked(requestRole).mockRejectedValue({
      response: { status: 400, data: { detail: 'Role requests already exists!' } }
    });

    const { container } = render(<RoleRequestPage />);

    await waitFor(() => expect(screen.getByText('Administrator')).toBeInTheDocument());

    fireEvent.submit(container.querySelector('form')!);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Ви вже подавали заявку на цю роль! Очікуйте на рішення.');
    });
  });

  it('shows fallback error on API failure', async () => {
    vi.mocked(useSelector).mockReturnValue({ id: '123' });
    vi.mocked(requestRole).mockRejectedValue(new Error('Network Error'));

    const { container } = render(<RoleRequestPage />);

    await waitFor(() => expect(screen.getByText('Administrator')).toBeInTheDocument());

    fireEvent.submit(container.querySelector('form')!);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Щось пішло не так. Спробуйте пізніше.');
    });
  });
});