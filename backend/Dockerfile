# Stage 1: Build the application
FROM maven:3.9.6-eclipse-temurin-21 AS builder
WORKDIR /app
COPY pom.xml .
# Resolve dependencies to cache them
RUN mvn dependency:go-offline
COPY src ./src
# Build the application
RUN mvn package -DskipTests

# Stage 2: Run the application
FROM eclipse-temurin:21-jre-jammy
WORKDIR /app
COPY --from=builder /app/target/*.jar app.jar

# Expose the default Spring Boot port
EXPOSE 8080

# Spring Boot reads env vars automatically (e.g. SERVER_PORT, SPRING_DATASOURCE_URL)
# All secrets should be set as environment variables on Render, not baked into the image.
ENTRYPOINT ["java", "-Xmx384m", "-Xms128m", "-XX:+UseSerialGC", "-Dspring.profiles.active=prod", "-jar", "app.jar"]
