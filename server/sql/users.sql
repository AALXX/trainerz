DROP TABLE IF EXISTS users;

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    UserName VARCHAR(30) NOT NULL,
    Description VARCHAR(150) NOT NULL,
    BirthDate VARCHAR(60) NOT NULL,
    AccountFolowers INT NOT NULL DEFAULT 0,
    AccountFolowing INT NOT NULL DEFAULT 0,
    LocationLat float NOT NULL,
    LocationLon float NOT NULL,
    Sport VARCHAR(30) NOT NULL,
    UserEmail VARCHAR(50) NOT NULL,
    PhoneNumber VARCHAR(50) NOT NULL,
    UserPwd VARCHAR(80) NOT NULL,
    AccountType VARCHAR(80) NOT NULL,
    UserPrivateToken VARCHAR(150) NOT NULL,
    UserPublicToken VARCHAR(150) NOT NULL,
    AccountPrice INT NOT NULL DEFAULT 0,
    UserVisibility VARCHAR(255) NOT NULL DEFAULT 'public'
    UNIQUE (UserPrivateToken)
    UNIQUE (UserPublicToken)

);