import { vi, describe, it, expect } from 'vitest'; 
import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TournamentPage } from './TournamentPage';

vi.mock('../../components/Header', () => ({
  Header: () => <div data-testid="mock-header">Фейковий Хедер</div>
}));

vi.mock('../../components/Hero', () => ({
  Hero: () => <div data-testid="mock-hero">Фейковий Хіро з анімацією</div>
}));

const placeholderTabs = ['Шукають команду', 'Команди (3)', 'Результати'];

describe('TournamentPage', () => {
  it('matches snapshot', () => {
    const { container } = render(<TournamentPage />);
    expect(container).toMatchSnapshot();
  });

  it('shows DescriptionTab by default', () => {
    render(<TournamentPage />);
    expect(screen.getByText('Що потрібно зробити?')).toBeInTheDocument();
  });

  it.each(placeholderTabs)('shows PlaceholderTab on "%s" click', async (tabName) => {
    render(<TournamentPage />);
    
    await userEvent.click(screen.getByText(tabName));
    
    expect(screen.getByText('Скоро буде...')).toBeInTheDocument();
    expect(screen.queryByText('Що потрібно зробити?')).not.toBeInTheDocument();
  });
});