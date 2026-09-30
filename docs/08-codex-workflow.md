# Flujo de trabajo con Codex

## Regla principal

No pedir "construí todo el ecommerce".

Trabajar un prompt por vez.

## Proceso recomendado

1. Dar contexto del repositorio.
2. Pedir que lea AGENTS.md.
3. Ejecutar un prompt.
4. Revisar diff.
5. Ejecutar build/tests.
6. Corregir antes de continuar.
7. Commit por slice.

## Convención de commits sugerida

- feat(catalog): add product listing
- feat(cart): add anonymous cart
- feat(checkout): create order snapshot
- feat(payments): add payment abstraction
- chore(cloudflare): configure d1 and r2

## Qué evitar

- prompts gigantes
- refactors no pedidos
- dependencias innecesarias
- lógica de negocio en functions
- duplicación de tipos frontend/backend sin motivo
