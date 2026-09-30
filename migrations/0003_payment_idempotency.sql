CREATE UNIQUE INDEX IX_Payments_IdempotencyKey
ON Payments(IdempotencyKey)
WHERE IdempotencyKey IS NOT NULL;
