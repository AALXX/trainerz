-- Drop existing table if it exists
DROP TABLE IF EXISTS reviews;

-- Create the reviews table
CREATE TABLE reviews (
    id SERIAL PRIMARY KEY,
    ReviewToken VARCHAR(150) NOT NULL,
    OwnerToken VARCHAR(150) NOT NULL,
    PackageToken VARCHAR(150) NOT NULL,
    ReviewText VARCHAR(150) NOT NULL,
    ReviewRating INT NOT NULL
);