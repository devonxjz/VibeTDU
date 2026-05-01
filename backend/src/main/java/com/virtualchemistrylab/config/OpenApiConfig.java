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
                                **Backend API** for the Virtual Chemistry Lab.

                                ## Main Features
                                - **Chemical Resolution** - resolve names/formulas from PubChem, Cactus, OPSIN
                                - **Reaction Simulation** - predict reactions via AI (Google Gemini)
                                - **AI Q&A** - explain chemical phenomena
                                - **Experiment History** - log actions by sessionCode

                                ## Usage
                                1. Call `GET /api/health` to check backend status
                                2. Call `POST /api/lab/mix` with chemical list to get reaction results
                                3. Call `POST /api/ai/ask` to ask for phenomenon explanations

                                ## Rate Limit
                                Each `sessionCode` can call `/api/lab/mix` at most **once every 2 seconds**.
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
