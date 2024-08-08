DROP TABLE IF EXISTS programs;

CREATE TABLE programs (
  id SERIAL PRIMARY KEY,
  ProgramName TEXT NOT NULL,
  FileName VARCHAR(50) NOT NULL,
  OwnerToken VARCHAR(150) NOT NULL,
  ProgramToken VARCHAR(150) NOT NULL
);