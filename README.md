# Gestión de inmuebles - Humana Soluciones

Aplicación **Next.js 14** para gestionar el inventario de inmuebles de una inmobiliaria. El
frontend consume los servicios expuestos en `http://localhost:8000` para listar, crear, editar y
eliminar propiedades.

## Requisitos

- Node.js 18 o superior
- npm 9+

## Configuración

1. Instala las dependencias del proyecto:

   ```bash
   npm install
   ```

2. Crea (opcional) un archivo `.env.local` para personalizar la URL del backend:

   ```bash
   NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
   ```

## Scripts disponibles

```bash
npm run dev     # Levanta el servidor de desarrollo en http://localhost:3000
npm run build   # Genera el build de producción
npm run start   # Ejecuta el servidor de producción
npm run lint    # Ejecuta las reglas de ESLint
```

## Funcionalidades principales

- **Listado** de inmuebles con filtros por ciudad, precio, habitaciones y tipo de consignación.
- **Detalle** de inmueble con galería y acciones rápidas.
- **Formulario** unificado para crear y editar inmuebles, soportando múltiples imágenes (URLs).
- **Eliminación** de inmuebles con confirmación.
- Integración con el catálogo de ciudades y servicios REST del dominio `http://localhost:8000`.

## Estructura destacada

- `app/` – Rutas y páginas de Next.js (App Router).
- `components/` – Componentes reutilizables (filtros, cards, formularios).
- `lib/` – Tipos y cliente HTTP para interactuar con la API.

## Notas

- Las peticiones HTTP se realizan con `fetch` nativo y manejan errores básicos.
- La UI está construida con estilos simples definidos en `app/globals.css`, sin depender de
  frameworks de estilos externos.
