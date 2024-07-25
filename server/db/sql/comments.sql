DROP TABLE IF EXISTS comments;

CREATE TABLE comments (
  id SERIAL PRIMARY KEY,
  ownerToken TEXT NOT NULL,
  videoToken TEXT NOT NULL,
  comment TEXT NOT NULL
);