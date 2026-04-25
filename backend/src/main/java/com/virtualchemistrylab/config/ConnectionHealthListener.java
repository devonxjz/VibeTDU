package com.virtualchemistrylab.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

/**
 * ╔══════════════════════════════════════════════════════════╗
 * ║       ConnectionHealthListener                          ║
 * ║  Lắng nghe sự kiện ApplicationReady → tự động kiểm     ║
 * ║  tra kết nối DB qua DatabaseConnectionSingleton và      ║
 * ║  in banner kết quả ra Terminal.                         ║
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
     * Chạy tự động SAU KHI Spring Boot hoàn tất khởi động.
     * Sự kiện {@link ApplicationReadyEvent} đảm bảo DataSource
     * đã sẵn sàng trước khi gọi kết nối.
     */
    @EventListener(ApplicationReadyEvent.class)
    public void onApplicationReady() {
        log.info("");
        log.info("╔══════════════════════════════════════════════════════════════╗");
        log.info("║        🧪  Virtual Chemistry Lab – Backend Ready            ║");
        log.info("╠══════════════════════════════════════════════════════════════╣");
        log.info("║  🌐  Swagger UI   : http://localhost:8080/swagger-ui.html   ║");
        log.info("║  📋  API Docs     : http://localhost:8080/v3/api-docs        ║");
        log.info("╚══════════════════════════════════════════════════════════════╝");
        log.info("");

        boolean ok = dbSingleton.verifyAndLog();

        if (ok) {
            log.info("🚀  Ứng dụng khởi động hoàn tất – Supabase PostgreSQL đã sẵn sàng!");
        } else {
            log.error("🛑  Cảnh báo: Kết nối database THẤT BẠI. Kiểm tra lại cấu hình Supabase.");
        }
        log.info("");
    }
}
