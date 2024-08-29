DROP TABLE IF EXISTS ratings;

CREATE TABLE ratings (
  id SERIAL PRIMARY KEY,
  UserToken TEXT NOT NULL,
  Rating INT NOT NULL,
  UNIQUE (UserToken)
);