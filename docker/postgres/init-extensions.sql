CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS hstore;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Migrate vector_store embedding dimensions if switching to Gemini (vector 768)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'vector_store' AND column_name = 'embedding'
    ) THEN
        DROP INDEX IF EXISTS vector_store_embedding_idx;
        TRUNCATE TABLE vector_store;
        ALTER TABLE vector_store ALTER COLUMN embedding TYPE vector(768);
    END IF;
END $$;
