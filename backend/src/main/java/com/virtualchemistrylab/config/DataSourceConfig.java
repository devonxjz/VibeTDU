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
        log.info("Configuring HikariCP -> Supabase PostgreSQL (Transaction Pooler on 6543)...");

        HikariConfig config = new HikariConfig();
        
        // Final recommended URL for Supabase Transaction Pooler
        String url = "jdbc:postgresql://aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres" +
                     "?sslmode=require" +
                     "&prepareThreshold=0" +
                     "&defaultRowFetchSize=0" +
                     "&tcpKeepAlive=true";
        
        config.setJdbcUrl(url);
        config.setUsername(dbUser);
        config.setPassword(dbPass);
        config.setDriverClassName("org.postgresql.Driver");

        // Pool settings
        config.setPoolName("VCL-Supabase-Pool");
        config.setMaximumPoolSize(5);
        config.setMinimumIdle(0);
        config.setConnectionTimeout(30000);
        config.setIdleTimeout(600000);
        config.setMaxLifetime(1800000);

        // ✅ Critical: Prevent Hikari from calling setTransactionIsolation() by using connectionInitSql
        config.setConnectionInitSql("SET SESSION CHARACTERISTICS AS TRANSACTION ISOLATION LEVEL READ COMMITTED");
        
        // ✅ Explicitly disable prepared statements (required for Transaction Pooler)
        config.addDataSourceProperty("prepareThreshold", "0");
        config.setConnectionTestQuery("SELECT 1");
        
        log.info("HikariCP bean created successfully. URL: {}", url);

        return new HikariDataSource(config);
    }
}
