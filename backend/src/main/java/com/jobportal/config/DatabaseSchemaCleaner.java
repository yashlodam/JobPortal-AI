package com.jobportal.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

/**
 * Startup schema cleaner that dynamically drops all obsolete legacy collection tables
 * matching resume_analysis_* with CASCADE (which were replaced by StringListConverter JSON columns).
 * Disabled by default in production to eliminate startup overhead.
 */
@Component
@ConditionalOnProperty(name = "app.schema.cleaner.enabled", havingValue = "true", matchIfMissing = false)
public class DatabaseSchemaCleaner implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(DatabaseSchemaCleaner.class);

    private final JdbcTemplate jdbcTemplate;

    public DatabaseSchemaCleaner(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public void run(ApplicationArguments args) {
        log.info("Checking and cleaning legacy schema artifacts...");
        try {
            jdbcTemplate.execute("""
                DO $$
                DECLARE
                    r RECORD;
                BEGIN
                    FOR r IN (
                        SELECT table_name 
                        FROM information_schema.tables 
                        WHERE table_schema = 'public' 
                          AND table_name LIKE 'resume_analysis_%'
                    )
                    LOOP
                        EXECUTE 'DROP TABLE IF EXISTS ' || quote_ident(r.table_name) || ' CASCADE';
                    END LOOP;
                END $$;
            """);
            log.info("Schema cleanup completed successfully. All legacy resume_analysis child tables dropped.");
        } catch (Exception e) {
            log.warn("Schema cleanup error: {}", e.getMessage());
        }
    }
}
