import Link from 'next/link';
import { PropertyForm } from '@/components/PropertyForm';

export default function NewPropertyPage() {
  return (
    <div className="space-y-8">
      <nav>
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-slate-500 transition hover:text-slate-900"
        >
          <span aria-hidden>←</span>
          Volver al listado
        </Link>
      </nav>
      <PropertyForm />
    </div>
  );
}
