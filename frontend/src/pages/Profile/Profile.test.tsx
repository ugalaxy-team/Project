import { render, screen, fireEvent } from '@testing-library/react';
import { useSelector } from 'react-redux';
import { describe, it, expect, vi } from 'vitest';
import { Profile } from './Profile';
import { useMutation } from '@tanstack/react-query';

vi.mock('react-redux', () => ({
  useSelector: vi.fn(),
}));

vi.mock('@tanstack/react-query', () => ({
  useMutation: vi.fn(),
}));

vi.mock('../../firebase', () => ({
  auth: {
    currentUser: { uid: '123' },
    updateCurrentUser: vi.fn(),
  },
}));

describe('Profile Component', () => {

  it('renders correctly and matches snapshot', () => {
    vi.mocked(useSelector).mockReturnValue({ displayName: 'Тестер' });
    const { container } = render(<Profile />);
    expect(container).toMatchSnapshot();
  });

  it('shows "Loading..." when user is null', () => {
    vi.mocked(useSelector).mockReturnValue(null);
    render(<Profile />);
    const loadingText = screen.getByText(/loading/i);
    expect(loadingText).toBeInTheDocument();
  });

  it('calls delete mutation on delete button click', () => {
    const mockMutate = vi.fn();
    vi.mocked(useMutation).mockReturnValue({ mutate: mockMutate } as any);
    vi.mocked(useSelector).mockReturnValue({ displayName: 'Тестер' });
    render(<Profile />);
    const deleteButton = screen.getByText("Видалити профіль");
    fireEvent.click(deleteButton);
    expect(mockMutate).toHaveBeenCalled();
  });

  it('displays user name and role', () => {
    vi.mocked(useSelector).mockReturnValue({ displayName: 'Супер Хакер' });
    render(<Profile />);
    expect(screen.getByText('Супер Хакер')).toBeInTheDocument();
    expect(screen.getByText('Роль: Користувач')).toBeInTheDocument();
  });

  it('displays correct contact details', () => {
    vi.mocked(useSelector).mockReturnValue({ displayName: 'Тестер' });
    render(<Profile />);
    const emailLink = screen.getByRole('link', { name: 'hacker777@example.com' });
    expect(emailLink).toBeInTheDocument();
    expect(emailLink).toHaveAttribute('href', 'mailto:hacker777@example.com');
    expect(screen.getByText('hacker777')).toBeInTheDocument();
  });

  it('displays tournament and team lists', () => {
    vi.mocked(useSelector).mockReturnValue({ displayName: 'Тестер' });
    render(<Profile />);
    expect(screen.getByText('Турніри')).toBeInTheDocument();
    expect(screen.getByText('Команди')).toBeInTheDocument();
    expect(screen.getByText('Напишіть Ядро Лінукс')).toBeInTheDocument();
    expect(screen.getByText('Шалені програмісти')).toBeInTheDocument();
    expect(screen.getByText('Лінус Торвальдс')).toBeInTheDocument();
  });
});