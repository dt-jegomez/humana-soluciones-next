'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createProperty, fetchCities, updateProperty } from '@/lib/api';
import type { ConsignationType, Property } from '@/lib/types';
import { CitySelect } from './CitySelect';

interface PropertyFormProps {
  property?: Property;
}

interface FormState {
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
  images: string[];
}

const TITLE_MAX_LENGTH = 255;
const CITY_MAX_LENGTH = 255;
const ADDRESS_MAX_LENGTH = 255;
const IMAGE_URL_MAX_LENGTH = 255;
const INT16_MIN = 0;
const INT16_MAX = 32767;
const AREA_MIN = 0;
const AREA_MAX = 99999999.99;
const MONEY_MIN = 0;
const MONEY_MAX = 999999999999.99;

const EMPTY_FORM: FormState = {
  title: '',
  description: '',
  city: '',
  address: '',
  bedrooms: 1,
  bathrooms: 1,
  area: 40,
  rent_price: null,
  sale_price: null,
  consignation_type: 'rent',
  images: ['']
};

export function PropertyForm({ property }: PropertyFormProps) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(() => {
    if (!property) return EMPTY_FORM;
    return {
      title: property.title,
      description: property.description,
      city: property.city,
      address: property.address,
      bedrooms: property.bedrooms,
      bathrooms: property.bathrooms,
      area: property.area,
      rent_price: property.rent_price ?? null,
      sale_price: property.sale_price ?? null,
      consignation_type: property.consignation_type,
      images: property.images?.length ? property.images.map((image) => image.url) : ['']
    };
  });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const imageInputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const redirectTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (redirectTimeout.current) {
        clearTimeout(redirectTimeout.current);
      }
    };
  }, []);

  function clampNumber(value: number, { min, max }: { min: number; max: number }) {
    if (Number.isNaN(value)) return min;
    return Math.min(Math.max(value, min), max);
  }

  function updateField<K extends keyof FormState>(field: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function updateImage(index: number, value: string) {
    const nextValue = value.slice(0, IMAGE_URL_MAX_LENGTH);
    setForm((current) => {
      const next = [...current.images];
      next[index] = nextValue;
      return { ...current, images: next };
    });
  }

  function addImageField() {
    setForm((current) => ({ ...current, images: [...current.images, ''] }));
  }

  function removeImageField(index: number) {
    setForm((current) => ({
      ...current,
      images: current.images.filter((_, i) => i !== index)
    }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSuccessMessage(null);
    setError(null);

    const trimmedImages = form.images.map((url) => url.trim());
    const hasPrimaryImage = Boolean(trimmedImages.length && trimmedImages[0]);

    if (!hasPrimaryImage) {
      setError('Debes ingresar al menos una imagen de la propiedad.');
      imageInputRefs.current[0]?.focus();
      return;
    }

    setSubmitting(true);

    const payload = {
      title: form.title.slice(0, TITLE_MAX_LENGTH),
      description: form.description,
      city: form.city.slice(0, CITY_MAX_LENGTH),
      address: form.address.slice(0, ADDRESS_MAX_LENGTH),
      bedrooms: clampNumber(form.bedrooms, { min: INT16_MIN, max: INT16_MAX }),
      bathrooms: clampNumber(form.bathrooms, { min: INT16_MIN, max: INT16_MAX }),
      area: clampNumber(form.area, { min: AREA_MIN, max: AREA_MAX }),
      rent_price:
        typeof form.rent_price === 'number'
          ? clampNumber(form.rent_price, { min: MONEY_MIN, max: MONEY_MAX })
          : null,
      sale_price:
        typeof form.sale_price === 'number'
          ? clampNumber(form.sale_price, { min: MONEY_MIN, max: MONEY_MAX })
          : null,
      consignation_type: form.consignation_type,
      images: trimmedImages
        .filter(Boolean)
        .map((url) => ({ url: url.slice(0, IMAGE_URL_MAX_LENGTH) }))
    };

    try {
      if (property) {
        await updateProperty(property.id, payload);
        setSuccessMessage('Inmueble actualizado correctamente. Serás redirigido en 10 segundos.');
        if (redirectTimeout.current) {
          clearTimeout(redirectTimeout.current);
        }
        redirectTimeout.current = setTimeout(() => {
          router.back();
        }, 10000);
      } else {
        const created = await createProperty(payload);
        setSuccessMessage('Inmueble creado correctamente.');
        router.push(`/properties/${created.id}`);
        return;
      }
    } catch (err) {
      console.error(err);
      setError('No fue posible guardar la información.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="card space-y-8" onSubmit={handleSubmit}>
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold text-slate-900">
          {property ? 'Editar inmueble' : 'Registrar nuevo inmueble'}
        </h1>
        <p className="text-sm text-slate-500">
          Completa la información principal, precios y galería para la publicación.
        </p>
      </header>

      {error && (
        <p className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-600">
          {error}
        </p>
      )}
      {successMessage && (
        <p className="rounded-2xl border border-brand-100 bg-brand-50 px-4 py-3 text-sm text-brand-700">
          {successMessage}
        </p>
      )}

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-900">Información básica</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="field-group">
            <label htmlFor="title">Título</label>
            <input
              id="title"
              className="w-full"
              required
              maxLength={TITLE_MAX_LENGTH}
              value={form.title}
              onChange={(event) =>
                updateField('title', event.target.value.slice(0, TITLE_MAX_LENGTH))
              }
            />
          </div>
          <CitySelect
            label="Ciudad"
            query={form.city}
            selectedValue={form.city}
            placeholder="Escribe el nombre de la ciudad"
            onQueryChange={(value) => updateField('city', value.slice(0, CITY_MAX_LENGTH))}
            loadCities={fetchCities}
            required
            maxLength={CITY_MAX_LENGTH}
          />
        </div>
        <div className="field-group">
          <label htmlFor="address">Dirección</label>
          <input
            id="address"
            className="w-full"
            required
            maxLength={ADDRESS_MAX_LENGTH}
            value={form.address}
            onChange={(event) =>
              updateField('address', event.target.value.slice(0, ADDRESS_MAX_LENGTH))
            }
          />
        </div>
        <div className="field-group">
          <label htmlFor="description">Descripción</label>
          <textarea
            id="description"
            className="w-full min-h-[120px]"
            rows={4}
            required
            value={form.description}
            onChange={(event) => updateField('description', event.target.value)}
          />
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-900">Características</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="field-group">
            <label htmlFor="bedrooms">Habitaciones</label>
            <input
              id="bedrooms"
              className="w-full"
              type="number"
              min={INT16_MIN}
              max={INT16_MAX}
              step={1}
              value={form.bedrooms}
              onChange={(event) =>
                updateField(
                  'bedrooms',
                  clampNumber(Number(event.target.value), { min: INT16_MIN, max: INT16_MAX })
                )
              }
            />
          </div>
          <div className="field-group">
            <label htmlFor="bathrooms">Baños</label>
            <input
              id="bathrooms"
              className="w-full"
              type="number"
              min={INT16_MIN}
              max={INT16_MAX}
              step={1}
              value={form.bathrooms}
              onChange={(event) =>
                updateField(
                  'bathrooms',
                  clampNumber(Number(event.target.value), { min: INT16_MIN, max: INT16_MAX })
                )
              }
            />
          </div>
          <div className="field-group">
            <label htmlFor="area">Área (m²)</label>
            <input
              id="area"
              className="w-full"
              type="number"
              min={AREA_MIN}
              max={AREA_MAX}
              step={0.01}
              value={form.area}
              onChange={(event) =>
                updateField(
                  'area',
                  clampNumber(Number(event.target.value), { min: AREA_MIN, max: AREA_MAX })
                )
              }
            />
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-900">Condiciones económicas</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="field-group">
            <label htmlFor="consignation_type">Tipo de consignación</label>
            <select
              id="consignation_type"
              className="w-full"
              value={form.consignation_type}
              onChange={(event) => updateField('consignation_type', event.target.value as ConsignationType)}
            >
              <option value="rent">Arriendo</option>
              <option value="sale">Venta</option>
            </select>
          </div>
          <div className="field-group">
            <label htmlFor="rent_price">Precio de arriendo (COP)</label>
            <input
              id="rent_price"
              className="w-full"
              type="number"
              min={MONEY_MIN}
              max={MONEY_MAX}
              step={0.01}
              value={form.rent_price ?? ''}
              onChange={(event) =>
                updateField(
                  'rent_price',
                  event.target.value
                    ? clampNumber(Number(event.target.value), { min: MONEY_MIN, max: MONEY_MAX })
                    : null
                )
              }
            />
          </div>
          <div className="field-group">
            <label htmlFor="sale_price">Precio de venta (COP)</label>
            <input
              id="sale_price"
              className="w-full"
              type="number"
              min={MONEY_MIN}
              max={MONEY_MAX}
              step={0.01}
              value={form.sale_price ?? ''}
              onChange={(event) =>
                updateField(
                  'sale_price',
                  event.target.value
                    ? clampNumber(Number(event.target.value), { min: MONEY_MIN, max: MONEY_MAX })
                    : null
                )
              }
            />
          </div>
        </div>
        <p className="text-xs text-slate-500">
          Puedes registrar ambos precios para consignaciones mixtas. El backend evaluará las
          validaciones correspondientes.
        </p>
      </section>

      <section className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Galería (URLs públicas)</h2>
          <button type="button" className="btn-secondary" onClick={addImageField}>
            Añadir imagen
          </button>
        </div>
        <div className="space-y-4">
          {form.images.map((url, index) => (
            <div
              key={index}
              className="space-y-3 rounded-2xl border border-dashed border-slate-300/70 bg-white/70 p-4"
            >
              <div className="field-group">
                <label htmlFor={`image-${index}`}>Imagen #{index + 1}</label>
                <input
                  id={`image-${index}`}
                  className="w-full"
                  placeholder="https://..."
                  maxLength={IMAGE_URL_MAX_LENGTH}
                  ref={(element) => {
                    imageInputRefs.current[index] = element;
                  }}
                  value={url}
                  onChange={(event) => updateImage(index, event.target.value)}
                />
              </div>
              {form.images.length > 1 && (
                <div className="flex justify-end">
                  <button type="button" className="btn-secondary" onClick={() => removeImageField(index)}>
                    Eliminar
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      <div className="flex flex-col gap-3 sm:flex-row">
        <button type="submit" className="btn-primary" disabled={submitting}>
          {submitting ? 'Guardando...' : 'Guardar'}
        </button>
        <button type="button" className="btn-secondary" onClick={() => router.back()}>
          Cancelar
        </button>
      </div>
    </form>
  );
}
