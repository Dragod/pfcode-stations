CREATE TABLE verification_tokens (
    email      varchar(500) unique not null CHECK (email LIKE '%_@__%.__%'),
    token TEXT NOT NULL,
    expires TIMESTAMP NOT NULL
);