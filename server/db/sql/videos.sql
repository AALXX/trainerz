DROP TABLE IF EXISTS videos;

CREATE TABLE
  videos (
    id SERIAL PRIMARY KEY,
    VideoTitle TEXT NOT NULL,
    VideoDescription VARCHAR(40) NOT NULL DEFAULT '',
    Likes INT NOT NULL DEFAULT 0,
    Dislikes INT NOT NULL DEFAULT 0,
    PublishDate DATE NOT NULL,
    VideoToken VARCHAR(150) NOT NULL,
    OwnerToken VARCHAR(150) NOT NULL,
    Packagetoken VARCHAR(150) NOT NULL,
    Visibility VARCHAR(10) DEFAULT 'public',
    ShowComments BOOLEAN NOT NULL DEFAULT TRUE,
    Views INT NOT NULL DEFAULT 0,
    Status VARCHAR(20) NOT NULL,
  );