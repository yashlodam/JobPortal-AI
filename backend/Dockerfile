# ==============================================================================
# Stage 1: Build Executable JAR with Maven & Eclipse Temurin JDK 21
# ==============================================================================
FROM eclipse-temurin:21-jdk-alpine AS builder

WORKDIR /build

# Copy Maven wrapper and POM first for efficient layer caching
COPY mvnw pom.xml ./
COPY .mvn .mvn

# Normalize line endings (CRLF -> LF) and set executable permission on wrapper
RUN sed -i 's/\r$//' mvnw && chmod +x mvnw

# Pre-download dependencies in a separate layer
RUN ./mvnw dependency:go-offline -B || true

# Copy source code and package application into executable JAR
COPY src src
RUN ./mvnw clean package -DskipTests

# ==============================================================================
# Stage 2: Minimal Production Runtime with Eclipse Temurin JRE 21
# ==============================================================================
FROM eclipse-temurin:21-jre-alpine

# Security: Create dedicated unprivileged system group & user (UID 10001)
RUN addgroup -g 10001 -S appuser && \
    adduser -u 10001 -S appuser -G appuser

WORKDIR /app

# Create upload directory and assign ownership to appuser
RUN mkdir -p /app/uploads && \
    chown -R appuser:appuser /app

# Copy executable JAR from builder stage with proper ownership
COPY --from=builder --chown=appuser:appuser /build/target/*.jar /app/app.jar

# Drop root privileges
USER appuser

# Render dynamically sets $PORT; default to 8080
ENV PORT=8080 \
    SPRING_PROFILES_ACTIVE=prod \
    FILE_UPLOAD_DIR=/app/uploads \
    JAVA_OPTS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=38.0 -XX:InitialRAMPercentage=15.0 -XX:MaxMetaspaceSize=192m -XX:CompressedClassSpaceSize=48m -XX:ReservedCodeCacheSize=32m -Xss384k -XX:+UseSerialGC -XX:+ExitOnOutOfMemoryError"

EXPOSE 8080

# Health check configuration for Docker runtime
HEALTHCHECK --interval=30s --timeout=5s --start-period=45s --retries=3 \
    CMD wget -qO- http://localhost:${PORT}/health || exit 1

# Signal propagation: "exec" ensures Java receives SIGTERM for graceful shutdown
ENTRYPOINT ["sh", "-c", "exec java $JAVA_OPTS -Dserver.port=${PORT} -Djava.security.egd=file:/dev/./urandom -jar app.jar"]
