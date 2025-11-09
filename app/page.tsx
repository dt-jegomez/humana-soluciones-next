'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { FilterPanel } from '@/components/FilterPanel';
import { PropertyCard } from '@/components/PropertyCard';
import { CityOption, fetchCities, fetchProperties } from '@/lib/api';
import type { PaginatedResponse, Property, PropertyFilters } from '@/lib/types';

const INITIAL_FILTERS: PropertyFilters = {
  per_page: 12,
  page: 1
};

export default function HomePage() {
  const [filters, setFilters] = useState<PropertyFilters>(INITIAL_FILTERS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [response, setResponse] = useState<PaginatedResponse<Property> | null>(null);

  const totalPages = useMemo(() => response?.meta.last_page ?? 1, [response?.meta.last_page]);
  const currentPage = useMemo(() => response?.meta.current_page ?? filters.page ?? 1, [
    response?.meta.current_page,
    filters.page
  ]);

  useEffect(() => {
    async function loadProperties() {
      setLoading(true);
      setError(null);
      try {
        const result = await fetchProperties(filters);
        setResponse(result);
      } catch (err) {
        console.error(err);
        setError('No fue posible obtener los inmuebles.');
      } finally {
        setLoading(false);
      }
    }

    loadProperties();
  }, [filters]);

  function handleFiltersChange(next: PropertyFilters) {
    setFilters((current) => ({ ...current, ...next }));
  }

  const citiesLoader = useCallback(async (search?: string): Promise<CityOption[]> => {
    return fetchCities(search);
  }, []);

  return (
    <div className="space-y-10">
      <section className="space-y-3">
        <span className="inline-flex items-center rounded-full bg-slate-200/70 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-600">
          Panel de gestión
        </span>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
          Inventario de inmuebles
        </h1>
        <p className="max-w-2xl text-sm text-slate-600">
          Consulta y administra el portafolio inmobiliario disponible. Utiliza los filtros para encontrar rápidamente la propiedad adecuada.
        </p>
      </section>

      <FilterPanel defaultFilters={filters} onChange={handleFiltersChange} loadCities={citiesLoader} />

      <section className="space-y-6">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">
              {loading ? 'Cargando inmuebles...' : 'Resultados'}
            </h2>
            <p className="text-sm text-slate-500">
              {response?.meta.total ?? 0} inmuebles encontrados
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <span className="hidden sm:inline">Página</span>
            <span className="rounded-full bg-slate-200/70 px-3 py-1 font-semibold text-slate-700">
              {currentPage}
            </span>
            <span className="text-muted">de {totalPages}</span>
          </div>
        </header>

        {error && (
          <p className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-600">
            {error}
          </p>
        )}

        {!loading && response && response.data.length === 0 && (
          <p className="rounded-2xl border border-slate-200/80 bg-white/70 px-4 py-4 text-sm text-slate-600">
            No se encontraron inmuebles con los filtros seleccionados. Ajusta los criterios e inténtalo nuevamente.
          </p>
        )}

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {response?.data.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>

        {loading && <p className="text-sm text-slate-500">Actualizando resultados...</p>}

        {totalPages > 1 && (
          <div className="card flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <button
              className="btn-secondary"
              disabled={currentPage <= 1}
              onClick={() =>
                handleFiltersChange({
                  ...filters,
                  page: Math.max(1, (filters.page ?? 1) - 1)
                })
              }
            >
              Anterior
            </button>
            <div className="text-sm text-slate-500">
              Mostrando página {currentPage} de {totalPages}
            </div>
            <button
              className="btn-secondary"
              disabled={currentPage >= totalPages}
              onClick={() =>
                handleFiltersChange({
                  ...filters,
                  page: Math.min(totalPages, (filters.page ?? 1) + 1)
                })
              }
            >
              Siguiente
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
