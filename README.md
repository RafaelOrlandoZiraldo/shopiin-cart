# shopiin-cart

Paquete de trabajo para construir un carrito de compras full-stack con React, TypeScript, Vite, Tailwind CSS, Cloudflare Pages/Functions, D1 y R2.

## Objetivo

Construir un MVP de e-commerce con catálogo, carrito anónimo, checkout, órdenes, pagos desacoplados y administración básica, preparado para desplegar en Cloudflare.

## Stack

- Frontend: React + TypeScript + Vite
- UI: Tailwind CSS
- Estado servidor: TanStack Query
- Estado UI local: Zustand o Context según complejidad
- Backend: Cloudflare Pages Functions / Workers runtime
- Persistencia: Cloudflare D1
- Imágenes: Cloudflare R2
- Deploy: Cloudflare Pages
- Validación: Zod
- Tests: Vitest

## Orden recomendado de trabajo

1. Leer `AGENTS.md`.
2. Revisar `docs/01-functional-requirements.md`.
3. Revisar `docs/02-architecture.md`.
4. Revisar `docs/03-api-contract.md`.
5. Revisar `docs/04-database-design.md`.
6. Ejecutar los prompts de `/prompts` en orden.
7. No avanzar a un prompt posterior si el anterior no compila y no pasa tests.

## Principio de desarrollo

Trabajar por vertical slices verificables. Cada slice debe incluir backend, persistencia, frontend y tests cuando corresponda.

## Desarrollo local

Instalar dependencias:

```bash
npm install
```

Crear variables locales desde el ejemplo:

```bash
cp .dev.vars.example .dev.vars
```

No commitear `.dev.vars`, `.env` ni tokens reales.

Ejecutar migraciones y seed local:

```bash
npm run d1:migrate:local
npm run d1:seed:local
```

Build, tests y typecheck:

```bash
npm run lint
npm test
npm run build
```

## Cloudflare Deploy

El proyecto usa Cloudflare Pages Functions, D1 y R2. La configuracion vive en `wrangler.jsonc` y separa:

- dev/preview: `shopping-cart-dev` y `shopping-cart-products-dev`
- prod: `shopping-cart-prod` y `shopping-cart-products-prod`

Antes del primer deploy, crear recursos separados:

```bash
npx wrangler d1 create shopping-cart-dev
npx wrangler d1 create shopping-cart-prod
npx wrangler r2 bucket create shopping-cart-products-dev
npx wrangler r2 bucket create shopping-cart-products-prod
```

Copiar los `database_id` reales en `wrangler.jsonc`:

- `REPLACE_WITH_DEV_D1_DATABASE_ID`
- `REPLACE_WITH_PROD_D1_DATABASE_ID`

Configurar secrets por entorno en Cloudflare Pages, no en el repositorio:

```bash
npx wrangler pages secret put ADMIN_API_TOKEN --project-name shopping-cart
npx wrangler pages secret put PAYMENT_PROVIDER_SECRET --project-name shopping-cart
npx wrangler pages secret put PAYMENT_WEBHOOK_SECRET --project-name shopping-cart
```

Repetir la configuracion en los entornos de Pages que correspondan: production y preview. En el dashboard de Cloudflare Pages, verificar que los bindings D1/R2 coincidan con `wrangler.jsonc`.

Aplicar migraciones:

```bash
npm run d1:migrate:dev
npm run d1:migrate:prod
```

Seed de desarrollo remoto, opcional:

```bash
npm run d1:seed:dev
```

Deploy:

```bash
npm run deploy:dev
npm run deploy:prod
```

`deploy:dev` publica la rama `develop`; `deploy:prod` publica la rama `main`. En Cloudflare Pages, configurar `main` como production branch.

## Secrets requeridos

- `ADMIN_API_TOKEN`: token bearer para `/api/admin/*`.
- `PAYMENT_PROVIDER_SECRET`: reservado para proveedor real de pagos.
- `PAYMENT_WEBHOOK_SECRET`: reservado para validar webhooks reales.

Los valores reales se cargan con Wrangler o desde el dashboard de Cloudflare. El archivo `.dev.vars.example` solo documenta nombres.

## Checklist de produccion

- [ ] D1 dev creado y con migraciones aplicadas.
- [ ] D1 prod creado y con migraciones aplicadas.
- [ ] R2 dev creado.
- [ ] R2 prod creado.
- [ ] `wrangler.jsonc` tiene `database_id` reales.
- [ ] Secrets configurados en preview/dev.
- [ ] Secrets configurados en production.
- [ ] `ADMIN_API_TOKEN` fuerte y rotado fuera del repo.
- [ ] Production branch configurada como `main`.
- [ ] Build, lint y tests pasan antes de deploy.
- [ ] Admin probado con auth real.
- [ ] Checkout probado end-to-end en preview.
- [ ] Webhook de pago real valida firma antes de pasar a produccion.
- [ ] Logs revisados para confirmar que no exponen secrets ni datos sensibles.
