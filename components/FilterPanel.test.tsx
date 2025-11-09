import { describe, expect, it, vi, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FilterPanel } from './FilterPanel';

const cities = [
  { id: '1', name: 'Bogotá' },
  { id: '2', name: 'Medellín' },
  { id: '3', name: 'Barranquilla' }
];

describe('FilterPanel - filtro de ciudad', () => {
  const loadCities = vi.fn();
  const onChange = vi.fn();

  beforeEach(() => {
    loadCities.mockReset();
    onChange.mockReset();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('muestra coincidencias obtenidas del backend', async () => {
    loadCities.mockImplementation(async (search?: string) => {
      const normalized = search?.toLowerCase() ?? '';
      return cities.filter((city) => city.name.toLowerCase().includes(normalized));
    });

    vi.useFakeTimers();

    render(<FilterPanel loadCities={loadCities} onChange={onChange} />);

    const filterInput = screen.getByLabelText('Ciudad');
    await userEvent.type(filterInput, 'bar');

    vi.advanceTimersByTime(300);

    await waitFor(() => {
      expect(loadCities).toHaveBeenLastCalledWith('bar');
    });

    const option = await screen.findByRole('option', { name: 'Barranquilla' });
    await userEvent.click(option);

    await waitFor(() => {
      expect(onChange).toHaveBeenCalled();
    });

    expect(onChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ city: 'Barranquilla' })
    );
  });
});
