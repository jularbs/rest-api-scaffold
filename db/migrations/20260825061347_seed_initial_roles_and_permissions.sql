-- migrate:up
INSERT INTO
    roles (key, name, description)
VALUES
    (
        'admin',
        'Administrator',
        'Full system administration access'
    ),
    (
        'content_manager',
        'Content Manager',
        'Content Manager access for daily operations'
    ),
    (
        'ecommerce_manager',
        'Ecommerce Manager',
        'Ecommerce Manager access for daily operations'
    ) ON CONFLICT (key) DO NOTHING;

INSERT INTO
    permissions (key, description)
VALUES
    (
        'auth.me.read',
        'Read the current authenticated user profile'
    ),
    ('user.read', 'Read user records'),
    ('user.create', 'Create user records'),
    ('user.update', 'Update user records'),
    ('user.deactivate', 'Deactivate user records') ON CONFLICT (key) DO NOTHING;

-- migrate:down
DELETE FROM roles
WHERE
    key IN ('admin', 'content_manager', 'ecommerce_manager');

DELETE FROM permissions
WHERE
    key IN (
        'auth.me.read',
        'user.read',
        'user.create',
        'user.update',
        'user.deactivate'
    );