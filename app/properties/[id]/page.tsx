import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { DeletePropertyButton } from '@/components/DeletePropertyButton';
import { fetchProperty } from '@/lib/api';
import type { Property } from '@/lib/types';

interface PropertyDetailPageProps {
  params: {
    id: string;
  };
}

function formatCurrency(value?: number | null) {
  if (!value) return 'No disponible';
  return value.toLocaleString('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0
  });
}

function formatDate(value?: string) {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

export default async function PropertyDetailPage({ params }: PropertyDetailPageProps) {
  const id = Number(params.id);

  if (Number.isNaN(id)) {
    notFound();
  }

  let property: Property | null = null;

  try {
    property = await fetchProperty(id);
  } catch (error) {
    console.error(error);
  }

  if (!property) {
    notFound();
  }

  const priceLabel =
    property.consignation_type === 'rent'
      ? `Canon de arriendo: ${formatCurrency(property.rent_price)}`
      : `Precio de venta: ${formatCurrency(property.sale_price)}`;

  return (
    <div className="space-y-10">
      <nav>
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-slate-500 transition hover:text-slate-900"
        >
          <span aria-hidden>←</span>
          Volver al listado
        </Link>
      </nav>

      <header className="space-y-3">
        <span className={`badge ${property.consignation_type === 'rent' ? 'badge-rent' : 'badge-sale'}`}>
          {property.consignation_type === 'rent' ? 'Arriendo' : 'Venta'}
        </span>
        <h1 className="text-3xl font-semibold text-slate-900">{property.title}</h1>
        <p className="text-sm text-slate-500">{property.address}</p>
      </header>

      <section className="grid gap-8 lg:grid-cols-[1.15fr_1fr]">
        <div className="space-y-5">
          <div className="card space-y-3">
            <h2 className="text-lg font-semibold text-slate-900">Descripción</h2>
            <p className="text-sm leading-relaxed text-slate-600">{property.description}</p>
          </div>
          <div className="card space-y-4">
            <h2 className="text-lg font-semibold text-slate-900">Características</h2>
            <dl className="grid gap-4 text-sm text-slate-600 sm:grid-cols-2">
              <div className="space-y-1">
                <dt className="font-semibold text-slate-700">Ciudad</dt>
                <dd className="text-slate-900">{property.city}</dd>
              </div>
              <div className="space-y-1">
                <dt className="font-semibold text-slate-700">Habitaciones</dt>
                <dd className="text-slate-900">{property.bedrooms}</dd>
              </div>
              <div className="space-y-1">
                <dt className="font-semibold text-slate-700">Baños</dt>
                <dd className="text-slate-900">{property.bathrooms}</dd>
              </div>
              <div className="space-y-1">
                <dt className="font-semibold text-slate-700">Área</dt>
                <dd className="text-slate-900">{property.area} m²</dd>
              </div>
            </dl>
          </div>
          <div className="card space-y-2">
            <h2 className="text-lg font-semibold text-slate-900">Condiciones económicas</h2>
            <p className="text-sm text-slate-600">{priceLabel}</p>
            {property.rent_price && property.sale_price && (
              <p className="text-xs text-slate-500">
                El inmueble admite modalidades de arriendo y venta.
              </p>
            )}
          </div>
          <div className="card text-sm text-slate-500">
            <p>Creado: {formatDate(property.created_at)}</p>
            <p>Actualizado: {formatDate(property.updated_at)}</p>
          </div>
        </div>
        <div className="space-y-5">
          {property.images && property.images.length > 0 ? (
            property.images.map((image, index) => (
              <div
                key={image.id ?? index}
                className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-slate-200/70 bg-slate-100"
              >
                <Image
                  src={image.url}
                  alt={`${property.title} - Imagen ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
            ))
          ) : (
            <div className="card text-center text-sm text-slate-500">
              No hay imágenes registradas para este inmueble.
            </div>
          )}
        </div>
      </section>

      <div className="flex flex-wrap gap-3">
        <Link href={`/properties/${property.id}/edit`} className="btn-primary">
          Editar inmueble
        </Link>
        <DeletePropertyButton propertyId={property.id} />
      </div>
    </div>
  );
}
