package devPilot.backend.config;

import javax.sql.DataSource;

import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.Statement;

import org.springframework.beans.BeansException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.beans.factory.config.BeanPostProcessor;
import org.springframework.stereotype.Component;

import lombok.extern.slf4j.Slf4j;

@Component
@Slf4j
public class PgVectorSchemaMigration implements BeanPostProcessor {

    @Value("${spring.ai.vectorstore.pgvector.dimensions:768}")
    private int targetDimensions;

    @Override
    public Object postProcessAfterInitialization(Object bean, String beanName) throws BeansException {
        if (bean instanceof DataSource dataSource) {
            migrateDimensionsIfNeeded(dataSource);
        }
        return bean;
    }

    private void migrateDimensionsIfNeeded(DataSource dataSource) {
        try (Connection conn = dataSource.getConnection();
             Statement stmt = conn.createStatement()) {

            // Check if vector_store table and embedding column exist
            ResultSet rs = stmt.executeQuery("""
                SELECT atttypmod
                FROM pg_attribute a
                JOIN pg_class c ON a.attrelid = c.oid
                JOIN pg_namespace n ON c.relnamespace = n.oid
                WHERE c.relname = 'vector_store'
                  AND a.attname = 'embedding'
                  AND a.attnum > 0
                  AND NOT a.attisdropped
            """);

            if (rs.next()) {
                int currentDimension = rs.getInt(1);
                if (currentDimension > 0 && currentDimension != targetDimensions) {
                    log.info("Migrating vector_store embedding dimensions from {} to {}", currentDimension, targetDimensions);
                    stmt.execute("DROP INDEX IF EXISTS vector_store_embedding_idx;");
                    stmt.execute("TRUNCATE TABLE vector_store;");
                    stmt.execute("ALTER TABLE vector_store ALTER COLUMN embedding TYPE vector(" + targetDimensions + ");");
                    log.info("Successfully updated vector_store embedding to vector({})", targetDimensions);
                }
            }
        } catch (Exception ex) {
            log.debug("Vector store migration skipped or table does not exist yet: {}", ex.getMessage());
        }
    }
}

