ALTER TABLE Orders ADD COLUMN IdempotencyKey TEXT;

CREATE UNIQUE INDEX IX_Orders_IdempotencyKey
ON Orders(IdempotencyKey)
WHERE IdempotencyKey IS NOT NULL;
