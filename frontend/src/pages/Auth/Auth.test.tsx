import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { AuthPage } from './AuthPage';
import SignOut from './SignOut';

import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signInWithPopup,
  signOut,
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
  signOut: vi.fn(),
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

  const renderAuthPage = () => {
    const user = userEvent.setup();
    render(<MemoryRouter><AuthPage /></MemoryRouter>);
    return { user };
  };

  // Render & Basic UI Elements
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

    it('renders Terms and Privacy Policy links', () => {
      renderAuthPage();
      expect(screen.getByText('Умовами використання')).toBeInTheDocument();
      expect(screen.getByText('Політикою конфіденційності')).toBeInTheDocument();
    });

    it('renders inputs with correct default attributes', () => {
      renderAuthPage();
      expect(screen.getByPlaceholderText('name@example.com')).toHaveAttribute('type', 'email');
      expect(screen.getByPlaceholderText('Наприклад, izachoc')).toHaveAttribute('type', 'text');
    });
  });

  // Mode Switching (Login / Register)
  describe('2. Auth Mode Switching', () => {
    it('switches to Login mode and updates text headings', async () => {
      const { user } = renderAuthPage();
      await user.click(screen.getByRole('button', { name: 'Вхід' }));
      
      expect(await screen.findByText('З поверненням!')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Увійти' })).toBeInTheDocument();
    });

    it('hides the Display Name input when switching to Login mode', async () => {
      const { user } = renderAuthPage();
      await user.click(screen.getByRole('button', { name: 'Вхід' }));
      
      await waitFor(() => {
        expect(screen.queryByPlaceholderText('Наприклад, izachoc')).not.toBeInTheDocument();
      });
    });

    it('displays "Forgot Password?" link exclusively in Login mode', async () => {
      const { user } = renderAuthPage();
      const forgotLink = screen.getByText('Забули пароль?');
      expect(forgotLink).toHaveClass('opacity-0 pointer-events-none');

      await user.click(screen.getByRole('button', { name: 'Вхід' }));
      expect(forgotLink).toHaveClass('opacity-100');
    });

    it('clears firebase error when toggling modes', async () => {
      vi.mocked(createUserWithEmailAndPassword).mockRejectedValue({ code: 'auth/email-already-in-use' });
      const { user } = renderAuthPage();
      
      await user.type(screen.getByPlaceholderText('Наприклад, izachoc'), 'Dev');
      await user.type(screen.getByPlaceholderText('name@example.com'), 'test@test.com');
      await user.type(screen.getByPlaceholderText('Мінімум 8 символів'), '12345678');
      await user.click(screen.getByRole('button', { name: 'Зареєструватись' }));
      
      expect(await screen.findByText('Цей email вже використовується.')).toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: 'Вхід' }));
      expect(screen.queryByText('Цей email вже використовується.')).not.toBeInTheDocument();
    });
  });

  // Password Input Interaction
  describe('3. Password Input Interaction', () => {
    it('toggles password visibility on eye icon click', async () => {
      const { user } = renderAuthPage();
      const passwordInput = screen.getByPlaceholderText('Мінімум 8 символів');
      const toggleBtn = passwordInput.nextElementSibling as HTMLButtonElement;
      
      expect(passwordInput).toHaveAttribute('type', 'password');
      
      await user.click(toggleBtn);
      expect(passwordInput).toHaveAttribute('type', 'text');
      
      await user.click(toggleBtn);
      expect(passwordInput).toHaveAttribute('type', 'password');
    });

    it('updates input border color dynamically based on password length', async () => {
      const { user } = renderAuthPage();
      const passwordInput = screen.getByPlaceholderText('Мінімум 8 символів');
      
      await user.type(passwordInput, '123');
      expect(passwordInput).toHaveClass('border-red-500');

      await user.type(passwordInput, '45678');
      expect(passwordInput).toHaveClass('border-indigo-500');
    });

    it('retains typed password when toggling visibility', async () => {
      const { user } = renderAuthPage();
      const passwordInput = screen.getByPlaceholderText('Мінімум 8 символів');
      const toggleBtn = passwordInput.nextElementSibling as HTMLButtonElement;

      await user.type(passwordInput, 'secret123');
      await user.click(toggleBtn);
      
      expect(passwordInput).toHaveValue('secret123');
    });
  });

  // Zod Validation
  describe('4. Form Validation (Zod)', () => {
    it('prevents submission and shows errors for empty registration fields', async () => {
      const { user } = renderAuthPage();
      await user.click(screen.getByRole('button', { name: 'Зареєструватись' }));
      
      expect(await screen.findByText("Нікнейм обов'язковий (мінімум 2 символи)")).toBeInTheDocument();
      expect(await screen.findByText('Некоректний формат email')).toBeInTheDocument();
      expect(await screen.findByText('Мінімум 8 символів')).toBeInTheDocument();
      expect(createUserWithEmailAndPassword).not.toHaveBeenCalled();
    });

    it('shows an error if Display Name is shorter than 2 characters', async () => {
      const { user } = renderAuthPage();
      await user.type(screen.getByPlaceholderText('Наприклад, izachoc'), 'A');
      await user.click(screen.getByRole('button', { name: 'Зареєструватись' }));
      
      expect(await screen.findByText("Нікнейм обов'язковий (мінімум 2 символи)")).toBeInTheDocument();
    });

    it('rejects display name with only whitespaces', async () => {
      renderAuthPage();
      const nameInput = screen.getByPlaceholderText('Наприклад, izachoc');
      
      fireEvent.change(nameInput, { target: { value: ' ' } });
      
      const submitBtn = screen.getByRole('button', { name: /зареєструватись/i });
      fireEvent.click(submitBtn);

      expect(await screen.findByText(/нікнейм обов'язковий/i)).toBeInTheDocument();
    });
    
    it('shows an error on invalid email format', async () => {
      const { user } = renderAuthPage();
      await user.type(screen.getByPlaceholderText('name@example.com'), 'invalid-email');
      const form = screen.getByRole('button', { name: 'Зареєструватись' }).closest('form');
      fireEvent.submit(form!);
      
      expect(await screen.findByText('Некоректний формат email')).toBeInTheDocument();
    });

    it('shows error for exactly 7 characters in password', async () => {
      const { user } = renderAuthPage();
      await user.type(screen.getByPlaceholderText('Мінімум 8 символів'), '1234567');
      await user.click(screen.getByRole('button', { name: 'Зареєструватись' }));

      expect(await screen.findByText('Мінімум 8 символів')).toBeInTheDocument();
    });

    it('accepts exactly 8 characters in password without errors', async () => {
      const { user } = renderAuthPage();
      await user.click(screen.getByRole('button', { name: 'Вхід' })); 
      await user.type(screen.getByPlaceholderText('name@example.com'), 'test@test.com');
      await user.type(screen.getByPlaceholderText('Мінімум 8 символів'), '12345678');
      await user.click(screen.getByRole('button', { name: 'Увійти' }));

      await waitFor(() => {
        expect(screen.queryByText('Мінімум 8 символів')).not.toBeInTheDocument();
      });
    });
  });

  // Happy Paths
  describe('5. Successful Auth Flows', () => {
    it('successfully registers a user, updates profile, and redirects', async () => {
      const mockUser = { uid: 'user-777' };
      vi.mocked(createUserWithEmailAndPassword).mockResolvedValue({ user: mockUser } as any);
      
      const { user } = renderAuthPage();
      await user.type(screen.getByPlaceholderText('Наприклад, izachoc'), 'SuperDev');
      await user.type(screen.getByPlaceholderText('name@example.com'), 'super@test.com');
      await user.type(screen.getByPlaceholderText('Мінімум 8 символів'), 'strongPass1');
      await user.click(screen.getByRole('button', { name: 'Зареєструватись' }));
      
      await waitFor(() => {
        expect(createUserWithEmailAndPassword).toHaveBeenCalledWith(expect.anything(), 'super@test.com', 'strongPass1');
        expect(updateProfile).toHaveBeenCalledWith(mockUser, { displayName: 'SuperDev' });
        expect(syncUser).toHaveBeenCalledWith(mockUser);
        expect(mockNavigate).toHaveBeenCalledWith('/');
      });
    });

    it('successfully logs in an existing user and redirects', async () => {
      vi.mocked(signInWithEmailAndPassword).mockResolvedValue({} as any);
      const { user } = renderAuthPage();
      
      await user.click(screen.getByRole('button', { name: 'Вхід' }));
      await user.type(screen.getByPlaceholderText('name@example.com'), 'old@user.com');
      await user.type(screen.getByPlaceholderText('Мінімум 8 символів'), 'myPassword8');
      await user.click(screen.getByRole('button', { name: 'Увійти' }));
      
      await waitFor(() => {
        expect(signInWithEmailAndPassword).toHaveBeenCalledWith(expect.anything(), 'old@user.com', 'myPassword8');
        expect(mockNavigate).toHaveBeenCalledWith('/');
      });
    });
  });

  // Loading States
  describe('6. Loading States', () => {
    it('disables submit button and shows loading state during login', async () => {
      let resolvePromise: (value: any) => void;
      const pendingPromise = new Promise((resolve) => { resolvePromise = resolve; });
      vi.mocked(signInWithEmailAndPassword).mockReturnValue(pendingPromise as any);
      
      const { user } = renderAuthPage();

      await user.click(screen.getByRole('button', { name: 'Вхід' }));
      await user.type(screen.getByPlaceholderText('name@example.com'), 'test@test.com');
      await user.type(screen.getByPlaceholderText('Мінімум 8 символів'), '12345678');
      
      const submitBtn = screen.getByRole('button', { name: 'Увійти' });
      await user.click(submitBtn);

      expect(await screen.findByText('Loading...')).toBeInTheDocument();
      expect(submitBtn).toBeDisabled();

      resolvePromise!({});
    });

    it('disables submit button and shows loading state during registration', async () => {
      let resolvePromise: (value: any) => void;
      const pendingPromise = new Promise((resolve) => { resolvePromise = resolve; });
      vi.mocked(createUserWithEmailAndPassword).mockReturnValue(pendingPromise as any);
      
      const { user } = renderAuthPage();

      await user.type(screen.getByPlaceholderText('Наприклад, izachoc'), 'Dev');
      await user.type(screen.getByPlaceholderText('name@example.com'), 'test@test.com');
      await user.type(screen.getByPlaceholderText('Мінімум 8 символів'), '12345678');
      
      const submitBtn = screen.getByRole('button', { name: 'Зареєструватись' });
      await user.click(submitBtn);

      expect(await screen.findByText('Loading...')).toBeInTheDocument();
      expect(submitBtn).toBeDisabled();

      resolvePromise!({});
    });
  });

  // Firebase Server Errors
  describe('7. Firebase Error Handling', () => {
    it('displays error message for "auth/email-already-in-use"', async () => {
      vi.mocked(createUserWithEmailAndPassword).mockRejectedValue({ code: 'auth/email-already-in-use' });
      const { user } = renderAuthPage();
      
      await user.type(screen.getByPlaceholderText('Наприклад, izachoc'), 'Dev');
      await user.type(screen.getByPlaceholderText('name@example.com'), 'exist@test.com');
      await user.type(screen.getByPlaceholderText('Мінімум 8 символів'), '12345678');
      await user.click(screen.getByRole('button', { name: 'Зареєструватись' }));
      
      expect(await screen.findByText('Цей email вже використовується.')).toBeInTheDocument();
    });

    it('displays error message for "auth/wrong-password" during login', async () => {
      vi.mocked(signInWithEmailAndPassword).mockRejectedValue({ code: 'auth/wrong-password' });
      const { user } = renderAuthPage();
      
      await user.click(screen.getByRole('button', { name: 'Вхід' }));
      await user.type(screen.getByPlaceholderText('name@example.com'), 'a@a.com');
      await user.type(screen.getByPlaceholderText('Мінімум 8 символів'), '12345678');
      await user.click(screen.getByRole('button', { name: 'Увійти' }));
      
      expect(await screen.findByText('Невірний email або пароль.')).toBeInTheDocument();
    });

    it('displays error message for "auth/invalid-credential" during login', async () => {
      vi.mocked(signInWithEmailAndPassword).mockRejectedValue({ code: 'auth/invalid-credential' });
      const { user } = renderAuthPage();
      
      await user.click(screen.getByRole('button', { name: 'Вхід' }));
      await user.type(screen.getByPlaceholderText('name@example.com'), 'a@a.com');
      await user.type(screen.getByPlaceholderText('Мінімум 8 символів'), '12345678');
      await user.click(screen.getByRole('button', { name: 'Увійти' }));
      
      expect(await screen.findByText('Невірний email або пароль.')).toBeInTheDocument();
    });

    it('displays a generic error message for unknown Firebase errors', async () => {
      vi.mocked(createUserWithEmailAndPassword).mockRejectedValue({ code: 'auth/too-many-requests' });
      const { user } = renderAuthPage();
      
      await user.type(screen.getByPlaceholderText('Наприклад, izachoc'), 'Dev');
      await user.type(screen.getByPlaceholderText('name@example.com'), 'a@a.com');
      await user.type(screen.getByPlaceholderText('Мінімум 8 символів'), '12345678');
      await user.click(screen.getByRole('button', { name: 'Зареєструватись' }));
      
      expect(await screen.findByText('Сталася помилка. Спробуйте ще раз.')).toBeInTheDocument();
    });

    it('handles unexpected errors gracefully during registration profile update', async () => {
      const mockUser = { uid: 'user-error' };
      vi.mocked(createUserWithEmailAndPassword).mockResolvedValue({ user: mockUser } as any);
      vi.mocked(updateProfile).mockRejectedValue(new Error('Profile update failed'));

      const { user } = renderAuthPage();
      
      await user.type(screen.getByPlaceholderText('Наприклад, izachoc'), 'Dev');
      await user.type(screen.getByPlaceholderText('name@example.com'), 'a@a.com');
      await user.type(screen.getByPlaceholderText('Мінімум 8 символів'), '12345678');
      await user.click(screen.getByRole('button', { name: 'Зареєструватись' }));

      expect(await screen.findByText('Сталася помилка. Спробуйте ще раз.')).toBeInTheDocument();
    });
  });

  // Google Sign-In
  describe('8. Google Authentication', () => {
    it('successfully authenticates via Google popup and redirects', async () => {
      vi.mocked(signInWithPopup).mockResolvedValue({} as any);
      const { user } = renderAuthPage();
      
      await user.click(screen.getByRole('button', { name: /Вхід через Google/i }));
      
      await waitFor(() => {
        expect(signInWithPopup).toHaveBeenCalled();
        expect(mockNavigate).toHaveBeenCalledWith('/');
      });
    });

    it('catches and logs Google Sign-In exceptions without crashing', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      vi.mocked(signInWithPopup).mockRejectedValue(new Error('Popup closed'));
      
      const { user } = renderAuthPage();
      await user.click(screen.getByRole('button', { name: /Вхід через Google/i }));
      
      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith("Google Sign-In Error:", expect.any(Error));
      });
      
      consoleSpy.mockRestore();
    });
  });
});

describe('SignOut Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderSignOut = () => render(<MemoryRouter><SignOut /></MemoryRouter>);

  it('calls signOut and redirects to home on successful logout', async () => {
    vi.mocked(signOut).mockResolvedValue(undefined);
    renderSignOut();

    await waitFor(() => {
      expect(signOut).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true });
    });
  });
});