
---

# 9. PROCESS

## Sustituye completo `PROCESS.md`

```md
# PROCESS.md

## Estado general del proyecto

Proyecto: SaaS de gestión de citas para negocios  
Fase actual: Bloque 26  
Estado: En progreso controlado

---

## Bloque 23 - Chat de reservas con IA

### Estado
Parcial / no cerrado del todo

### Entregado
- [x] endpoint de chat público
- [x] provider mock
- [x] integración con provider OpenAI
- [x] sincronización básica con formulario manual
- [x] flujo estructurado de selección

### Incidencias abiertas
- [ ] la extracción de intención con IA no es suficientemente estable
- [ ] la conversación no mantiene consistencia en todos los casos
- [ ] no se considera todavía un flujo de producción

### Decisión
Se congela temporalmente el ajuste de IA conversacional para no bloquear roadmap.
La reserva pública manual queda como flujo estable principal.

---

## Bloque 24 - Waitlist inteligente base

### Estado
Base funcional / UI final pendiente

### Entregado
- [x] modelo Prisma `WaitlistEntry`
- [x] enum `WaitlistStatus`
- [x] alta pública en waitlist
- [x] alta interna en waitlist
- [x] listado interno de waitlist
- [x] filtros por servicio, profesional y fecha
- [x] búsqueda de candidatos compatibles para un hueco

### Pendiente futuro
- [ ] envío automático de notificaciones
- [ ] aceptación temporal del hueco
- [ ] conversión automática a cita
- [ ] priorización inteligente
- [ ] UI final pública e interna completa

---

## Bloque 25 - Directorio público de negocios

### Objetivo
Permitir que un cliente vea negocios activos y entre directamente al flujo público de reserva.

### Entregado
- [x] endpoint público de listado de negocios activos
- [x] búsqueda pública por nombre, slug, ciudad y descripción
- [x] página pública `/businesses`
- [x] cards visuales por negocio
- [x] navegación a `/book/:slug`

### Decisión de rutas
- [x] público listado: `/businesses`
- [x] público reserva: `/book/:slug`
- [x] interno superadmin: `/admin/businesses`

---

## Bloque 26 - Pricing / promos base

### Objetivo
Permitir promociones simples por negocio y mostrarlas en el flujo público de reserva.

### Entregado
- [x] modelo Prisma `Promotion`
- [x] enum `PromotionType`
- [x] alta interna de promociones
- [x] listado interno de promociones
- [x] promo general o ligada a servicio
- [x] consulta pública de promociones activas
- [x] visualización de promociones en `/book/:slug`

### Pendiente futuro
- [ ] cálculo real del descuento aplicado al precio final
- [ ] pricing dinámico
- [ ] campañas automáticas por ocupación
- [ ] reglas avanzadas y cupones

---

# 11. `PROCESS.md`

Sustitúyelo por este:

```md id="e07s7i"
# PROCESS.md

## Estado general del proyecto

Proyecto: SaaS de gestión de citas para negocios  
Fase actual: Bloque 27  
Estado: En progreso controlado

---

## Incidencia abierta de navegación

### Problema detectado
Hay pequeños fallos en algunas URLs de retorno tipo “volver a businesses”.

### Contexto
Se separaron rutas públicas e internas:
- público: `/businesses`
- público reserva: `/book/:slug`
- interno superadmin: `/admin/businesses`

### Estado
- [ ] pendiente revisión completa de enlaces heredados
- [ ] pendiente saneamiento global de navegación

---

## Bloque 23 - Chat de reservas con IA

### Estado
Parcial / no cerrado del todo

### Entregado
- [x] endpoint de chat público
- [x] provider mock
- [x] integración con provider OpenAI
- [x] sincronización básica con formulario manual
- [x] flujo estructurado de selección

### Incidencias abiertas
- [ ] la extracción de intención con IA no es suficientemente estable
- [ ] la conversación no mantiene consistencia en todos los casos
- [ ] no se considera todavía un flujo de producción

### Decisión
Se congela temporalmente el ajuste de IA conversacional para no bloquear roadmap.
La reserva pública manual queda como flujo estable principal.

