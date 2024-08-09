DROP TABLE IF EXISTS program_premissions;

CREATE TABLE program_premissions (
  id SERIAL PRIMARY KEY,
  ProgramToken VARCHAR(150) NOT NULL,
  UserPublicToken VARCHAR(150) NOT NULL
);