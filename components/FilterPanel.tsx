'use client';

import { useEffect, useMemo, useState } from 'react';
import { CityOption } from '@/lib/api';
import type { PropertyFilters } from '@/lib/types';

interface FilterPanelProps {
  defaultFilters?: PropertyFilters;
  onChange: (filters: PropertyFilters) => void;
  loadCities: () => Promise<CityOption[]>;
}

const BEDROOM_OPTIONS = [1, 2, 3, 4, 5];

export function FilterPanel({ defaultFilters, onChange, loadCities }: FilterPanelProps) {
  const [filters, setFilters] = useState<PropertyFilters>(defaultFilters ?? {});
  const [cities, setCities] = useState<CityOption[]>([]);
  const [loadingCities, setLoadingCities] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setFilters((current) => ({ ...current, ...defaultFilters }));
  }, [defaultFilters]);

  useEffect(() => {
    async function fetchCities() {
      try {
        setLoadingCities(true);
        setError(null);
        const result = await loadCities();
        setCities(result);
      } catch (err) {
        console.error(err);
        setError('No fue posible obtener el listado de ciudades.');
      } finally {
        setLoadingCities(false);
      }
    }

    fetchCities();
  }, [loadCities]);

  const selectedBedrooms = useMemo(() => new Set(filters.bedrooms ?? []), [filters.bedrooms]);

  function toggleBedroom(value: number) {
    setFilters((current) => {
      const next = new Set(current.bedrooms ?? []);
      if (next.has(value)) {
        next.delete(value);
      } else {
        next.add(value);
      }
      const updated = {
        ...current,
        bedrooms: Array.from(next).sort((a, b) => a - b),
        page: 1
      };
      onChange(updated);
      return updated;
    });
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onChange({ ...filters, page: filters.page ?? 1 });
  }

  function handleReset() {
    const resetFilters: PropertyFilters = {
      per_page: filters.per_page ?? 12,
      page: 1
    };
    setFilters(resetFilters);
    onChange(resetFilters);
  }

  return (
    <section className="card space-y-8">
      <header className="space-y-2">
        <h2 className="text-xl font-semibold text-slate-900">Filtrar inmuebles</h2>
        <p className="text-sm text-slate-500">
          Ajusta los criterios para encontrar el inmueble que necesitas.
        </p>
      </header>
      <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="field-group">
            <label htmlFor="city">Ciudad</label>
            <select
              id="city"
              className="w-full"
              value={filters.city ?? ''}
              onChange={(event) => {
                const value = event.target.value || undefined;
                const updated = { ...filters, city: value, page: 1 };
                setFilters(updated);
                onChange(updated);
              }}
            >
              <option value="">Todas</option>
              {loadingCities && <option>Cargando ciudades...</option>}
              {!loadingCities &&
                cities.map((city) => (
                  <option key={city.id} value={city.name}>
                    {city.name}
                  </option>
                ))}
            </select>
            {error && (
              <p className="text-xs font-medium text-rose-600">
                {error}
              </p>
            )}
          </div>
          <div className="field-group">
            <label htmlFor="consignation">Tipo de consignación</label>
            <select
              id="consignation"
              className="w-full"
              value={filters.consignation_type ?? ''}
              onChange={(event) => {
                const value = (event.target.value || undefined) as PropertyFilters['consignation_type'];
                const updated = { ...filters, consignation_type: value, page: 1 };
                setFilters(updated);
                onChange(updated);
              }}
            >
              <option value="">Todos</option>
              <option value="rent">Arriendo</option>
              <option value="sale">Venta</option>
            </select>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="field-group">
            <label htmlFor="min_price">Precio mínimo (COP)</label>
            <input
              id="min_price"
              className="w-full"
              type="number"
              min={0}
              value={filters.min_price ?? ''}
              onChange={(event) => {
                const value = event.target.value;
                const updated = {
                  ...filters,
                  min_price: value ? Number(value) : undefined,
                  page: 1
                };
                setFilters(updated);
              }}
            />
          </div>
          <div className="field-group">
            <label htmlFor="max_price">Precio máximo (COP)</label>
            <input
              id="max_price"
              className="w-full"
              type="number"
              min={0}
              value={filters.max_price ?? ''}
              onChange={(event) => {
                const value = event.target.value;
                const updated = {
                  ...filters,
                  max_price: value ? Number(value) : undefined,
                  page: 1
                };
                setFilters(updated);
              }}
            />
          </div>
        </div>
        <div className="space-y-3">
          <p className="text-sm font-semibold text-slate-700">Habitaciones</p>
          <div className="flex flex-wrap gap-3">
            {BEDROOM_OPTIONS.map((value) => {
              const active = selectedBedrooms.has(value);
              return (
                <button
                  key={value}
                  type="button"
                  className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                    active
                      ? 'border-brand-300 bg-brand-50 text-brand-700 shadow-sm'
                      : 'border-slate-200 text-slate-600 hover:border-brand-200 hover:text-brand-600'
                  }`}
                  onClick={() => toggleBedroom(value)}
                >
                  {value} {value === 1 ? 'habitación' : 'habitaciones'}
                </button>
              );
            })}
          </div>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <button type="submit" className="btn-primary">
            Aplicar filtros
          </button>
          <button type="button" className="btn-secondary" onClick={handleReset}>
            Limpiar
          </button>
        </div>
      </form>
    </section>
  );
}
