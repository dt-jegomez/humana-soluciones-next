import { ConsignationType, PaginatedResponse, Property, PropertyFilters } from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8000';
const COLOMBIA_CITY_API_URL = 'https://api-colombia.com/api/v1/City/';

export interface CityOption {
  id: string;
  name: string;
}

interface ColombiaCityResponse {
  id?: string | number;
  name?: string;
}

let cachedCityOptions: CityOption[] | null = null;
let cityFetchPromise: Promise<CityOption[]> | null = null;

function buildQuery(filters: PropertyFilters): string {
  const params = new URLSearchParams();

  if (filters.city) {
    params.set('city', filters.city);
  }
  if (filters.min_price !== undefined) {
    params.set('min_price', filters.min_price.toString());
  }
  if (filters.max_price !== undefined) {
    params.set('max_price', filters.max_price.toString());
  }
  if (filters.bedrooms && filters.bedrooms.length > 0) {
    params.set('bedrooms', filters.bedrooms.join(','));
  }
  if (filters.consignation_type) {
    params.set('consignation_type', filters.consignation_type);
  }
  if (filters.per_page) {
    params.set('per_page', filters.per_page.toString());
  }
  if (filters.page) {
    params.set('page', filters.page.toString());
  }
  if (filters.search) {
    params.set('search', filters.search);
  }

  const query = params.toString();
  return query ? `?${query}` : '';
}

async function http<T>(input: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${input}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {})
    }
  });

  if (!response.ok) {
    const errorMessage = await response.text();
    throw new Error(errorMessage || 'Error al comunicarse con el servicio');
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export async function fetchProperties(
  filters: PropertyFilters = {}
): Promise<PaginatedResponse<Property>> {
  const query = buildQuery(filters);
  return http<PaginatedResponse<Property>>(`/api/properties${query}`);
}

export async function fetchProperty(id: number): Promise<Property> {
  return http<Property>(`/api/properties/${id}`);
}

interface PropertyPayload {
  title: string;
  description: string;
  city: string;
  address: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  rent_price?: number | null;
  sale_price?: number | null;
  consignation_type: ConsignationType;
  images: { url: string }[];
}

type CreatePropertyResponse = Property | { data: Property };

export async function createProperty(payload: PropertyPayload): Promise<Property> {
  const response = await http<CreatePropertyResponse>(`/api/properties`, {
    method: 'POST',
    body: JSON.stringify(payload)
  });

  return 'data' in response ? response.data : response;
}

export async function updateProperty(
  id: number,
  payload: PropertyPayload
): Promise<Property> {
  return http<Property>(`/api/properties/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload)
  });
}

export async function deleteProperty(id: number): Promise<void> {
  await http<void>(`/api/properties/${id}`, {
    method: 'DELETE'
  });
}

async function fetchCityCatalog(): Promise<CityOption[]> {
  if (cachedCityOptions) {
    return cachedCityOptions;
  }

  if (!cityFetchPromise) {
    cityFetchPromise = (async () => {
      const response = await fetch(COLOMBIA_CITY_API_URL, {
        headers: {
          Accept: 'application/json'
        }
      });

      if (!response.ok) {
        const errorMessage = await response.text();
        throw new Error(errorMessage || 'Error al obtener el catálogo de ciudades.');
      }

      const payload = (await response.json()) as unknown;
      const normalized = Array.isArray(payload)
        ? (payload
            .map((item) => {
              if (!item || typeof item !== 'object') {
                return null;
              }
              const { id, name } = item as ColombiaCityResponse;
              if (!name) {
                return null;
              }
              return {
                id: id !== undefined && id !== null ? String(id) : name,
                name
              };
            })
            .filter(Boolean) as CityOption[])
        : [];

      cachedCityOptions = normalized;
      return normalized;
    })().finally(() => {
      cityFetchPromise = null;
    });
  }

  return cityFetchPromise;
}

export async function fetchCities(search?: string): Promise<CityOption[]> {
  const cities = await fetchCityCatalog();
  if (!search) {
    return cities;
  }

  const normalizedSearch = search.trim().toLowerCase();
  if (!normalizedSearch) {
    return cities;
  }

  return cities.filter((city) => city.name.toLowerCase().includes(normalizedSearch));
}
