'use client';

import { useEffect, useId, useRef, useState } from 'react';
import type { CityOption } from '@/lib/api';

interface CitySelectProps {
  label: string;
  query: string;
  onQueryChange: (value: string) => void;
  onSelect?: (value?: string) => void;
  selectedValue?: string;
  loadCities: (search?: string) => Promise<CityOption[]>;
  placeholder?: string;
  helperText?: string;
  errorText?: string;
  allowClear?: boolean;
  clearLabel?: string;
  required?: boolean;
  disabled?: boolean;
  maxSuggestions?: number;
  debounceTime?: number;
}

export function CitySelect({
  label,
  query,
  onQueryChange,
  onSelect,
  selectedValue,
  loadCities,
  placeholder,
  helperText,
  errorText,
  allowClear = false,
  clearLabel = 'Todas',
  required = false,
  disabled = false,
  maxSuggestions = 6,
  debounceTime = 300
}: CitySelectProps) {
  const listboxId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const [suggestions, setSuggestions] = useState<CityOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const visibleOptions = suggestions.slice(0, maxSuggestions);
  const hasClearOption = Boolean(allowClear);
  const errorMessage = errorText ?? fetchError;

  useEffect(() => {
    let active = true;
    const handler = window.setTimeout(async () => {
      try {
        setLoading(true);
        setFetchError(null);
        const searchParam = query.trim() || undefined;
        const result = await loadCities(searchParam);
        if (!active) return;
        setSuggestions(Array.isArray(result) ? result : []);
      } catch (err) {
        console.error(err);
        if (active) {
          setFetchError('No fue posible obtener las ciudades.');
          setSuggestions([]);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }, debounceTime);

    return () => {
      active = false;
      window.clearTimeout(handler);
    };
  }, [query, loadCities, debounceTime]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  function handleSelect(value?: string) {
    const nextValue = value ?? '';
    onQueryChange(nextValue);
    onSelect?.(value);
    setIsOpen(false);
  }

  function handleClear() {
    handleSelect(undefined);
  }

  function handleInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    onQueryChange(event.target.value);
    setIsOpen(true);
  }

  return (
    <div className="field-group">
      <label htmlFor={listboxId}>{label}</label>
      <div className="relative" ref={containerRef}>
        <input
          id={listboxId}
          type="text"
          className="w-full"
          placeholder={placeholder}
          value={query}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          aria-controls={`${listboxId}-listbox`}
          aria-expanded={isOpen}
          required={required}
          disabled={disabled}
        />
        {isOpen && (
          <div
            id={`${listboxId}-listbox`}
            role="listbox"
            className="absolute left-0 right-0 z-10 mt-1 max-h-64 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg"
          >
            {loading ? (
              <p className="px-4 py-3 text-sm text-slate-500">Buscando ciudades...</p>
            ) : (
              <>
                {hasClearOption && (
                  <button
                    type="button"
                    className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-slate-600 hover:bg-slate-50"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={handleClear}
                  >
                    {clearLabel}
                  </button>
                )}
                {visibleOptions.length > 0 ? (
                  visibleOptions.map((city) => {
                    const isActive = selectedValue === city.name;
                    return (
                      <button
                        key={city.id}
                        type="button"
                        role="option"
                        aria-selected={isActive}
                        className={`flex w-full items-center px-4 py-2 text-left text-sm ${
                          isActive
                            ? 'bg-slate-100 font-semibold text-slate-900'
                            : 'text-slate-700 hover:bg-slate-50'
                        }`}
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={() => handleSelect(city.name)}
                      >
                        {city.name}
                      </button>
                    );
                  })
                ) : (
                  <p className="px-4 py-3 text-sm text-slate-500">
                    {query.trim() ? 'No hay coincidencias' : 'Empieza a escribir para buscar'}
                  </p>
                )}
              </>
            )}
          </div>
        )}
      </div>
      {(errorMessage || helperText) && (
        <p className={`text-xs ${errorMessage ? 'text-rose-600' : 'text-slate-500'}`}>
          {errorMessage ?? helperText}
        </p>
      )}
    </div>
  );
}
