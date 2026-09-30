CREATE TABLE Categories (
  Id TEXT PRIMARY KEY,
  Name TEXT NOT NULL,
  Slug TEXT NOT NULL UNIQUE,
  Active INTEGER NOT NULL DEFAULT 1,
  CreatedAt TEXT NOT NULL
);

CREATE TABLE Products (
  Id TEXT PRIMARY KEY,
  CategoryId TEXT NOT NULL,
  Name TEXT NOT NULL,
  Description TEXT,
  PriceCents INTEGER NOT NULL,
  ImageUrl TEXT,
  Active INTEGER NOT NULL DEFAULT 1,
  CreatedAt TEXT NOT NULL,
  UpdatedAt TEXT NOT NULL,
  FOREIGN KEY (CategoryId) REFERENCES Categories(Id)
);

CREATE TABLE Carts (
  Id TEXT PRIMARY KEY,
  SessionId TEXT NOT NULL UNIQUE,
  Status TEXT NOT NULL,
  CreatedAt TEXT NOT NULL,
  UpdatedAt TEXT NOT NULL
);

CREATE TABLE CartItems (
  Id TEXT PRIMARY KEY,
  CartId TEXT NOT NULL,
  ProductId TEXT NOT NULL,
  Quantity INTEGER NOT NULL,
  UnitPriceCents INTEGER NOT NULL,
  CreatedAt TEXT NOT NULL,
  UpdatedAt TEXT NOT NULL,
  FOREIGN KEY (CartId) REFERENCES Carts(Id),
  FOREIGN KEY (ProductId) REFERENCES Products(Id),
  UNIQUE (CartId, ProductId)
);

CREATE TABLE Orders (
  Id TEXT PRIMARY KEY,
  CartId TEXT,
  Email TEXT NOT NULL,
  FirstName TEXT NOT NULL,
  LastName TEXT NOT NULL,
  Phone TEXT,
  Status TEXT NOT NULL,
  PaymentStatus TEXT NOT NULL,
  SubtotalCents INTEGER NOT NULL,
  ShippingCents INTEGER NOT NULL,
  TotalCents INTEGER NOT NULL,
  ShippingAddressJson TEXT NOT NULL,
  CreatedAt TEXT NOT NULL,
  UpdatedAt TEXT NOT NULL
);

CREATE TABLE OrderItems (
  Id TEXT PRIMARY KEY,
  OrderId TEXT NOT NULL,
  ProductId TEXT NOT NULL,
  ProductName TEXT NOT NULL,
  Quantity INTEGER NOT NULL,
  UnitPriceCents INTEGER NOT NULL,
  LineTotalCents INTEGER NOT NULL,
  FOREIGN KEY (OrderId) REFERENCES Orders(Id)
);

CREATE TABLE Payments (
  Id TEXT PRIMARY KEY,
  OrderId TEXT NOT NULL,
  Provider TEXT NOT NULL,
  ProviderPaymentId TEXT,
  Status TEXT NOT NULL,
  AmountCents INTEGER NOT NULL,
  IdempotencyKey TEXT,
  CreatedAt TEXT NOT NULL,
  UpdatedAt TEXT NOT NULL,
  FOREIGN KEY (OrderId) REFERENCES Orders(Id)
);

CREATE INDEX IX_Products_CategoryId_Active ON Products(CategoryId, Active);
CREATE INDEX IX_CartItems_CartId ON CartItems(CartId);
CREATE INDEX IX_Orders_Email ON Orders(Email);
CREATE INDEX IX_Orders_CreatedAt ON Orders(CreatedAt);
CREATE INDEX IX_Payments_OrderId ON Payments(OrderId);
CREATE INDEX IX_Payments_ProviderPaymentId ON Payments(ProviderPaymentId);
