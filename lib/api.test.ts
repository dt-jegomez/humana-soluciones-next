import { describe, expect, it, vi, beforeEach } from 'vitest';

const API_CITIES_URL = 'https://api-colombia.com/api/v1/City/';

function createFetchResponse(payload: unknown) {
  return {
    ok: true,
    status: 200,
    text: async () => JSON.stringify(payload),
    json: async () => payload
  };
}

describe('fetchCities', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.resetModules();
    vi.unstubAllGlobals();
  });

  it('obtiene el catálogo público y filtra por el término de búsqueda', async () => {
    const payload = [
      { id: 1, name: 'Bogotá' },
      { id: 2, name: 'Medellín' }
    ];
    const fetchSpy = vi.fn().mockResolvedValue(createFetchResponse(payload));
    vi.stubGlobal('fetch', fetchSpy);

    const fetchCities = await importFetchCities();
    const result = await fetchCities('Medellín');

    expect(result).toEqual([{ id: '2', name: 'Medellín' }]);
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(fetchSpy).toHaveBeenCalledWith(
      API_CITIES_URL,
      expect.objectContaining({
        headers: { Accept: 'application/json' }
      })
    );
  });

  it('devuelve todas las ciudades cuando no se envía un término de búsqueda', async () => {
    const payload = [
      { name: 'Barranquilla' },
      { id: 4, name: 'Cali' }
    ];
    const fetchSpy = vi.fn().mockResolvedValue(createFetchResponse(payload));
    vi.stubGlobal('fetch', fetchSpy);

    const fetchCities = await importFetchCities();
    const result = await fetchCities();

    expect(result).toEqual([
      { id: 'Barranquilla', name: 'Barranquilla' },
      { id: '4', name: 'Cali' }
    ]);
    expect(fetchSpy).toHaveBeenCalledWith(
      API_CITIES_URL,
      expect.objectContaining({
        headers: { Accept: 'application/json' }
      })
    );
  });

  it('reutiliza el catálogo descargado en llamadas posteriores', async () => {
    const payload = [
      { id: 7, name: 'Bucaramanga' },
      { id: 8, name: 'Cartagena' }
    ];
    const fetchSpy = vi.fn().mockResolvedValue(createFetchResponse(payload));
    vi.stubGlobal('fetch', fetchSpy);

    const fetchCities = await importFetchCities();
    await fetchCities();
    const filtered = await fetchCities('Cartagena');

    expect(filtered).toEqual([{ id: '8', name: 'Cartagena' }]);
    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });
});

async function importFetchCities() {
  const module = await import('./api');
  return module.fetchCities;
}
