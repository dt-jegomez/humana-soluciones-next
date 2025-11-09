import Image from 'next/image';
import Link from 'next/link';
import type { Property } from '@/lib/types';

interface PropertyCardProps {
  property: Property;
}

function formatCurrency(value?: number | null) {
  if (!value) return 'No disponible';
  return value.toLocaleString('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0
  });
}

export function PropertyCard({ property }: PropertyCardProps) {
  const cover = property.images?.[0]?.url;
  const priceLabel =
    property.consignation_type === 'rent'
      ? `Arriendo: ${formatCurrency(property.rent_price)}`
      : `Venta: ${formatCurrency(property.sale_price)}`;

  return (
    <article className="card flex h-full flex-col gap-5">
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-slate-100">
        {cover ? (
          <Image
            src={cover}
            alt={property.title}
            fill
            className="object-cover transition duration-300 hover:scale-105"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-sm text-slate-500">
            Sin imagen disponible
          </div>
        )}
      </div>
      <div className="flex items-center justify-between text-sm">
        <span className={`badge ${property.consignation_type === 'rent' ? 'badge-rent' : 'badge-sale'}`}>
          {property.consignation_type === 'rent' ? 'Arriendo' : 'Venta'}
        </span>
        <span className="flex items-center gap-1 text-slate-500">
          <span className="h-2 w-2 rounded-full bg-brand-400" />
          {property.city}
        </span>
      </div>
      <header className="space-y-1">
        <h3 className="text-lg font-semibold text-slate-900">{property.title}</h3>
        <p className="text-sm text-slate-500">{property.address}</p>
      </header>
      <p className="text-sm leading-relaxed text-slate-600 line-clamp-3">{property.description}</p>
      <dl className="grid grid-cols-3 gap-3 text-center text-xs text-slate-600">
        <div className="rounded-2xl bg-slate-100/80 p-3">
          <dt className="font-semibold text-slate-700">Habitaciones</dt>
          <dd className="mt-1 text-base font-medium text-slate-900">{property.bedrooms}</dd>
        </div>
        <div className="rounded-2xl bg-slate-100/80 p-3">
          <dt className="font-semibold text-slate-700">Baños</dt>
          <dd className="mt-1 text-base font-medium text-slate-900">{property.bathrooms}</dd>
        </div>
        <div className="rounded-2xl bg-slate-100/80 p-3">
          <dt className="font-semibold text-slate-700">Área</dt>
          <dd className="mt-1 text-base font-medium text-slate-900">{property.area} m²</dd>
        </div>
      </dl>
      <p className="text-base font-semibold text-slate-900">{priceLabel}</p>
      <div className="mt-auto flex flex-col gap-3 sm:flex-row">
        <Link href={`/properties/${property.id}`} className="btn-primary">
          Ver detalle
        </Link>
        <Link href={`/properties/${property.id}/edit`} className="btn-secondary">
          Editar
        </Link>
      </div>
    </article>
  );
}
