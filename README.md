# SaaS de Citas para Negocios

Aplicación SaaS de gestión de citas y reservas para negocios, con backend en NestJS, base de datos PostgreSQL y frontend en Angular.

## Estado actual

Bloques completados:
- Bloque 1 al 20
- Bloque 21: flujo cliente de reserva pública
- Bloque 22: corrección definitiva del flujo público y preparación para IA
- Bloque 23: chat de reservas base
- Bloque 24: waitlist inteligente base
- Bloque 25: directorio público de negocios
- Bloque 26: pricing / promos base
- Bloque 27: UI interna de promociones

## Decisiones de rutas

Rutas oficiales actuales:
- público listado de negocios: `/businesses`
- público reserva por negocio: `/book/:slug`
- interno superadmin: `/admin/businesses`

Se separan explícitamente rutas públicas e internas para evitar conflictos entre escaparate público y panel de administración.

## Incidencias abiertas

- revisar enlaces de retorno tipo “volver a businesses”
- algunos enlaces antiguos pueden seguir apuntando a la ruta equivocada tras la separación entre:
  - `/businesses`
  - `/admin/businesses`
- queda pendiente una pasada de saneamiento completa de navegación

## Estado del chat con IA

El flujo público manual de reserva está operativo.

El chat conversacional está implementado a nivel técnico, pero su interpretación con IA sigue en fase de estabilización. Actualmente:
- el flujo guiado estructurado existe
- la reserva manual sigue siendo el camino estable
- la extracción semántica con IA no se considera cerrada todavía

Por tanto, el asistente conversacional queda marcado como funcional parcial y pendiente de ajuste.

## Frontend actual

Ya permite:
- panel interno de negocio
- agenda, citas y bloqueos
- flujo público de reserva:
  - `/book/:slug`
- directorio público de negocios:
  - `/businesses`
- promos visibles en la página pública de reserva
- listado interno de promociones
- creación interna de promociones
- chat de reservas guiado dentro de la página pública
- capa de servicio para waitlist pública e interna

## Backend actual

Ya permite:
- endpoints internos de negocio
- endpoints públicos para reserva
- endpoint público de listado de negocios:
  - `GET /api/v1/public/businesses`
- endpoint público de detalle por slug:
  - `GET /api/v1/public/businesses/:slug`
- endpoint público de promos activas:
  - `GET /api/v1/public/businesses/:businessId/promotions`
- endpoint público de chat de reservas:
  - `POST /api/v1/public/businesses/:businessId/booking-chat`
- endpoint público de waitlist:
  - `POST /api/v1/public/businesses/:businessId/waitlist`
- endpoints internos de promociones:
  - `POST /api/v1/businesses/:businessId/promotions`
  - `GET /api/v1/businesses/:businessId/promotions`
- endpoints internos de waitlist:
  - `POST /api/v1/businesses/:businessId/waitlist`
  - `GET /api/v1/businesses/:businessId/waitlist`
  - `POST /api/v1/businesses/:businessId/waitlist/matches`

## IA de reservas

El chat de reservas funciona en dos modos:

### 1. Modo mock
Se activa automáticamente si no existe `OPENAI_API_KEY`.

### 2. Modo OpenAI
Se activa si en el backend configuras:

```env
OPENAI_API_KEY=tu_api_key_real
OPENAI_MODEL=gpt-4.1-mini
OPENAI_API_URL=https://api.openai.com/v1/chat/completions