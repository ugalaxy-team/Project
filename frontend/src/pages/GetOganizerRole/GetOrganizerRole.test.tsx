import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { GetOrganizerRole } from './GetOrganizerRole';
import { roleRequest } from '@/api/requests/roleRequest';

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

vi.mock('@/api/requests/roleRequest', () => ({
  roleRequest: vi.fn(),
}));

vi.mock('lottie-react', () => ({
  default: () => <div data-testid="lottie-mock" />,
}));

describe('GetOrganizerRole Component', () => {
  const mockNavigate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useNavigate).mockReturnValue(mockNavigate);
  });

  it('renders correctly and matches snapshot', () => {
    vi.mocked(useSelector).mockReturnValue({ id: '123' });
    const { container } = render(<GetOrganizerRole />);
    expect(container).toMatchSnapshot();
  });

  it('shows error when user is missing', () => {
    vi.mocked(useSelector).mockReturnValue(null);
    const { container } = render(<GetOrganizerRole />);
    
    fireEvent.submit(container.querySelector('form')!);
    
    expect(toast.error).toHaveBeenCalledWith('Користувач не знайдений або не авторизований!');
  });

  it('submits form and navigates on success', async () => {
    vi.mocked(useSelector).mockReturnValue({ id: '123' });
    vi.mocked(roleRequest).mockResolvedValue(200);

    const { container } = render(<GetOrganizerRole />);

    fireEvent.change(screen.getByLabelText(/ПІБ/i), { target: { value: 'Ivan Ivanov' } });
    fireEvent.change(screen.getByLabelText(/Email \/ Telegram/i), { target: { value: '@ivan' } });
    fireEvent.change(screen.getByLabelText(/Ваш вік/i), { target: { value: '25' } });
    fireEvent.change(screen.getByLabelText(/досвід/i), { target: { value: 'Some experience' } });
    fireEvent.change(screen.getByLabelText(/Чому ви хочете/i), { target: { value: 'Reason' } });
    fireEvent.change(screen.getByLabelText(/Що ви плануєте/i), { target: { value: 'Plans' } });

    fireEvent.submit(container.querySelector('form')!);

    await waitFor(() => {
      expect(roleRequest).toHaveBeenCalledWith('user', '123', [
        { option_name: 'ПІБ', value: 'Ivan Ivanov' },
        { option_name: 'Контакти', value: '@ivan' },
        { option_name: 'Вік', value: '25' },
        { option_name: 'Досвід', value: 'Some experience' },
        { option_name: 'Причина', value: 'Reason' },
        { option_name: 'Плани', value: 'Plans' },
      ]);
    });

    expect(toast.success).toHaveBeenCalledWith('Заявку відправлено! Очікуйте на відповідь');
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('shows duplicate error on 400 response', async () => {
    vi.mocked(useSelector).mockReturnValue({ id: '123' });
    vi.mocked(roleRequest).mockRejectedValue({
      response: { status: 400, data: { detail: 'Role requests already exists!' } }
    });

    const { container } = render(<GetOrganizerRole />);
    
    fireEvent.submit(container.querySelector('form')!);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Ви вже подавали заявку на цю роль! Очікуйте на рішення.');
    });
  });

  it('shows fallback error on API failure', async () => {
    vi.mocked(useSelector).mockReturnValue({ id: '123' });
    vi.mocked(roleRequest).mockRejectedValue(new Error('Network Error'));

    const { container } = render(<GetOrganizerRole />);
    
    fireEvent.submit(container.querySelector('form')!);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Щось пішло не так. Спробуйте пізніше.');
    });
  });
});