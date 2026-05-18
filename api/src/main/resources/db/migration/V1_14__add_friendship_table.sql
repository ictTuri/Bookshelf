CREATE TABLE friendship (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    friend_id BIGINT NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_friendship UNIQUE (user_id, friend_id),
    CONSTRAINT fk_friendship_user FOREIGN KEY (user_id) REFERENCES _user(id),
    CONSTRAINT fk_friendship_friend FOREIGN KEY (friend_id) REFERENCES _user(id)
);

CREATE INDEX idx_friendship_user ON friendship(user_id);
