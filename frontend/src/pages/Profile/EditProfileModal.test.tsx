import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useSelector } from 'react-redux';
import { useMutation } from '@tanstack/react-query';
import { EditProfileModal } from './EditProfileModal';
import { store } from '../../store';

vi.mock('react-redux', () => ({
  useSelector: vi.fn(),
}));

vi.mock('../../store', () => ({
  store: { dispatch: vi.fn() },
}));

vi.mock('@/firebase', () => ({
  auth: { currentUser: { uid: 'user-123' } },
}));

vi.mock('@tanstack/react-query', () => ({
  useMutation: vi.fn(),
}));

const mockUser = {
  uid: 'user-123',
  displayName: 'Супер Хакер',
  telegram: '@hacker',
  github: 'hacker777',
  discord: 'hacker#7777',
};

describe('EditProfileModal Component', () => {
  const mockOnClose = vi.fn();
  let mutationConfig: any;
  let mockMutate: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockMutate = vi.fn();

    vi.mocked(useMutation).mockImplementation((config) => {
      mutationConfig = config;
      return {
        mutate: mockMutate,
        isPending: false,
      } as any;
    });

    vi.mocked(useSelector).mockReturnValue(mockUser);
  });

  it('does not render anything when isOpen is false', () => {
    const { container } = render(<EditProfileModal isOpen={false} onClose={mockOnClose} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders correctly and populates form with existing user data', () => {
    render(<EditProfileModal isOpen={true} onClose={mockOnClose} />);
    
    expect(screen.getByDisplayValue('Супер Хакер')).toBeInTheDocument();
    expect(screen.getByDisplayValue('@hacker')).toBeInTheDocument();
    expect(screen.getByDisplayValue('hacker777')).toBeInTheDocument();
    expect(screen.getByDisplayValue('hacker#7777')).toBeInTheDocument();
  });

  it('updates local state when user types in inputs', () => {
    render(<EditProfileModal isOpen={true} onClose={mockOnClose} />);
    
    const nameInput = screen.getByDisplayValue('Супер Хакер');
    fireEvent.change(nameInput, { target: { value: 'Нове Ім\'я', name: 'full_name' } });
    
    expect(nameInput).toHaveValue('Нове Ім\'я');
  });

  it('calls onClose when close button (x) or cancel button is clicked', () => {
    render(<EditProfileModal isOpen={true} onClose={mockOnClose} />);
    
    fireEvent.click(screen.getByText('×'));
    expect(mockOnClose).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByText('Скасувати'));
    expect(mockOnClose).toHaveBeenCalledTimes(2);
  });

  it('calls onClose when clicking on the overlay, but NOT inside the modal card', () => {
    const { container } = render(<EditProfileModal isOpen={true} onClose={mockOnClose} />);
    
    const modalCard = container.querySelector('.modal-card');
    fireEvent.click(modalCard!);
    expect(mockOnClose).not.toHaveBeenCalled();

    const overlay = container.querySelector('.modal-overlay');
    fireEvent.click(overlay!);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('calls mutate with form data on form submit', () => {
    const { container } = render(<EditProfileModal isOpen={true} onClose={mockOnClose} />);
    
    const nameInput = screen.getByDisplayValue('Супер Хакер');
    fireEvent.change(nameInput, { target: { value: 'Лінус Торвальдс', name: 'full_name' } });
    
    fireEvent.submit(container.querySelector('form')!);
    
    expect(mockMutate).toHaveBeenCalledWith({
      full_name: 'Лінус Торвальдс',
      telegram: '@hacker',
      github: 'hacker777',
      discord: 'hacker#7777',
    });
  });

  it('disables submit button and shows loading text while pending', () => {
    vi.mocked(useMutation).mockReturnValue({
      mutate: mockMutate,
      isPending: true,
    } as any);

    render(<EditProfileModal isOpen={true} onClose={mockOnClose} />);
    
    const submitBtn = screen.getByRole('button', { name: /збереження\.\.\./i });
    expect(submitBtn).toBeDisabled();
  });

  it('dispatches setUser to Redux and closes modal on mutation success', () => {
    render(<EditProfileModal isOpen={true} onClose={mockOnClose} />);
    mutationConfig.onSuccess(
      { data: 'success' }, 
      {
        full_name: 'Новий Хакер',
        telegram: '@new',
        github: 'new',
        discord: 'new#1234'
      }
    );

    expect(store.dispatch).toHaveBeenCalled();
    expect(mockOnClose).toHaveBeenCalled();
  });
});