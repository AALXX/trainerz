DROP TABLE IF EXISTS programs;

CREATE TABLE programs (
  id SERIAL PRIMARY KEY,
  ProgramName TEXT NOT NULL,
  OwnerToken VARCHAR(150) NOT NULL,
  ProgramToken VARCHAR(150) NOT NULL
);