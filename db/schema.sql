CREATE TABLE companies (
    company_id SERIAL PRIMARY KEY,
    name character varying(200)
);

CREATE TABLE admins (
    admin_id SERIAL PRIMARY KEY,
    company_id integer REFERENCES companies (company_id),
    email character varying(200) UNIQUE,
    password character varying(200),
    salt character varying(200)
);

CREATE TABLE sessions (
    admin_id integer REFERENCES admins (admin_id) ON DELETE CASCADE,
    session_id character varying(200),
    ip_address character varying(200),
    source character varying(200),
    time_created timestamp with time zone,
    last_access timestamp with time zone,
    UNIQUE (source, admin_id)
);

CREATE TABLE company_branches (
    branch_id SERIAL PRIMARY KEY,
    branch_name character varying(200),
    company_id integer REFERENCES companies (company_id) ON DELETE CASCADE,
    branch_key character varying(30)
);

CREATE TABLE groups (
    group_id SERIAL PRIMARY KEY,
    branch_id integer REFERENCES company_branches (branch_id) ON DELETE CASCADE,
    group_name character varying(200),
    queue_seed integer DEFAULT 0,
    queue_prefix character varying(5) NOT NULL,
    est_time integer DEFAULT 1800
);

CREATE TABLE users (
    group_user_id BIGSERIAL PRIMARY KEY,
    group_id integer REFERENCES groups (group_id) ON DELETE CASCADE,
    time_created timestamp with time zone,
    status character varying(20),
    mobile character varying(100),
    key character varying(200),
    queue integer,
    time_cleared timestamp with time zone
);

CREATE TABLE settings (
    setting_id SERIAL PRIMARY KEY,
    name character varying(200) UNIQUE,
    value character varying(255)
);