import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { AuthPage } from './AuthPage'; 

import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signInWithPopup,
} from 'firebase/auth';
import { syncUser } from '../../firebase';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('firebase/auth', () => ({
  signInWithEmailAndPassword: vi.fn(),
  createUserWithEmailAndPassword: vi.fn(),
  updateProfile: vi.fn(),
  signInWithPopup: vi.fn(),
  getAuth: vi.fn(),
}));

vi.mock('../../firebase', () => ({
  auth: {},
  google: {},
  syncUser: vi.fn(),
}));

vi.mock('@lottiefiles/react-lottie-player', () => ({
  Player: () => <div data-testid="lottie-player">Lottie Animation</div>,
}));

vi.mock('../../components/ui', () => ({
  Button: ({ children, isLoading, leftIcon, ...props }: any) => (
    <button data-testid="custom-button" disabled={isLoading} {...props}>
      {isLoading ? 'Loading...' : children}
      {leftIcon && <span data-testid="left-icon">Icon</span>}
    </button>
  ),
}));

describe('AuthPage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderAuthPage = () => render(<MemoryRouter><AuthPage /></MemoryRouter>);
  const submitFormByButtonName = (buttonName: string | RegExp) => {
    const button = screen.getByRole('button', { name: buttonName });
    const form = button.closest('form');
    if (form) fireEvent.submit(form);
  };

  //Render & Basic UI Elements
  describe('1. Initial Render & UI Elements', () => {
    it('renders the registration form by default', () => {
      renderAuthPage();
      expect(screen.getByText('Створити акаунт')).toBeInTheDocument();
      expect(screen.getByText('Нікнейм')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Наприклад, izachoc')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Зареєструватись' })).toBeInTheDocument();
    });

    it('renders Lottie animation and static text content', () => {
      renderAuthPage();
      expect(screen.getByTestId('lottie-player')).toBeInTheDocument();
      expect(screen.getByText(/Твоя історія починається тут/i)).toBeInTheDocument();
    });

    it('renders the Google sign-in button with its icon', () => {
      renderAuthPage();
      expect(screen.getByRole('button', { name: /Вхід через Google/i })).toBeInTheDocument();
      expect(screen.getByTestId('left-icon')).toBeInTheDocument();
    });
  });

  // Mode Switching (Login / Register)
  describe('2. Auth Mode Switching', () => {
    it('switches to Login mode and updates text headings', async () => {
      renderAuthPage();
      fireEvent.click(screen.getByRole('button', { name: 'Вхід' }));
      
      expect(await screen.findByText('З поверненням!')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Увійти' })).toBeInTheDocument();
    });

    it('hides the Display Name input when switching to Login mode', async () => {
      renderAuthPage();
      fireEvent.click(screen.getByRole('button', { name: 'Вхід' }));
      
      await waitFor(() => {
        expect(screen.queryByPlaceholderText('Наприклад, izachoc')).not.toBeInTheDocument();
      });
    });

    it('displays "Forgot Password?" link exclusively in Login mode', () => {
      renderAuthPage();
      const forgotLink = screen.getByText('Забули пароль?');
      expect(forgotLink).toHaveClass('opacity-0 pointer-events-none');

      fireEvent.click(screen.getByRole('button', { name: 'Вхід' }));
      expect(forgotLink).toHaveClass('opacity-100');
    });
  });

  //Password Input
  describe('3. Password Input Interaction', () => {
    it('toggles password visibility on eye icon click', () => {
      renderAuthPage();
      const passwordInput = screen.getByPlaceholderText('Мінімум 8 символів');
      const toggleBtn = passwordInput.nextElementSibling as HTMLButtonElement;
      
      expect(passwordInput).toHaveAttribute('type', 'password');
      
      fireEvent.click(toggleBtn);
      expect(passwordInput).toHaveAttribute('type', 'text');
      
      fireEvent.click(toggleBtn);
      expect(passwordInput).toHaveAttribute('type', 'password');
    });

    it('updates input border color dynamically based on password length', () => {
      renderAuthPage();
      const passwordInput = screen.getByPlaceholderText('Мінімум 8 символів');
      
      fireEvent.change(passwordInput, { target: { value: '123' } });
      expect(passwordInput).toHaveClass('border-red-500');

      fireEvent.change(passwordInput, { target: { value: '12345678' } });
      expect(passwordInput).toHaveClass('border-indigo-500');
    });
  });

  // Zod Validation
  describe('4. Form Validation (Zod)', () => {
    it('prevents submission and shows errors for empty registration fields', async () => {
      renderAuthPage();
      submitFormByButtonName('Зареєструватись');
      
      expect(await screen.findByText("Нікнейм обов'язковий (мінімум 2 символи)")).toBeInTheDocument();
      expect(await screen.findByText('Некоректний формат email')).toBeInTheDocument();
      expect(await screen.findByText('Мінімум 8 символів')).toBeInTheDocument();
      expect(createUserWithEmailAndPassword).not.toHaveBeenCalled();
    });

    it('shows an error if Display Name is shorter than 2 characters', async () => {
      renderAuthPage();
      fireEvent.change(screen.getByPlaceholderText('Наприклад, izachoc'), { target: { value: 'A' } });
      submitFormByButtonName('Зареєструватись');
      
      expect(await screen.findByText("Нікнейм обов'язковий (мінімум 2 символи)")).toBeInTheDocument();
    });

    it('shows an error on invalid email format', async () => {
      renderAuthPage();
      fireEvent.change(screen.getByPlaceholderText('name@example.com'), { target: { value: 'invalid-email' } });
      submitFormByButtonName('Зареєструватись');
      
      expect(await screen.findByText('Некоректний формат email')).toBeInTheDocument();
    });
  });

  // Happy Paths
  describe('5. Successful Auth Flows', () => {
    it('successfully registers a user, updates profile, and redirects', async () => {
      const mockUser = { uid: 'user-777' };
      vi.mocked(createUserWithEmailAndPassword).mockResolvedValue({ user: mockUser } as any);
      
      renderAuthPage();
      fireEvent.change(screen.getByPlaceholderText('Наприклад, izachoc'), { target: { value: 'SuperDev' } });
      fireEvent.change(screen.getByPlaceholderText('name@example.com'), { target: { value: 'super@test.com' } });
      fireEvent.change(screen.getByPlaceholderText('Мінімум 8 символів'), { target: { value: 'strongPass1' } });
      submitFormByButtonName('Зареєструватись');
      
      await waitFor(() => {
        expect(createUserWithEmailAndPassword).toHaveBeenCalledWith(expect.anything(), 'super@test.com', 'strongPass1');
        expect(updateProfile).toHaveBeenCalledWith(mockUser, { displayName: 'SuperDev' });
        expect(syncUser).toHaveBeenCalledWith(mockUser);
        expect(mockNavigate).toHaveBeenCalledWith('/');
      });
    });

    it('successfully logs in an existing user and redirects', async () => {
      vi.mocked(signInWithEmailAndPassword).mockResolvedValue({} as any);
      renderAuthPage();
      
      fireEvent.click(screen.getByRole('button', { name: 'Вхід' }));
      fireEvent.change(screen.getByPlaceholderText('name@example.com'), { target: { value: 'old@user.com' } });
      fireEvent.change(screen.getByPlaceholderText('Мінімум 8 символів'), { target: { value: 'myPassword8' } });
      submitFormByButtonName('Увійти');
      
      await waitFor(() => {
        expect(signInWithEmailAndPassword).toHaveBeenCalledWith(expect.anything(), 'old@user.com', 'myPassword8');
        expect(mockNavigate).toHaveBeenCalledWith('/');
      });
    });
  });

  // Firebase Server Errors
  describe('6. Firebase Error Handling', () => {
    it('displays a specific error message for "auth/email-already-in-use"', async () => {
      vi.mocked(createUserWithEmailAndPassword).mockRejectedValue({ code: 'auth/email-already-in-use' });
      renderAuthPage();
      
      fireEvent.change(screen.getByPlaceholderText('Наприклад, izachoc'), { target: { value: 'Dev' } });
      fireEvent.change(screen.getByPlaceholderText('name@example.com'), { target: { value: 'exist@test.com' } });
      fireEvent.change(screen.getByPlaceholderText('Мінімум 8 символів'), { target: { value: '12345678' } });
      submitFormByButtonName('Зареєструватись');
      
      expect(await screen.findByText('Цей email вже використовується.')).toBeInTheDocument();
    });

    it('displays a specific error message for "auth/wrong-password" during login', async () => {
      vi.mocked(signInWithEmailAndPassword).mockRejectedValue({ code: 'auth/wrong-password' });
      renderAuthPage();
      
      fireEvent.click(screen.getByRole('button', { name: 'Вхід' }));
      fireEvent.change(screen.getByPlaceholderText('name@example.com'), { target: { value: 'a@a.com' } });
      fireEvent.change(screen.getByPlaceholderText('Мінімум 8 символів'), { target: { value: '12345678' } });
      submitFormByButtonName('Увійти');
      
      expect(await screen.findByText('Невірний email або пароль.')).toBeInTheDocument();
    });

    it('displays a generic error message for unknown Firebase errors', async () => {
      vi.mocked(createUserWithEmailAndPassword).mockRejectedValue({ code: 'auth/too-many-requests' });
      renderAuthPage();
      
      fireEvent.change(screen.getByPlaceholderText('Наприклад, izachoc'), { target: { value: 'Dev' } });
      fireEvent.change(screen.getByPlaceholderText('name@example.com'), { target: { value: 'a@a.com' } });
      fireEvent.change(screen.getByPlaceholderText('Мінімум 8 символів'), { target: { value: '12345678' } });
      submitFormByButtonName('Зареєструватись');
      
      expect(await screen.findByText('Сталася помилка. Спробуйте ще раз.')).toBeInTheDocument();
    });

    it('clears server error messages when toggling between Login and Register modes', async () => {
      vi.mocked(createUserWithEmailAndPassword).mockRejectedValue({ code: 'auth/email-already-in-use' });
      renderAuthPage();
      
      fireEvent.change(screen.getByPlaceholderText('Наприклад, izachoc'), { target: { value: 'Dev' } });
      fireEvent.change(screen.getByPlaceholderText('name@example.com'), { target: { value: 'a@a.com' } });
      fireEvent.change(screen.getByPlaceholderText('Мінімум 8 символів'), { target: { value: '12345678' } });
      submitFormByButtonName('Зареєструватись');
      
      expect(await screen.findByText('Цей email вже використовується.')).toBeInTheDocument();

      fireEvent.click(screen.getByRole('button', { name: 'Вхід' }));
      expect(screen.queryByText('Цей email вже використовується.')).not.toBeInTheDocument();
    });
  });

  //Google Sign-In
  describe('7. Google Authentication', () => {
    it('successfully authenticates via Google popup and redirects', async () => {
      vi.mocked(signInWithPopup).mockResolvedValue({} as any);
      renderAuthPage();
      
      fireEvent.click(screen.getByRole('button', { name: /Вхід через Google/i }));
      
      await waitFor(() => {
        expect(signInWithPopup).toHaveBeenCalled();
        expect(mockNavigate).toHaveBeenCalledWith('/');
      });
    });

    it('catches and logs Google Sign-In exceptions without crashing', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      vi.mocked(signInWithPopup).mockRejectedValue(new Error('Popup closed'));
      
      renderAuthPage();
      fireEvent.click(screen.getByRole('button', { name: /Вхід через Google/i }));
      
      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith("Google Sign-In Error:", expect.any(Error));
      });
      
      consoleSpy.mockRestore();
    });
  });
});