# Arquitectura inicial

## Resumen

La aplicación se construirá como un monolito modular multi-tenant.

Cada negocio será un tenant lógico dentro de la misma base de datos mediante `businessId`, salvo entidades globales de superadmin.

## Niveles principales

### 1. Plataforma
Elementos globales de la plataforma:

- superadmin
- catálogo de verticales
- planes
- facturación del negocio
- configuración global
- auditoría global

### 2. Negocio
Elementos propios de cada negocio:

- perfil del negocio
- branding
- horarios
- empleados
- servicios
- combos
- clientes
- citas
- bloqueos
- waitlist
- promociones
- notificaciones
- analítica

### 3. Inteligencia
Capas que añadiremos progresivamente:

- clasificación de intención del cliente
- recomendación de servicio
- motor de precios/promos
- optimización de huecos
- scoring de no-show
- memoria operativa

## Arquitectura del backend

Monolito modular NestJS con módulos por dominio:

- auth
- users
- platform-admin
- businesses
- employees
- clients
- services
- appointments
- availability
- waitlist
- ai
- pricing
- notifications
- audit
- integrations
- shared

## Base de datos

Usaremos PostgreSQL con Prisma.

En el siguiente bloque se definirá el primer modelo de datos base.

## API

Convención base:

- prefijo global: `/api/v1`
- respuestas JSON
- validación estricta
- versionado por URL

## Frontend

El frontend se implementará en Angular en un bloque posterior.

Se separarán interfaces por rol:

- superadmin
- admin de negocio
- empleado
- cliente

## Seguridad

Principios desde el inicio:

- separación por tenant
- validación de entrada
- secretos fuera del repositorio
- auditoría de cambios importantes
- trazabilidad
- cumplimiento RGPD progresivo desde el diseño