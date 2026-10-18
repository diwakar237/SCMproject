import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { EventPlannerPage } from '../pages/EventPlannerPage';
import { apiClient } from '../api/client';

vi.mock('../api/client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('EventPlannerPage Component', () => {
  const mockTasks = [
    {
      id: 1,
      userId: 1,
      title: 'Book Catering Service',
      description: 'Review menu proposals and taste-test options',
      category: 'CATERING',
      status: 'TODO',
      deadlineDate: '2026-11-15',
      eventTimeSlot: '12:00 PM',
      displayOrder: 1,
      createdAt: '2026-10-18T10:00:00',
      updatedAt: '2026-10-18T10:00:00',
    },
    {
      id: 2,
      userId: 1,
      title: 'Reserve Sound & Lighting Equipment',
      category: 'LOGISTICS',
      status: 'COMPLETED',
      deadlineDate: '2026-11-20',
      eventTimeSlot: '14:00 PM',
      displayOrder: 2,
      createdAt: '2026-10-18T10:00:00',
      updatedAt: '2026-10-18T10:00:00',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders event planner tasks and milestone progress bar', async () => {
    (apiClient.get as any).mockResolvedValueOnce({
      data: mockTasks,
    });

    render(
      <MemoryRouter>
        <EventPlannerPage />
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { level: 1, name: /Event Planner/i })).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Book Catering Service')).toBeInTheDocument();
      expect(screen.getByText('Reserve Sound & Lighting Equipment')).toBeInTheDocument();
      // 1 of 2 completed = 50%
      expect(screen.getByText('50%')).toBeInTheDocument();
    });
  });

  it('applies standardized template when requested', async () => {
    (apiClient.get as any).mockResolvedValueOnce({ data: [] });
    (apiClient.post as any).mockResolvedValueOnce({ data: mockTasks });

    render(
      <MemoryRouter>
        <EventPlannerPage />
      </MemoryRouter>
    );

    const applyBtn = screen.getByRole('button', { name: /Apply Template/i });
    fireEvent.click(applyBtn);

    await waitFor(() => {
      expect(apiClient.post).toHaveBeenCalledWith(
        '/planner/template',
        null,
        expect.objectContaining({ params: { templateName: 'Wedding Planner' } })
      );
    });
  });
});
