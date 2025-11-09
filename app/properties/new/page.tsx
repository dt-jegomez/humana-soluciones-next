import Link from 'next/link';
import { PropertyForm } from '@/components/PropertyForm';

export default function NewPropertyPage() {
  return (
    <div className="space-y-6">
      <nav className="text-sm text-slate-600">
        <Link href="/" className="text-blue-600">
          ← Volver al listado
        </Link>
      </nav>
      <PropertyForm />
    </div>
  );
}
