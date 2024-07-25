CREATE TABLE IF NOT EXISTS DirectMessages (
    id UUID PRIMARY KEY,
    ChatToken TEXT,
    OwnerToken TEXT,
    Message TEXT,
    SentAt TIMESTAMP,
);

CREATE INDEX ON DirectMessages (OwnerToken);

CREATE MATERIALIZED VIEW Messages_by_ChatToken AS
    SELECT id, chatToken, OwnerToken, Message, SentAt
    FROM DirectMessages
    WHERE ChatToken IS NOT NULL AND id IS NOT NULL
    PRIMARY KEY (chatToken, id);
