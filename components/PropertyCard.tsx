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
    <article className="card space-y-4">
      <div className="relative w-full overflow-hidden rounded-lg bg-slate-50" style={{ paddingTop: '60%' }}>
        {cover ? (
          <Image
            src={cover}
            alt={property.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-sm text-slate-500">
            Sin imagen
          </div>
        )}
      </div>
      <div className="flex items-center justify-between">
        <span className={`badge ${property.consignation_type === 'rent' ? 'badge-blue' : 'badge-amber'}`}>
          {property.consignation_type === 'rent' ? 'Arriendo' : 'Venta'}
        </span>
        <span className="text-sm text-slate-600">{property.city}</span>
      </div>
      <header>
        <h3 className="text-lg font-semibold text-slate-800">{property.title}</h3>
        <p className="text-sm text-slate-600">{property.address}</p>
      </header>
      <p className="text-sm text-slate-600 line-clamp-3">{property.description}</p>
      <dl className="grid grid-cols-3 gap-2 text-center text-xs text-slate-600">
        <div className="rounded-lg bg-slate-50 p-2">
          <dt className="font-semibold text-slate-700">Habitaciones</dt>
          <dd>{property.bedrooms}</dd>
        </div>
        <div className="rounded-lg bg-slate-50 p-2">
          <dt className="font-semibold text-slate-700">Baños</dt>
          <dd>{property.bathrooms}</dd>
        </div>
        <div className="rounded-lg bg-slate-50 p-2">
          <dt className="font-semibold text-slate-700">Área</dt>
          <dd>{property.area} m²</dd>
        </div>
      </dl>
      <p className="font-semibold text-slate-800">{priceLabel}</p>
      <div className="flex gap-3">
        <Link href={`/properties/${property.id}`} className="primary">
          Ver detalle
        </Link>
        <Link
          href={`/properties/${property.id}/edit`}
          className="secondary"
        >
          Editar
        </Link>
      </div>
    </article>
  );
}
