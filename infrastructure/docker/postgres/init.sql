-- Career Transparency Platform - PostgreSQL Init
-- Enable required extensions

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";      -- for fuzzy text search
CREATE EXTENSION IF NOT EXISTS "unaccent";      -- for Persian/Arabic text normalization
CREATE EXTENSION IF NOT EXISTS "btree_gin";     -- for composite GIN indexes

-- Shadow database for Prisma migrations
CREATE DATABASE career_platform_shadow;
