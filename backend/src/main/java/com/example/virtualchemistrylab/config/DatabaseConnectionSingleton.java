package com.example.virtualchemistrylab.config;

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
 * ║         DatabaseConnectionSingleton                     ║
 * ║  Singleton Pattern – đảm bảo chỉ có MỘT instance       ║
 * ║  quản lý và xác minh kết nối tới Supabase PostgreSQL.  ║
 * ╚══════════════════════════════════════════════════════════╝
 *
 * <p>Spring Bean đã là Singleton theo mặc định (@Component).
 * Class này bổ sung thêm static holder để bất kỳ code non-Spring
 * nào cũng có thể truy cập instance qua {@link #getInstance()}.</p>
 */
@Component
public class DatabaseConnectionSingleton {

    private static final Logger log = LoggerFactory.getLogger(DatabaseConnectionSingleton.class);

    /** Static holder – thread-safe, lazy-init (Bill Pugh Singleton) */
    private static volatile DatabaseConnectionSingleton INSTANCE;

    private final DataSource dataSource;
    private boolean verified = false;

    // ── Constructor injection (Spring quản lý) ─────────────────────────
    @Autowired
    public DatabaseConnectionSingleton(DataSource dataSource) {
        this.dataSource = dataSource;
        if (INSTANCE == null) {
            INSTANCE = this;
        }
    }

    /**
     * Trả về singleton instance.
     * Nếu Spring chưa khởi tạo Bean này, trả về null và log cảnh báo.
     */
    public static DatabaseConnectionSingleton getInstance() {
        if (INSTANCE == null) {
            LoggerFactory.getLogger(DatabaseConnectionSingleton.class)
                    .warn("⚠️  DatabaseConnectionSingleton chưa được Spring khởi tạo!");
        }
        return INSTANCE;
    }

    /**
     * Xác minh kết nối tới database.
     * Chỉ thực hiện một lần (lazy-verify); kết quả cache lại.
     *
     * @return {@code true} nếu kết nối thành công
     */
    public synchronized boolean verifyAndLog() {
        if (verified) {
            log.debug("🔄  Kết nối DB đã được xác minh trước đó – bỏ qua lần kiểm tra này.");
            return true;
        }

        log.info("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        log.info("🔌  Đang kiểm tra kết nối tới Supabase PostgreSQL...");

        try (Connection conn = dataSource.getConnection()) {
            DatabaseMetaData meta = conn.getMetaData();
            String dbProduct  = meta.getDatabaseProductName();
            String dbVersion  = meta.getDatabaseProductVersion();
            String jdbcUrl    = meta.getURL();
            String user       = meta.getUserName();

            log.info("✅  KẾT NỐI THÀNH CÔNG!");
            log.info("    ┌─────────────────────────────────────────────────");
            log.info("    │  🗄️  Database   : {}", dbProduct);
            log.info("    │  📦  Version    : {}", dbVersion);
            log.info("    │  🌐  JDBC URL   : {}", maskPassword(jdbcUrl));
            log.info("    │  👤  Username   : {}", user);
            log.info("    │  🔗  Pool Type  : HikariCP");
            log.info("    └─────────────────────────────────────────────────");
            log.info("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

            verified = true;
            return true;

        } catch (SQLException ex) {
            log.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
            log.error("❌  KẾT NỐI THẤT BẠI!");
            log.error("    ┌─────────────────────────────────────────────────");
            log.error("    │  💥  Error Code : {}", ex.getErrorCode());
            log.error("    │  📝  SQL State  : {}", ex.getSQLState());
            log.error("    │  📋  Message    : {}", ex.getMessage());
            log.error("    └─────────────────────────────────────────────────");
            log.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
            return false;
        }
    }

    /**
     * Lấy một connection từ pool để dùng trực tiếp.
     * Caller có trách nhiệm đóng connection sau khi dùng.
     */
    public Connection getConnection() throws SQLException {
        return dataSource.getConnection();
    }

    // ── Helper ────────────────────────────────────────────────────────────
    private String maskPassword(String url) {
        if (url == null) return "N/A";
        return url.replaceAll("password=[^&;]*", "password=****");
    }
}
