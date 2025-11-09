'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { FilterPanel } from '@/components/FilterPanel';
import { PropertyCard } from '@/components/PropertyCard';
import { CityOption, fetchCities, fetchProperties } from '@/lib/api';
import type { PaginatedResponse, PropertyFilters } from '@/lib/types';

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

  const citiesLoader = useCallback(async (): Promise<CityOption[]> => {
    return fetchCities();
  }, []);

  return (
    <div className="space-y-8">
      <section className="space-y-2">
        <h1 className="text-2xl font-bold text-slate-900">Inventario de inmuebles</h1>
        <p className="text-sm text-slate-600">
          Consulta, filtra y administra el portafolio inmobiliario disponible para arriendo y
          venta.
        </p>
      </section>

      <FilterPanel defaultFilters={filters} onChange={handleFiltersChange} loadCities={citiesLoader} />

      <section className="space-y-4">
        <header className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-800">
              {loading ? 'Cargando inmuebles...' : 'Resultados'}
            </h2>
            <p className="text-sm text-slate-600">
              {response?.meta.total ?? 0} inmuebles encontrados
            </p>
          </div>
          <div className="text-sm text-slate-600">
            Página {currentPage} de {totalPages}
          </div>
        </header>

        {error && <p className="text-sm text-blue-600">{error}</p>}

        {!loading && response && response.data.length === 0 && (
          <p className="text-sm text-slate-600">
            No se encontraron inmuebles con los filtros seleccionados. Ajusta los criterios e
            inténtalo nuevamente.
          </p>
        )}

        <div className="grid grid-3">
          {response?.data.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>

        {loading && <p className="text-sm text-slate-600">Actualizando resultados...</p>}

        {totalPages > 1 && (
          <div className="flex items-center justify-between border border-slate-200 bg-white p-4 rounded-lg">
            <button
              className="secondary"
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
            <div className="text-sm text-slate-600">
              Mostrando página {currentPage} de {totalPages}
            </div>
            <button
              className="secondary"
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
