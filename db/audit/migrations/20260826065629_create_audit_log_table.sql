-- migrate:up
CREATE TABLE
    audit_log (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
        action TEXT NOT NULL,
        entity_name TEXT NOT NULL,
        entity_id TEXT NOT NULL,
        payload JSONB,
        performed_by TEXT,
        performed_at TIMESTAMPTZ NOT NULL DEFAULT now (),
        client_ip TEXT,
        request_id TEXT,
        notes TEXT
    );

CREATE INDEX idx_audit_log_entity_name_id ON audit_log (entity_name, entity_id);

CREATE INDEX idx_audit_log_performed_at ON audit_log (performed_at DESC);

CREATE INDEX idx_audit_log_performed_by ON audit_log (performed_by);

CREATE INDEX idx_audit_log_client_ip ON audit_log (client_ip);

CREATE INDEX idx_audit_log_request_id ON audit_log (request_id);

-- migrate:down
DROP TABLE IF EXISTS audit_log;