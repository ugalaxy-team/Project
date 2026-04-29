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

vi.mock('../../store', () => ({
  store: {
    dispatch: vi.fn(),
  },
}));

vi.mock('@/api/requests', () => ({
  deleteUser: vi.fn(),
}));

vi.mock('@/slices/user', () => ({
  setUser: vi.fn(),
}));

vi.mock('./EditProfileModal', () => ({
  EditProfileModal: ({ isOpen }: { isOpen: boolean }) => (
    isOpen ? <div data-testid="edit-profile-modal">Modal Open</div> : null
  ),
}));

const mockUserFull = {
  displayName: 'Super Hacker',
  email: 'hacker777@example.com',
  telegram: '@hacker777',
  github: 'hacker777',
  discord: 'hacker#7777',
  roles: [{ display_name: 'Admin' }, { name: 'manager' }],
};

const mockUserFallbackName = {
  full_name: 'Fallback Name',
  roles: [],
};

const mockUserPartial = {
  displayName: 'Tester',
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

  it('displays loading state when user is null', () => {
    vi.mocked(useSelector).mockReturnValue(null);
    render(<Profile />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('calls delete mutation on delete button click', () => {
    const mockMutate = vi.fn();
    vi.mocked(useMutation).mockReturnValue({ mutate: mockMutate } as any);
    vi.mocked(useSelector).mockReturnValue(mockUserFull);
    render(<Profile />);
    
    fireEvent.click(screen.getByText('Видалити'));
    expect(mockMutate).toHaveBeenCalled();
  });

  it('opens edit modal on edit button click', () => {
    vi.mocked(useSelector).mockReturnValue(mockUserFull);
    render(<Profile />);
    
    expect(screen.queryByTestId('edit-profile-modal')).not.toBeInTheDocument();
    fireEvent.click(screen.getByText('Редагувати профіль'));
    expect(screen.getByTestId('edit-profile-modal')).toBeInTheDocument();
  });

  it('displays user name and roles correctly', () => {
    vi.mocked(useSelector).mockReturnValue(mockUserFull);
    render(<Profile />);
    
    expect(screen.getByText('Super Hacker')).toBeInTheDocument();
    expect(screen.getByText('Роль: Admin, manager')).toBeInTheDocument();
  });

  it('displays fallback full_name and no roles message', () => {
    vi.mocked(useSelector).mockReturnValue(mockUserFallbackName);
    render(<Profile />);
    
    expect(screen.getByText('Fallback Name')).toBeInTheDocument();
    expect(screen.getByText('Роль: Немає ролей')).toBeInTheDocument();
  });

  it('displays correct contact details when available', () => {
    vi.mocked(useSelector).mockReturnValue(mockUserFull);
    render(<Profile />);
    
    expect(screen.getByText('hacker777@example.com')).toBeInTheDocument();
    expect(screen.getByText('@hacker777')).toBeInTheDocument();
    expect(screen.getByText('hacker777')).toBeInTheDocument();
    expect(screen.getByText('hacker#7777')).toBeInTheDocument();
  });

  it('displays missing state for missing contact details', () => {
    vi.mocked(useSelector).mockReturnValue(mockUserPartial);
    render(<Profile />);
    
    const missingBadges = screen.getAllByText('Відсутній');
    expect(missingBadges).toHaveLength(4);
  });

  it('displays tournament and team lists correctly', () => {
    vi.mocked(useSelector).mockReturnValue(mockUserFull);
    render(<Profile />);
    
    expect(screen.getByText('Напишіть Ядро Лінукс')).toBeInTheDocument();
    expect(screen.getByText('Напишіть свою мову програмування')).toBeInTheDocument();
    expect(screen.getByText('Напишіть гру на JS')).toBeInTheDocument();
  });
});