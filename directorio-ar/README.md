# Directorio AR

Plataforma de gobierno corporativo para empresas argentinas. Guia desde el diagnostico inicial hasta la operacion del directorio, paso a paso.

## Stack

- **Next.js 16** (App Router, Turbopack)
- **TypeScript 5**
- **Tailwind CSS 4**
- **React 19**
- **@react-pdf/renderer** para generacion de reportes PDF
- **localStorage** para persistencia de datos (sin backend)

## Correr localmente

```bash
npm install
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000).

## Estructura del proyecto

```
app/                          Paginas (App Router)
  page.tsx                    Landing page
  dashboard/                  Governance Score (Fase 1)
  modulo/[id]/                Modulos M1-M5 (Fase 1)
  resultado/                  Resultado final integrado
  informe-preliminar/         Informe preliminar M1+M2
  fase2/
    acta-constitutiva/        M6: Acta constitutiva
    protocolo/                M7: Protocolo familia/socios
    reunion/                  M8: Reuniones + votaciones
  fase3/
    dashboard/                M10: Dashboard financiero
    seguimiento/              M11: Seguimiento compromisos
    evaluacion-ceo/           M12: Evaluacion del CEO
components/
  AppHeader.tsx               Barra global: logo/Inicio, fases y menu de herramientas
  PageHeader.tsx              Barra de titulo de cada herramienta (muestra la fase)
  ModuleLayout.tsx            Layout de los modulos M1-M5 con stepper
  charts.tsx                  Graficos (Recharts): gauge, radar, barras, tendencias, dona
  PDFReport.tsx, VotacionPanel.tsx
lib/
  navegacion.ts               FUENTE UNICA de fases, modulos y rutas (titulos, colores, links)
  pymes.ts                    Criterios oficiales PyME (topes Res. 1/2026), industrias, roles y perfil
  progreso.ts                 Progreso de la Fase 1 (completados, siguiente, desbloqueo)
  indice.ts                   Calculo del Indice de preparacion (0-100) y referencias de mercado
  contenido-home.ts           Textos de la landing (editar aca, no en app/page.tsx)
  storage-core.ts             Acceso seguro a localStorage + generarId (compartido)
  storage.ts                  Store Fase 1 · storage-fase2.ts · storage-fase3.ts
  moduloN*.ts                 Preguntas y logica de puntaje de cada modulo
types/                        Tipos TypeScript
  index.ts                    Tipos Fase 1 (M1-M5)
  fase2.ts                    Tipos Fase 2 (M6-M9) + votacion
  fase3.ts                    Tipos Fase 3 (M10-M12)
```

## Diagnóstico: preguntas, resultado y datos guardados

- **Preguntas:** todas están en `lib/preguntas.ts`, cada una con su `construct`. `npm test` falla si dos preguntas comparten constructo (además prueba la migración y el cálculo de los ejes).
- **Resultado principal:** `lib/ejes.ts` calcula Necesidad y Disposición (0–100) y ubica a la empresa en una matriz 2×2. El Índice de preparación (`lib/indice.ts`) queda como dato complementario.
- **Topes PyME:** `lib/topes-pyme.ts` (norma, vigencia y montos; actualizar una vez por año).
- **Datos guardados:** si cambia el formato de lo que se guarda en localStorage, sumar un paso en `lib/migraciones.ts` (las claves no se cambian). Los respaldos JSON usan la misma versión de esquema.

## Convenciones

- **Navegacion:** para agregar o renombrar una herramienta, editar solo `lib/navegacion.ts`. El header, el menu, la home y los modulos se actualizan solos.
- **Colores:** usar los tokens de `app/globals.css` (`bg-brand`, `text-brand-dark`, `bg-brand-50`, `border-brand-100`, `bg-surface`). No escribir `#534AB7` a mano.
- **Encabezados:** cada pagina usa `<PageHeader titulo=... backHref|onBack=... right=... />`.
- **Persistencia:** nunca usar `localStorage` directo; usar los stores (`storage*`) que se apoyan en `storage-core.ts`.
- **Topes PyME:** se actualizan una vez por año en `lib/pymes.ts` (`NORMA_TOPES` y `TOPES_VENTAS`). Publico objetivo: Mediana Tramo 1/2 por facturacion o mas de 50 empleados; el resto hace el diagnostico abreviado (M1 + M2).
- **Graficos:** usar los componentes de `components/charts.tsx` (un color por entidad, leyenda y tooltip incluidos).

## Modulos

| # | Modulo | Fase | Estado |
|---|--------|------|--------|
| M1 | Necesidad de directorio | Diagnostico | Completo |
| M2 | Mapa de decisiones | Diagnostico | Completo |
| M3 | Perfiles del directorio | Diagnostico | Completo |
| M4 | Dinamica y funcionamiento | Diagnostico | Completo |
| M5 | Directorio y gerencia | Diagnostico | Completo |
| M6 | Acta constitutiva | Constitucion | Completo |
| M7 | Protocolo familia/socios | Constitucion | Completo |
| M8 | Reuniones del directorio | Constitucion | Completo |
| M9 | Busqueda de directores | Constitucion | Solo logica (sin UI) |
| M10 | Dashboard financiero | Gestion | Completo |
| M11 | Seguimiento de compromisos | Gestion | Completo |
| M12 | Evaluacion del CEO | Gestion | Completo |

## Datos y privacidad

Todos los datos se guardan en `localStorage` del navegador. No hay servidor, base de datos, ni registro de usuario. Los datos no salen del dispositivo.

> Migracion a backend (Supabase / PlanetScale) pendiente para cuando el producto pase a produccion con usuarios concurrentes.

## Deploy

El proyecto esta deployado en Vercel con deploy automatico desde la rama `main`.

## Variables de entorno (Vercel → Settings → Environment Variables)

| Variable | Para qué | Obligatoria |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | URL pública (canonical, og:image, sitemap). Por defecto `https://director-rai8.vercel.app` | No |
| `RESEND_API_KEY` | Envío del informe por mail (Resend) | Para el mail |
| `MAIL_FROM` | Remitente verificado en Resend, p. ej. `Directorio AR <informe@tudominio.com.ar>` | Para el mail |
| `MAIL_TO_LEADS` | Casilla que recibe una copia de cada pedido (y el reply-to) | No |

Sin `RESEND_API_KEY` y `MAIL_FROM` el bloque "Recibí tu informe por mail" no se muestra y `/api/informe` responde 503.

## Analítica

Vercel Web Analytics (`<Analytics />` en `app/layout.tsx`): sin cookies. Activarla en Vercel → proyecto → Analytics.
Los eventos personalizados pasan por `trackEvent()` en `lib/analitica.ts` (para cambiar de proveedor, editar solo `enviar()`).
Nunca enviar respuestas, nombre de empresa ni mail en un evento.

## Datos pendientes

Buscar `TODO(matias)`: casi todo está en `lib/sitio.ts` (mail, titular, dominio).
