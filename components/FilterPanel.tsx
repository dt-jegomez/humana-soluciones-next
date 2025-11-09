'use client';

import { useEffect, useMemo, useState } from 'react';
import type { PropertyFilters } from '@/lib/types';
import type { CityOption } from '@/lib/api';
import { CitySelect } from './CitySelect';

interface FilterPanelProps {
  defaultFilters?: PropertyFilters;
  onChange: (filters: PropertyFilters) => void;
  loadCities: (search?: string) => Promise<CityOption[]>;
}

const BEDROOM_OPTIONS = [1, 2, 3, 4, 5];
const CITY_MAX_LENGTH = 255;
const PRICE_MIN = 0;
const PRICE_MAX = 999999999999.99;

export function FilterPanel({ defaultFilters, onChange, loadCities }: FilterPanelProps) {
  const [filters, setFilters] = useState<PropertyFilters>(defaultFilters ?? {});
  const [cityFilter, setCityFilter] = useState(defaultFilters?.city ?? '');

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
    setCityFilter('');
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
          <CitySelect
            label="Ciudad"
            query={cityFilter}
            onQueryChange={(value) => setCityFilter(value)}
            onSelect={(value) => {
              const nextCity = value || undefined;
              const updated = { ...filters, city: nextCity, page: 1 };
              setFilters(updated);
              setCityFilter(value ?? '');
              onChange(updated);
            }}
            selectedValue={filters.city ?? ''}
            loadCities={loadCities}
            placeholder="Filtrar escribiendo el nombre"
            allowClear
            clearLabel="Todas"
            helperText="Filtra escribiendo el nombre de la ciudad."
            maxSuggestions={5}
            maxLength={CITY_MAX_LENGTH}
          />
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
              min={PRICE_MIN}
              max={PRICE_MAX}
              step={0.01}
              value={filters.min_price ?? ''}
              onChange={(event) => {
                const value = event.target.value;
                const numericValue = Number(value);
                const updated = {
                  ...filters,
                  min_price:
                    value && !Number.isNaN(numericValue)
                      ? Math.min(Math.max(numericValue, PRICE_MIN), PRICE_MAX)
                      : undefined,
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
              min={PRICE_MIN}
              max={PRICE_MAX}
              step={0.01}
              value={filters.max_price ?? ''}
              onChange={(event) => {
                const value = event.target.value;
                const numericValue = Number(value);
                const updated = {
                  ...filters,
                  max_price:
                    value && !Number.isNaN(numericValue)
                      ? Math.min(Math.max(numericValue, PRICE_MIN), PRICE_MAX)
                      : undefined,
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
