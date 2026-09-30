INSERT OR IGNORE INTO Categories (Id, Name, Slug, Active, CreatedAt)
VALUES
  ('11111111-1111-4111-8111-111111111111', 'Bebidas', 'bebidas', 1, '2026-09-29T00:00:00.000Z'),
  ('22222222-2222-4222-8222-222222222222', 'Snacks', 'snacks', 1, '2026-09-29T00:00:00.000Z');

INSERT OR IGNORE INTO Products (
  Id,
  CategoryId,
  Name,
  Description,
  PriceCents,
  ImageUrl,
  Active,
  CreatedAt,
  UpdatedAt
)
VALUES
  (
    '33333333-3333-4333-8333-333333333331',
    '11111111-1111-4111-8111-111111111111',
    'Agua mineral 500ml',
    'Agua mineral sin gas en botella individual.',
    900,
    NULL,
    1,
    '2026-09-29T00:00:00.000Z',
    '2026-09-29T00:00:00.000Z'
  ),
  (
    '33333333-3333-4333-8333-333333333332',
    '11111111-1111-4111-8111-111111111111',
    'Jugo de naranja 1L',
    'Jugo listo para tomar en envase familiar.',
    2500,
    NULL,
    1,
    '2026-09-29T00:00:00.000Z',
    '2026-09-29T00:00:00.000Z'
  ),
  (
    '33333333-3333-4333-8333-333333333333',
    '11111111-1111-4111-8111-111111111111',
    'Gaseosa cola 1.5L',
    'Bebida cola en botella retornable.',
    3200,
    NULL,
    1,
    '2026-09-29T00:00:00.000Z',
    '2026-09-29T00:00:00.000Z'
  ),
  (
    '44444444-4444-4444-8444-444444444441',
    '22222222-2222-4222-8222-222222222222',
    'Papas fritas clasicas',
    'Papas fritas saladas en paquete mediano.',
    1800,
    NULL,
    1,
    '2026-09-29T00:00:00.000Z',
    '2026-09-29T00:00:00.000Z'
  ),
  (
    '44444444-4444-4444-8444-444444444442',
    '22222222-2222-4222-8222-222222222222',
    'Mani tostado',
    'Mani tostado salado en pouch.',
    1400,
    NULL,
    1,
    '2026-09-29T00:00:00.000Z',
    '2026-09-29T00:00:00.000Z'
  ),
  (
    '44444444-4444-4444-8444-444444444443',
    '22222222-2222-4222-8222-222222222222',
    'Barra de cereal',
    'Barra de cereal con avena y miel.',
    750,
    NULL,
    1,
    '2026-09-29T00:00:00.000Z',
    '2026-09-29T00:00:00.000Z'
  );
