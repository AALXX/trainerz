DROP TABLE IF EXISTS user_liked_or_disliked_video_class;

CREATE TABLE user_liked_or_disliked_video_class (
    id SERIAL PRIMARY KEY,
    userToken VARCHAR(110) NOT NULL,
    videoToken VARCHAR(110) NOT NULL,
    like_dislike INTEGER NOT NULL,
    UNIQUE (userToken, videoToken)
);