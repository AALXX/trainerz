CREATE TABLE user_follw_account_class (
    id SERIAL PRIMARY KEY,
    userToken VARCHAR(110) NOT NULL,
    accountToken VARCHAR(110) NOT NULL
);