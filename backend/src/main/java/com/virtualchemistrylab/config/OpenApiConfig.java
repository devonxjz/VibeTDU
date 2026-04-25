package com.virtualchemistrylab.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.servers.Server;
import io.swagger.v3.oas.models.tags.Tag;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

/**
 * OpenAPI 3 / Swagger UI configuration.
 *
 * Swagger UI: http://localhost:8080/swagger-ui.html
 * OpenAPI JSON: http://localhost:8080/v3/api-docs
 */
@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI virtualChemLabOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("🧪 Virtual Chemistry Lab – API")
                        .description("""
                                **Backend API** cho Phòng thí nghiệm hóa học ảo.

                                ## Tính năng chính
                                - 🔬 **Giải mã hóa chất** – resolve tên/công thức từ PubChem, Cactus, OPSIN
                                - ⚗️ **Mô phỏng phản ứng** – dự đoán phản ứng qua AI (Google Gemini)
                                - 💬 **Hỏi đáp AI** – giải thích hiện tượng hóa học bằng tiếng Việt
                                - 📝 **Lịch sử thí nghiệm** – ghi log theo sessionCode

                                ## Cách dùng
                                1. Gọi `GET /api/health` để kiểm tra backend
                                2. Gọi `POST /api/lab/mix` với danh sách hóa chất để nhận kết quả phản ứng
                                3. Gọi `POST /api/ai/ask` để hỏi giải thích hiện tượng

                                ## Rate Limit
                                Mỗi `sessionCode` chỉ được gọi `/api/lab/mix` tối đa **1 lần mỗi 2 giây**.
                                """)
                        .version("1.0.0")
                        .contact(new Contact()
                                .name("Virtual Chemistry Lab Team")
                                .email("dev@virtualchemlab.edu.vn"))
                        .license(new License()
                                .name("MIT License")
                                .url("https://opensource.org/licenses/MIT")))
                .servers(List.of(
                        new Server().url("http://localhost:8080").description("Local Development Server")
                ))
                .tags(List.of(
                        new Tag().name("Health").description("Server health check"),
                        new Tag().name("Lab").description("Mixing chemicals and session management"),
                        new Tag().name("Chemical").description("Chemical name resolution"),
                        new Tag().name("AI").description("AI-powered chemistry Q&A")
                ));
    }
}
