import { ConsignationType, PaginatedResponse, Property, PropertyFilters } from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8000';

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

export async function createProperty(payload: PropertyPayload): Promise<Property> {
  return http<Property>(`/api/properties`, {
    method: 'POST',
    body: JSON.stringify(payload)
  });
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

export interface CityOption {
  id: string;
  name: string;
}

export async function fetchCities(): Promise<CityOption[]> {
  const data = await http<{ data: CityOption[] }>(`/api/catalog/cities`);
  return data.data;
}
