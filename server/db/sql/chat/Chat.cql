CREATE TABLE Chats (
    id UUID PRIMARY KEY,
    chatToken TEXT,
    athlete_public_token TEXT,
    trainer_public_token TEXT,
    PackageToken TEXT
);

CREATE INDEX ON Chats (chatToken);
CREATE INDEX ON Chats (PackageToken);

CREATE MATERIALIZED VIEW Chats_by_chatToken AS
    SELECT id, chatToken, PackageToken, athlete_public_token, trainer_public_token, PackageToken
    FROM Chats
    WHERE chatToken IS NOT NULL AND id IS NOT NULL
    PRIMARY KEY (chatToken, id);

CREATE MATERIALIZED VIEW Chats_by_PackageToken AS
    SELECT id, chatToken, PackageToken, athlete_public_token, trainer_public_token, PackageToken 
    FROM Chats
    WHERE PackageToken IS NOT NULL AND id IS NOT NULL
    PRIMARY KEY (PackageToken, id);

CREATE MATERIALIZED VIEW Chats_by_TrainerPublicToken AS
    SELECT id, chatToken, PackageToken, athlete_public_token, trainer_public_token, PackageToken 
    FROM Chats
    WHERE trainer_public_token IS NOT NULL AND id IS NOT NULL
    PRIMARY KEY (trainer_public_token, id);

CREATE MATERIALIZED VIEW Chats_by_AthletePublicToken AS
    SELECT id, chatToken, PackageToken, athlete_public_token, trainer_public_token, PackageToken 
    FROM Chats
    WHERE athlete_public_token IS NOT NULL AND id IS NOT NULL
    PRIMARY KEY (athlete_public_token, id);