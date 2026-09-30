# syntax=docker/dockerfile:1

# ---- build ----------------------------------------------------------------
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /build

# Dependencies first, so a source-only change reuses the cached layer.
COPY pom.xml .
RUN mvn -B -q dependency:go-offline

COPY src ./src
RUN mvn -B -q clean package -DskipTests

# ---- run ------------------------------------------------------------------
# JRE only: the build stage's JDK and the local Maven cache have no business in
# the runtime image.
FROM eclipse-temurin:17-jre-jammy AS runtime
WORKDIR /app

RUN groupadd --system app && useradd --system --gid app app

COPY --from=build /build/target/*.jar app.jar
RUN chown app:app app.jar
USER app

ENV JAVA_OPTS="-XX:MaxRAMPercentage=75 -XX:+UseSerialGC"

EXPOSE 8080

# Uses $PORT so the same image runs on Render/Railway/Fly (which inject it) and
# locally. 0.0.0.0 rather than localhost, or nothing outside the container can
# reach it.
ENV SERVER_PORT=8080
ENTRYPOINT ["sh", "-c", "exec java $JAVA_OPTS -jar app.jar --server.port=${PORT:-8080} --server.address=0.0.0.0"]
