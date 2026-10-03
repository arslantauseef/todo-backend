CREATE TYPE user_role AS ENUM (
    'User', 
    'Moderator', 
    'Administrator'
)

CREATE TABLE users (
    id INTEGER GENERATED ALWAYS AS DEFAULT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    hashed_password TEXT NOT NULL,
    role user_role NOT NULL DEFAULT 'User',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
)
