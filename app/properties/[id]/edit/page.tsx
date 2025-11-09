import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PropertyForm } from '@/components/PropertyForm';
import { fetchProperty } from '@/lib/api';
import type { Property } from '@/lib/types';

interface EditPropertyPageProps {
  params: {
    id: string;
  };
}

export default async function EditPropertyPage({ params }: EditPropertyPageProps) {
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

  return (
    <div className="space-y-6">
      <nav className="text-sm text-slate-600">
        <Link href={`/properties/${property.id}`} className="text-blue-600">
          ← Volver al detalle
        </Link>
      </nav>
      <PropertyForm property={property} />
    </div>
  );
}
