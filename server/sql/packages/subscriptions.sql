DROP TABLE IF EXISTS subscriptions;

CREATE TABLE subscriptions (
  id SERIAL PRIMARY KEY,
  SubsciptionId TEXT NOT NULL,
  PackageToken TEXT NOT NULL,
  UserpublicToken TEXT NOT NULL,
  Tier TEXT NOT NULL,
  UNIQUE (id)
);