---

## Bloque 24 - Waitlist inteligente base

### Estado
Base funcional / UI final pendiente

### Entregado
- [x] modelo Prisma `WaitlistEntry`
- [x] enum `WaitlistStatus`
- [x] alta pública en waitlist
- [x] alta interna en waitlist
- [x] listado interno de waitlist
- [x] filtros por servicio, profesional y fecha
- [x] búsqueda de candidatos compatibles para un hueco

### Pendiente futuro
- [ ] envío automático de notificaciones
- [ ] aceptación temporal del hueco
- [ ] conversión automática a cita
- [ ] priorización inteligente
- [ ] UI final pública e interna completa

---

## Bloque 25 - Directorio público de negocios

### Objetivo
Permitir que un cliente vea negocios activos y entre directamente al flujo público de reserva.

### Entregado
- [x] endpoint público de listado de negocios activos
- [x] búsqueda pública por nombre, slug, ciudad y descripción
- [x] página pública `/businesses`
- [x] cards visuales por negocio
- [x] navegación a `/book/:slug`

### Decisión de rutas
- [x] público listado: `/businesses`
- [x] público reserva: `/book/:slug`
- [x] interno superadmin: `/admin/businesses`

---

## Bloque 26 - Pricing / promos base

### Objetivo
Permitir promociones simples por negocio y mostrarlas en el flujo público de reserva.

### Entregado
- [x] modelo Prisma `Promotion`
- [x] enum `PromotionType`
- [x] alta interna de promociones
- [x] listado interno de promociones
- [x] promo general o ligada a servicio
- [x] consulta pública de promociones activas
- [x] visualización de promociones en `/book/:slug`

### Pendiente futuro
- [ ] cálculo real del descuento aplicado al precio final
- [ ] pricing dinámico
- [ ] campañas automáticas por ocupación
- [ ] reglas avanzadas y cupones

---

## Bloque 27 - UI interna de promociones

### Objetivo
Permitir crear y consultar promociones desde el panel interno sin depender de llamadas manuales a la API.

### Entregado
- [x] listado interno de promociones por negocio
- [x] formulario interno de creación
- [x] navegación desde “Mi negocio”
- [x] enlace cruzado entre servicios y promociones
- [x] rutas internas para promociones

### Resultado
Las promociones dejan de depender de pruebas manuales por API y pasan a tener gestión básica desde interfaz.
## Bloque 28 - Combos / paquetes base

### Objetivo
Activar desde cero la gestión de combos/paquetes, partiendo del modelo ya existente en Prisma.

### Entregado
- [x] módulo backend `service-packages`
- [x] creación interna de combos
- [x] listado interno de combos
- [x] detalle interno del combo
- [x] añadir y quitar servicios del combo
- [x] rutas internas para combos
- [x] exposición pública informativa de combos

### Limitación conocida
- [ ] los combos todavía no se reservan directamente como cita
- [ ] el modelo `Appointment` sigue dependiendo de `serviceId`

### Resultado
El proyecto deja de tener combos solo “en schema” y pasa a tener implementación real usable.

## Bloque 29 - Bajas / cancelaciones / desactivaciones

Incluye:
- desactivar y reactivar empleados
- archivar y reactivar servicios
- cancelar citas desde panel interno
- activar/desactivar y eliminar promociones
- activar/desactivar y eliminar combos

Criterios:
- empleados y servicios no se borran físicamente
- las citas se cancelan, no se borran
- promociones y combos sí pueden eliminarse

## Bloque 30 - Reserva real de combos

### Objetivo
Permitir que los combos dejen de ser solo visibles/gestionables y puedan reservarse de verdad como entidad propia.

### Entregado
- [x] `Appointment` ampliado con `servicePackageId`
- [x] disponibilidad real para combos
- [x] validación de empleado compatible con todos los servicios del combo
- [x] creación de cita con combo
- [x] booking público manual con selector de combo
- [x] listado interno mostrando combo o servicio

### Limitación conocida
- [ ] el chat todavía no guía correctamente reservas de combos