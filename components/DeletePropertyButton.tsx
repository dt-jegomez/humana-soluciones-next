'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { deleteProperty } from '@/lib/api';

interface DeletePropertyButtonProps {
  propertyId: number;
}

export function DeletePropertyButton({ propertyId }: DeletePropertyButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    const confirmed = window.confirm('¿Seguro que deseas eliminar este inmueble? Esta acción no se puede deshacer.');
    if (!confirmed) return;

    try {
      setLoading(true);
      setError(null);
      await deleteProperty(propertyId);
      router.push('/');
      router.refresh();
    } catch (err) {
      console.error(err);
      setError('No fue posible eliminar el inmueble.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-2">
      <button type="button" className="btn-secondary" onClick={handleDelete} disabled={loading}>
        {loading ? 'Eliminando...' : 'Eliminar inmueble'}
      </button>
      {error && (
        <p className="text-xs font-medium text-rose-600">
          {error}
        </p>
      )}
    </div>
  );
}
