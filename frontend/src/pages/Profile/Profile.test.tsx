import { render, screen, fireEvent } from '@testing-library/react';
import { useSelector } from 'react-redux';
import { describe, it, expect, vi, beforeEach } from 'vitest';
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

vi.mock('./EditProfileModal', () => ({
  EditProfileModal: ({ isOpen }: { isOpen: boolean }) => (
    isOpen ? <div data-testid="edit-profile-modal">Модалка відкрита</div> : null
  ),
}));

const mockUserFull = {
  displayName: 'Супер Хакер',
  email: 'hacker777@example.com',
  telegram: '@hacker777',
  github: 'hacker777',
  discord: 'hacker#7777',
};

const mockUserPartial = {
  displayName: 'Тестер',
};

describe('Profile Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useMutation).mockReturnValue({ mutate: vi.fn() } as any);
  });

  it('renders correctly and matches snapshot', () => {
    vi.mocked(useSelector).mockReturnValue(mockUserFull);
    const { container } = render(<Profile />);
    expect(container).toMatchSnapshot();
  });

  it('shows "Loading..." when user is null', () => {
    vi.mocked(useSelector).mockReturnValue(null);
    render(<Profile />);
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('calls delete mutation on delete button click', () => {
    const mockMutate = vi.fn();
    vi.mocked(useMutation).mockReturnValue({ mutate: mockMutate } as any);
    vi.mocked(useSelector).mockReturnValue(mockUserFull);
    render(<Profile />);
    
    fireEvent.click(screen.getByText("Видалити профіль"));
    expect(mockMutate).toHaveBeenCalled();
  });

  it('opens edit modal on edit button click', () => {
    vi.mocked(useSelector).mockReturnValue(mockUserFull);
    render(<Profile />);
    
    expect(screen.queryByTestId('edit-profile-modal')).not.toBeInTheDocument();
    fireEvent.click(screen.getByText("Редагувати профіль"));
    expect(screen.getByTestId('edit-profile-modal')).toBeInTheDocument();
  });

  it('displays user name and role', () => {
    vi.mocked(useSelector).mockReturnValue(mockUserFull);
    render(<Profile />);
    
    expect(screen.getByText('Супер Хакер')).toBeInTheDocument();
    expect(screen.getByText('Роль: Користувач')).toBeInTheDocument();
  });

  it('displays correct contact details when available', () => {
    vi.mocked(useSelector).mockReturnValue(mockUserFull);
    render(<Profile />);
    
    expect(screen.getByText('hacker777@example.com')).toBeInTheDocument();
    expect(screen.getByText('@hacker777')).toBeInTheDocument();
    expect(screen.getByText('hacker777')).toBeInTheDocument();
    expect(screen.getByText('hacker#7777')).toBeInTheDocument();
  });

  it('displays "Відсутній" for missing contact details', () => {
    vi.mocked(useSelector).mockReturnValue(mockUserPartial);
    render(<Profile />);
    
    const missingBadges = screen.getAllByText('Відсутній');
    expect(missingBadges).toHaveLength(4);
  });

  it('displays tournament and team lists', () => {
    vi.mocked(useSelector).mockReturnValue(mockUserFull);
    render(<Profile />);
    
    expect(screen.getByText('Напишіть Ядро Лінукс')).toBeInTheDocument();
    expect(screen.getByText('Шалені програмісти')).toBeInTheDocument();
    expect(screen.getByText('Лінус Торвальдс')).toBeInTheDocument();
  });
});