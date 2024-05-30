DROP TABLE IF EXISTS videos_category_alloc;

CREATE TABLE videos_category_alloc (
  id SERIAL PRIMARY KEY,
  VideoToken VARCHAR(150) NOT NULL,
  SportName VARCHAR(50) NOT NULL
);