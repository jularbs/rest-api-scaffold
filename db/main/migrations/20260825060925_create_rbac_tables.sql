-- migrate:up
CREATE TABLE
    roles (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
        key TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        description TEXT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW (),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW ()
    );

CREATE TABLE
    permissions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
        key TEXT NOT NULL UNIQUE,
        description TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW (),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW ()
    );

CREATE TABLE
    user_roles (
        user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
        role_id UUID NOT NULL REFERENCES roles (id) ON DELETE CASCADE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW (),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW (),
        PRIMARY KEY (user_id, role_id)
    );

CREATE TABLE
    role_permissions (
        role_id UUID NOT NULL REFERENCES roles (id) ON DELETE CASCADE,
        permission_id UUID NOT NULL REFERENCES permissions (id) ON DELETE CASCADE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW (),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW (),
        PRIMARY KEY (role_id, permission_id)
    );

CREATE INDEX IF NOT EXISTS idx_roles_key ON roles (key);

CREATE INDEX IF NOT EXISTS idx_permissions_key ON permissions (key);

CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles (user_id);

CREATE INDEX IF NOT EXISTS idx_user_roles_role_id ON user_roles (role_id);

CREATE INDEX IF NOT EXISTS idx_role_permissions_role_id ON role_permissions (role_id);

CREATE INDEX IF NOT EXISTS idx_role_permissions_permission_id ON role_permissions (permission_id);

-- migrate:down
DROP TABLE IF EXISTS role_permissions;

DROP TABLE IF EXISTS user_roles;

DROP TABLE IF EXISTS permissions;

DROP TABLE IF EXISTS roles;