DROP TABLE IF EXISTS PremiumTier;


CREATE TABLE PremiumTier (
  PackageToken TEXT PRIMARY KEY REFERENCES Packages(PackageToken) ON DELETE CASCADE,
  PriceID TEXT NOT NULL,
  Price INT NOT NULL,
  Recurring BOOLEAN NOT NULL,
  acces_videos BOOLEAN NOT NULL,
  coaching_101 BOOLEAN NOT NULL,
  custom_program BOOLEAN NOT NULL,
  Description TEXT,
  UNIQUE (PackageToken)
);