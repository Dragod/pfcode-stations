DROP table if exists users;
CREATE TABLE users
(
    id         varchar(500) constraint users_pkey primary key,
    name       varchar(500) not null check (LENGTH(name) >= 3),
    email      varchar(500) unique not null CHECK (email LIKE '%_@__%.__%'),
    password   varchar(500) not null,
    role       varchar(500) not null default 'user' check (role IN ('user', 'moderator', 'admin')),
    created DATE NOT NULL DEFAULT (DATETIME('now'))
);

CREATE TRIGGER AutoGenerateUUID_users
AFTER INSERT ON users
FOR EACH ROW WHEN (NEW.id IS NULL)
BEGIN
  UPDATE users SET id = (select lower(hex(randomblob(16)))) WHERE rowid = NEW.rowid;
END;