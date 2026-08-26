-- migrate:up
INSERT INTO
    role_permissions (role_id, permission_id)
SELECT
    r.id,
    p.id
FROM
    roles r
    JOIN permissions p ON p.key IN (
        'auth.me.read',
        'user.read',
        'user.create',
        'user.update',
        'user.deactivate'
    )
WHERE
    r.key = 'admin' ON CONFLICT DO NOTHING;

INSERT INTO
    role_permissions (role_id, permission_id)
SELECT
    r.id,
    p.id
FROM
    roles r
    JOIN permissions p ON p.key IN ('auth.me.read')
WHERE
    r.key = 'content_manager' ON CONFLICT DO NOTHING;

INSERT INTO
    role_permissions (role_id, permission_id)
SELECT
    r.id,
    p.id
FROM
    roles r
    JOIN permissions p ON p.key IN ('auth.me.read')
WHERE
    r.key = 'ecommerce_manager' ON CONFLICT DO NOTHING;

-- migrate:down
DELETE FROM role_permissions
WHERE
    role_id = (
        SELECT
            id
        FROM
            roles
        WHERE
            key = 'admin'
    )
    AND permission_id IN (
        SELECT
            id
        FROM
            permissions
        WHERE
            key IN (
                'auth.me.read',
                'user.read',
                'user.create',
                'user.update',
                'user.deactivate'
            )
    );

DELETE FROM role_permissions
WHERE
    role_id = (
        SELECT
            id
        FROM
            roles
        WHERE
            key = 'content_manager'
    )
    AND permission_id = (
        SELECT
            id
        FROM
            permissions
        WHERE
            key = 'auth.me.read'
    );

DELETE FROM role_permissions
WHERE
    role_id = (
        SELECT
            id
        FROM
            roles
        WHERE
            key = 'ecommerce_manager'
    )
    AND permission_id = (
        SELECT
            id
        FROM
            permissions
        WHERE
            key = 'auth.me.read'
    );