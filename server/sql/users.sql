DROP TABLE IF EXISTS users;

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    UserName VARCHAR(30) NOT NULL,
    Description VARCHAR(150) NOT NULL,
    BirthDate VARCHAR(60) NOT NULL,
    LocationLat FLOAT NOT NULL,
    LocationLon FLOAT NOT NULL,
    Sport VARCHAR(30) NOT NULL,
    UserEmail VARCHAR(50) NOT NULL,
    PhoneNumber VARCHAR(50) NOT NULL,
    UserPwd VARCHAR(80) NOT NULL,
    AccountType VARCHAR(80) NOT NULL,
    UserPrivateToken VARCHAR(150) NOT NULL,
    UserPublicToken VARCHAR(150) NOT NULL,
    UserVisibility VARCHAR(255) NOT NULL DEFAULT 'public',
    JoinDate TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (UserPrivateToken),
    UNIQUE (UserPublicToken)
);