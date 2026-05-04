package com.virtualchemistrylab.config;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.context.annotation.Profile;

import javax.sql.DataSource;

/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║  DataSourceConfig - HikariCP -> Supabase PostgreSQL          ║
 * ║                                                              ║
 * ║  Using Direct Connection provided by the user                ║
 * ╚══════════════════════════════════════════════════════════════╝
 *
 * @Profile("!h2") - Not loaded when running with H2 profile (local dev)
 */
@Configuration
@Profile("!h2")
public class DataSourceConfig {

    private static final Logger log = LoggerFactory.getLogger(DataSourceConfig.class);

    // ── Supabase Connection Pooler (IPv4 - aws-1) ───────────────────────────
    @org.springframework.beans.factory.annotation.Value("${SPRING_DATASOURCE_URL:jdbc:postgresql://aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres?sslmode=require}")
    private String jdbcUrl;
    
    @org.springframework.beans.factory.annotation.Value("${SPRING_DATASOURCE_USERNAME:postgres.yesykibnglunqlspikin}")
    private String dbUser;
    
    @org.springframework.beans.factory.annotation.Value("${SPRING_DATASOURCE_PASSWORD:MSK&7%BX3FfSjN6}")
    private String dbPass;

    @Bean
    @Primary
    public DataSource supabaseDataSource() {
        log.info("Configuring HikariCP -> Supabase PostgreSQL (Session Pooler)...");

        HikariConfig config = new HikariConfig();
        config.setJdbcUrl(jdbcUrl);
        config.setUsername(dbUser);
        config.setPassword(dbPass);
        config.setDriverClassName("org.postgresql.Driver");

        // Pool settings - Supabase free tier allows max ~15 concurrent connections
        config.setPoolName("VCL-Supabase-Pool");
        config.setMaximumPoolSize(5);
        config.setMinimumIdle(0);         // 0 idle to conserve connection slots
        config.setConnectionTimeout(30_000);
        config.setIdleTimeout(600_000);
        config.setMaxLifetime(1_800_000);
        // Required for Connection Pooler (PgBouncer) to avoid Prepared Statement errors
        config.addDataSourceProperty("prepareThreshold", "0");
        config.setConnectionTestQuery("SELECT 1");
        
        log.info("HikariCP bean created successfully. URL: {}", jdbcUrl);

        return new HikariDataSource(config);
    }
}
