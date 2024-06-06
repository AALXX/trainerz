DROP TABLE IF EXISTS BasicTier;


CREATE TABLE BasicTier (
  PackageToken TEXT PRIMARY KEY REFERENCES Packages(PackageToken) ON DELETE CASCADE,
  Price INT NOT NULL,
  Recurring BOOLEAN NOT NULL,
  acces_videos BOOLEAN NOT NULL,
  coaching_101 BOOLEAN NOT NULL,
  custom_program BOOLEAN NOT NULL,
  Description TEXT,
  UNIQUE (PackageToken)
);