import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { ForgotPassword } from './ForgotPassword';

import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../firebase';

// Mocks
vi.mock('firebase/auth', () => ({
  sendPasswordResetEmail: vi.fn(),
}));

vi.mock('../../firebase', () => ({
  auth: {},
}));

vi.mock('../../components/ui', () => ({
  Button: ({ children, isLoading, ...props }: any) => (
    <button data-testid="custom-button" disabled={isLoading} {...props}>
      {isLoading ? 'Loading...' : children}
    </button>
  ),
}));

describe('ForgotPassword Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderForgotPassword = () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <ForgotPassword />
      </MemoryRouter>
    );
    return { user };
  };

  it('matches snapshot', () => {
    const { container } = render(
      <MemoryRouter>
        <ForgotPassword />
      </MemoryRouter>
    );
    expect(container).toMatchSnapshot();
  });

  // Render & Basic UI Elements
  describe('1. Initial Render & UI Elements', () => {
    it('renders the main heading and description', () => {
      renderForgotPassword();
      expect(screen.getByText('Забули пароль?')).toBeInTheDocument();
      expect(
        screen.getByText(/Введіть email, пов'язаний з вашим акаунтом, і ми надішлемо вам посилання/i)
      ).toBeInTheDocument();
    });

    it('renders the email input field with correct placeholder', () => {
      renderForgotPassword();
      const emailInput = screen.getByPlaceholderText('name@example.com');
      expect(emailInput).toBeInTheDocument();
      expect(emailInput).toHaveAttribute('type', 'email');
    });

    it('renders the submit button', () => {
      renderForgotPassword();
      expect(screen.getByRole('button', { name: 'Надіслати посилання' })).toBeInTheDocument();
    });

    it('renders the back to login link', () => {
      renderForgotPassword();
      const backLink = screen.getByText('Повернутися до входу');
      expect(backLink).toBeInTheDocument();
      expect(backLink.closest('a')).toHaveAttribute('href', '/auth');
    });
  });

  // Zod Validation
  describe('2. Form Validation (Zod)', () => {
    it('shows an error when submitting empty email', async () => {
      renderForgotPassword();
      const form = screen.getByRole('button', { name: 'Надіслати посилання' }).closest('form');
      fireEvent.submit(form!);

      expect(await screen.findByText('Некоректний формат email')).toBeInTheDocument();
      expect(sendPasswordResetEmail).not.toHaveBeenCalled();
    });

    it('shows an error for invalid email format', async () => {
      const { user } = renderForgotPassword();
      
      await user.type(screen.getByPlaceholderText('name@example.com'), 'invalid-email-format');
      
      const form = screen.getByRole('button', { name: 'Надіслати посилання' }).closest('form');
      fireEvent.submit(form!);

      expect(await screen.findByText('Некоректний формат email')).toBeInTheDocument();
      expect(sendPasswordResetEmail).not.toHaveBeenCalled();
    });

    it('applies error styling to the input field on validation failure', async () => {
      renderForgotPassword();
      const emailInput = screen.getByPlaceholderText('name@example.com');
      
      const form = screen.getByRole('button', { name: 'Надіслати посилання' }).closest('form');
      fireEvent.submit(form!);
      
      await waitFor(() => {
        expect(emailInput).toHaveClass('border-red-500');
      });
    });
  });

  // Happy Paths
  describe('3. Successful Flows', () => {
    it('calls sendPasswordResetEmail and renders success UI', async () => {
      vi.mocked(sendPasswordResetEmail).mockResolvedValue(undefined);
      const { user } = renderForgotPassword();
      
      await user.type(screen.getByPlaceholderText('name@example.com'), 'user@example.com');
      await user.click(screen.getByRole('button', { name: 'Надіслати посилання' }));
      
      await waitFor(() => {
        expect(sendPasswordResetEmail).toHaveBeenCalledWith(auth, 'user@example.com');
      });

      expect(await screen.findByText('Лист відправлено!')).toBeInTheDocument();
      expect(
        screen.getByText(/Перевірте пошту \(і папку "Спам" про всяк випадок\)/i)
      ).toBeInTheDocument();
      
      expect(screen.queryByPlaceholderText('name@example.com')).not.toBeInTheDocument();
    });
  });

  describe('4. Loading States', () => {
    it('disables submit button and shows loading state during submission', async () => {
      let resolvePromise: (value: any) => void;
      const pendingPromise = new Promise((resolve) => { resolvePromise = resolve; });
      vi.mocked(sendPasswordResetEmail).mockReturnValue(pendingPromise as any);
      
      const { user } = renderForgotPassword();

      await user.type(screen.getByPlaceholderText('name@example.com'), 'test@example.com');
      const submitBtn = screen.getByRole('button', { name: 'Надіслати посилання' });
      await user.click(submitBtn);

      expect(await screen.findByText('Loading...')).toBeInTheDocument();
      expect(submitBtn).toBeDisabled();
      resolvePromise!(undefined);
    });
  });
  describe('5. Firebase Error Handling', () => {
    it('displays error message for "auth/user-not-found"', async () => {
      vi.mocked(sendPasswordResetEmail).mockRejectedValue({ code: 'auth/user-not-found' });
      const { user } = renderForgotPassword();
      
      await user.type(screen.getByPlaceholderText('name@example.com'), 'ghost@example.com');
      await user.click(screen.getByRole('button', { name: 'Надіслати посилання' }));
      
      expect(await screen.findByText('Користувача з таким email не знайдено.')).toBeInTheDocument();
    });

    it('displays generic error message for other Firebase errors', async () => {
      vi.mocked(sendPasswordResetEmail).mockRejectedValue({ code: 'auth/network-request-failed' });
      const { user } = renderForgotPassword();
      
      await user.type(screen.getByPlaceholderText('name@example.com'), 'network@example.com');
      await user.click(screen.getByRole('button', { name: 'Надіслати посилання' }));
      
      expect(await screen.findByText('Сталася помилка. Спробуйте ще раз.')).toBeInTheDocument();
    });

    it('clears previous firebase error when submitting again', async () => {
      vi.mocked(sendPasswordResetEmail).mockRejectedValueOnce({ code: 'auth/user-not-found' });
      const { user } = renderForgotPassword();
      
      await user.type(screen.getByPlaceholderText('name@example.com'), 'fail@example.com');
      await user.click(screen.getByRole('button', { name: 'Надіслати посилання' }));
      
      expect(await screen.findByText('Користувача з таким email не знайдено.')).toBeInTheDocument();
      let resolvePromise: (value: any) => void;
      const pendingPromise = new Promise((resolve) => { resolvePromise = resolve; });
      vi.mocked(sendPasswordResetEmail).mockReturnValueOnce(pendingPromise as any);

      await user.click(screen.getByRole('button', { name: 'Надіслати посилання' }));
      await waitFor(() => {
        expect(screen.queryByText('Користувача з таким email не знайдено.')).not.toBeInTheDocument();
      });

      resolvePromise!(undefined);
    });
  });
});