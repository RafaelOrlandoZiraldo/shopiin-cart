# Prompt 01 - Project Foundation

Lee `AGENTS.md` y toda la documentación en `/docs` antes de modificar código.

Objetivo: crear la base del proyecto.

Implementar:
- React + TypeScript + Vite.
- Tailwind CSS.
- TanStack Query.
- estructura por features.
- Pages Functions bajo `/functions/api`.
- estructura `/server`.
- Vitest.
- endpoint `GET /api/health`.
- manejo global de errores.
- configuración de Wrangler tomando como referencia `/templates/wrangler.jsonc`.
- `.dev.vars.example`.

No implementar catálogo ni carrito todavía.

Criterios de aceptación:
- `npm run build` funciona.
- tests base funcionan.
- `/api/health` devuelve HTTP 200.
- no hay lógica de negocio en handlers.

Al finalizar, generar un resumen de archivos creados y decisiones tomadas.
