-- Script de creación de base de datos para OLO basado en modelos Sequelize
-- Compatible con PostgreSQL
-- Habilitar extensión pgcrypto para gen_random_uuid() si es necesario en versiones antiguas
CREATE EXTENSION IF NOT EXISTS pgcrypto;
-- ==========================================
-- 1. Tablas de Seguridad y Autenticación
-- ==========================================
CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE role_permissions (
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT,
    role_id UUID NOT NULL REFERENCES roles(id),
    status TEXT NOT NULL DEFAULT 'active',
    expiration_date TIMESTAMPTZ,
    last_access_at TIMESTAMPTZ,
    must_setup_security_questions BOOLEAN DEFAULT true,
    must_change_password BOOLEAN DEFAULT false,
    failed_security_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE security_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    question_key TEXT NOT NULL,
    answer_hash TEXT NOT NULL,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_user_question UNIQUE (user_id, question_key)
);
CREATE TABLE usuarios_sitio (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT,
    status TEXT DEFAULT 'active',
    created_by UUID REFERENCES users(id),
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
-- ==========================================
-- 2. Tablas del CMS (Arquitectura Nueva)
-- ==========================================
CREATE TABLE paginas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug VARCHAR(255) NOT NULL UNIQUE,
    titulo VARCHAR(255) NOT NULL,
    version_publicada_id UUID, -- Definida abajo como FK circular
    creado_por UUID NOT NULL REFERENCES users(id),
    creado_en TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE paginas_versiones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pagina_id UUID NOT NULL REFERENCES paginas(id) ON DELETE CASCADE,
    contenido JSONB NOT NULL,
    layout JSONB,
    numero_version INTEGER NOT NULL,
    estado VARCHAR(20) DEFAULT 'borrador',
    motivo_rechazo TEXT,
    revisor_id UUID REFERENCES users(id),
    publicado_por UUID REFERENCES users(id),
    publicado_en TIMESTAMPTZ,
    creado_en TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
-- Agregar Foreign Key circular
ALTER TABLE paginas 
ADD CONSTRAINT fk_paginas_version_publicada 
FOREIGN KEY (version_publicada_id) REFERENCES paginas_versiones(id);
CREATE TABLE content_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type TEXT NOT NULL,
    entity_id UUID NOT NULL,
    action TEXT NOT NULL,
    user_id UUID REFERENCES users(id),
    changes JSONB,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
-- ==========================================
-- 3. Tablas Legacy (A ser migradas en Fase 4)
-- ==========================================
CREATE TABLE "Section" (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    "createdAt" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE "Post" (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    excerpt TEXT,
    content TEXT NOT NULL,
    "sectionId" TEXT NOT NULL REFERENCES "Section"(id) ON DELETE CASCADE,
    "authorId" TEXT,
    "publishedAt" TIMESTAMPTZ,
    "createdAt" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE "Attachment" (
    id TEXT PRIMARY KEY,
    "postId" TEXT NOT NULL REFERENCES "Post"(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    url TEXT NOT NULL,
    "size" INTEGER,
    "mimeType" TEXT,
    "createdAt" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);