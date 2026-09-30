# Prompt 02 - Database Foundation

Lee `AGENTS.md` y `docs/04-database-design.md`.

Objetivo: preparar Cloudflare D1.

Implementar:
- migración inicial basada en `templates/migrations/0001_initial.sql`.
- tipos de bindings Cloudflare.
- helper de acceso D1.
- contratos de repositorio vacíos o mínimos para Catalog y Cart.
- seed opcional de desarrollo con 2 categorías y 6 productos.

No crear lógica HTTP compleja.

Criterios:
- migración ejecutable.
- estructura preparada para repositorios.
- sin SQL duplicado innecesariamente en handlers.
