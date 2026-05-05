package com.virtualchemistrylab.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.DatabaseMetaData;
import java.sql.SQLException;

/**
 * ╔══════════════════════════════════════════════════════════╗
 * ║ DatabaseConnectionSingleton ║
 * ║ Singleton Pattern - ensures only ONE instance ║
 * ║ manages and verifies Supabase PostgreSQL connection. ║
 * ╚══════════════════════════════════════════════════════════╝
 *
 * <p>
 * Spring Bean is Singleton by default (@Component).
 * This class adds a static holder so any non-Spring code
 * can also access the instance via {@link #getInstance()}.
 * </p>
 */
@Component
public class DatabaseConnectionSingleton {

    private static final Logger log = LoggerFactory.getLogger(DatabaseConnectionSingleton.class);

    /** Static holder – thread-safe, lazy-init (Bill Pugh Singleton) */
    private static volatile DatabaseConnectionSingleton INSTANCE;

    private final DataSource dataSource;
    private boolean verified = false;

    // ── Constructor injection (managed by Spring) ─────────────────────────
    @Autowired
    public DatabaseConnectionSingleton(DataSource dataSource) {
        this.dataSource = dataSource;
        if (INSTANCE == null) {
            INSTANCE = this;
        }
    }

    /**
     * Returns the singleton instance.
     * If Spring has not initialized this Bean yet, returns null and logs a warning.
     */
    public static DatabaseConnectionSingleton getInstance() {
        if (INSTANCE == null) {
            LoggerFactory.getLogger(DatabaseConnectionSingleton.class)
                    .warn("DatabaseConnectionSingleton has not been initialized by Spring!");
        }
        return INSTANCE;
    }

    /**
     * Verifies the database connection.
     * Executed only once (lazy-verify); result is cached.
     *
     * @return {@code true} if connection is successful
     */
    public synchronized boolean verifyAndLog() {
        if (verified) {
            log.debug("DB connection already verified previously - skipping this check.");
            return true;
        }

        log.info("Verifying connection to Supabase PostgreSQL...");

        try (Connection conn = dataSource.getConnection()) {
            DatabaseMetaData meta = conn.getMetaData();
            String dbProduct = meta.getDatabaseProductName();
            String dbVersion = meta.getDatabaseProductVersion();
            String jdbcUrl = meta.getURL();
            String user = meta.getUserName();

            log.info("CONNECTION SUCCESSFUL!");
            verified = true;
            return true;

        } catch (SQLException ex) {
            log.error("CONNECTION FAILED!");
            return false;
        }
    }

    /**
     * Gets a connection from the pool for direct use.
     * Caller is responsible for closing the connection after use.
     */
    public Connection getConnection() throws SQLException {
        return dataSource.getConnection();
    }

    // ── Helper ────────────────────────────────────────────────────────────
    private String maskPassword(String url) {
        if (url == null)
            return "N/A";
        return url.replaceAll("password=[^&;]*", "password=****");
    }
}
