package com.virtualchemistrylab.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

/**
 * ╔══════════════════════════════════════════════════════════╗
 * ║ ConnectionHealthListener ║
 * ║ Listens for ApplicationReady event -> automatically ║
 * ║ verifies DB connection via DatabaseConnectionSingleton ║
 * ║ and prints banner result to Terminal. ║
 * ╚══════════════════════════════════════════════════════════╝
 */
@Component
public class ConnectionHealthListener {

    private static final Logger log = LoggerFactory.getLogger(ConnectionHealthListener.class);

    private final DatabaseConnectionSingleton dbSingleton;

    public ConnectionHealthListener(DatabaseConnectionSingleton dbSingleton) {
        this.dbSingleton = dbSingleton;
    }

    /**
     * Runs automatically AFTER Spring Boot finishes startup.
     * The {@link ApplicationReadyEvent} ensures DataSource
     * is ready before attempting connection.
     */
    @EventListener(ApplicationReadyEvent.class)
    public void onApplicationReady() {
        boolean ok = dbSingleton.verifyAndLog();

        if (ok) {
            log.info("Application startup complete - Supabase PostgreSQL is ready!");
        } else {
            log.error("WARNING: Database connection FAILED. Please check Supabase configuration.");
        }
        log.info("");
    }
}
