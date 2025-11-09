export type ConsignationType = 'rent' | 'sale';

export interface PropertyImage {
  id?: number;
  url: string;
}

export interface Property {
  id: number;
  title: string;
  description: string;
  city: string;
  address: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  rent_price?: number;
  sale_price?: number;
  consignation_type: ConsignationType;
  images: PropertyImage[];
  created_at?: string;
  updated_at?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
  };
}

export interface PropertyFilters {
  search?: string;
  city?: string;
  min_price?: number;
  max_price?: number;
  bedrooms?: number[];
  consignation_type?: ConsignationType;
  per_page?: number;
  page?: number;
}
