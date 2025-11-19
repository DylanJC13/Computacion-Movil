# PWA · Computación Móvil

Backend ligero construido con Express que expone una API REST para consultar cursos y avisos académicos. Incluye una Progressive Web App (PWA) que consume los datos, se instala en Android y funciona offline con un Service Worker sencillo.

## Requisitos

- Node.js 18+
- npm 9+

## Instalación

```bash
npm install
cp .env.example .env # ajusta puertos/orígenes si es necesario
```

## Scripts disponibles

- `npm run dev`: inicia el servidor con recarga automática (nodemon).
- `npm start`: levanta el backend en modo producción.

La API queda disponible en `http://localhost:4000/api` y la PWA se sirve desde la misma URL.

## Endpoints principales

| Método | Ruta | Descripción |
| --- | --- | --- |
| GET | `/api/health` | Diagnóstico rápido del servicio. |
| GET | `/api/courses` | Lista cursos. Permite filtrar por `modality`, `campus`, `tag` o `search`. |
| GET | `/api/courses/:courseId` | Devuelve un curso puntual. |
| GET | `/api/announcements` | Avisos recientes. Acepta `level` y `limit`. |
| GET | `/api/requests` | Tickets enviados durante la ejecución (memoria). |
| POST | `/api/requests` | Crea un ticket. Valida payload con Zod. |

## Base de datos

- Define en `.env` las variables `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` y `DB_SSLMODE` para habilitar la persistencia en PostgreSQL.
- La API crea automáticamente la tabla `support_tickets`, pero si deseas hacerlo manualmente:

```sql
CREATE TABLE IF NOT EXISTS support_tickets (
  id UUID PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  topic TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

- Cuando las variables no están definidas, la ruta `/api/requests` vuelve al almacenamiento en memoria.

## PWA

- Manifest básico en `public/manifest.json`.
- Service Worker (`public/service-worker.js`) cachea el shell y entrega respuesta offline controlada para las rutas del API.
- El archivo `public/app.js` maneja filtros, consumo de la API y el flujo de instalación.

## Probar en un celular en la misma red

- Abre el servidor con `npm run dev`.
- Obtén la IP local de tu computador (`ipconfig getifaddr en0` en macOS, `ipconfig` en Windows).
- Desde el navegador del celular visita `http://IP_LOCAL:4000/`. Añade esa IP a `ALLOWED_ORIGINS` si la PWA necesita CORS.
- Si la red tiene aislamiento de clientes o un firewall bloquea el puerto 4000, no se podrá acceder; desactiva VPNs y permite conexiones entrantes cuando macOS lo solicite.

## Siguientes pasos sugeridos

1. Persistir los tickets en una base de datos real (Mongo/PostgreSQL) con autenticación JWT.
2. Desplegar el servicio en Render, Railway u otro proveedor y actualizar `ALLOWED_ORIGINS`.
3. Añadir pruebas automatizadas para las rutas críticas (`node --test` o Jest/Supertest).
