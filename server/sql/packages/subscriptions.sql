DROP TABLE IF EXISTS subscriptions;

CREATE TABLE subscriptions (
  id SERIAL PRIMARY KEY,
  PackageToken TEXT NOT NULL,
  UserpublicToken TEXT NOT NULL,
  Tier TEXT NOT NULL,
  UNIQUE (id)
);