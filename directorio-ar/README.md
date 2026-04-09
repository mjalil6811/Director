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
components/                   Componentes reutilizables
lib/                          Logica de negocio por modulo
types/                        Tipos TypeScript
  index.ts                    Tipos Fase 1 (M1-M5)
  fase2.ts                    Tipos Fase 2 (M6-M9) + votacion
  fase3.ts                    Tipos Fase 3 (M10-M12)
```

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
