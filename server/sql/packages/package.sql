-- Drop existing table if it exists
DROP TABLE IF EXISTS Packages CASCADE;

-- Create Packages table
CREATE TABLE Packages (
  id SERIAL PRIMARY KEY,
  PackageToken TEXT NOT NULL,
  OwnerToken TEXT NOT NULL,
  PackageName TEXT NOT NULL,
  Rating INT NOT NULL,
  Tier TEXT CHECK (Tier IN ('basic', 'standard', 'premium')) NOT NULL, -- Package tiers
  PhotosNumber int Default 0 NOT NULL, 
  VideosNumber int Default 0 NOT NULL,
  UNIQUE (PackageToken)
);