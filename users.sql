DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS friend_requests;

CREATE TABLE users(
    id SERIAL PRIMARY KEY,
    first VARCHAR(300) NOT NULL,
    last VARCHAR(300) NOT NULL,
    email VARCHAR(300) NOT NULL UNIQUE,
    image VARCHAR (300),
    bio TEXT,
    password VARCHAR(300) NOT NULL
);


CREATE TABLE friend_requests(
    id SERIAL PRIMARY KEY,
    sender INTEGER NOT NULL,
    recipient INTEGER NOT NULL,
    status INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);
