package dev.traceback.gateway.api;

import com.google.gson.Gson;
import com.google.gson.JsonObject;
import dev.traceback.gateway.config.GatewayConfig;
import org.slf4j.Logger;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.concurrent.CompletableFuture;

public class ControlPlaneClient {

    private static final Gson GSON = new Gson();

    private final HttpClient http;
    private final GatewayConfig config;
    private final Logger logger;

    public ControlPlaneClient(GatewayConfig config, Logger logger) {
        this.config = config;
        this.logger = logger;
        this.http = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(5))
                .build();
    }

    public CompletableFuture<Void> ingestCommand(
            String playerUuid,
            String playerUsername,
            String command,
            String world,
            double x, double y, double z
    ) {
        JsonObject body = new JsonObject();
        body.addProperty("playerUuid", playerUuid);
        body.addProperty("playerUsername", playerUsername);
        body.addProperty("serverId", config.getServerId());
        body.addProperty("command", command);
        body.addProperty("world", world);
        body.addProperty("x", x);
        body.addProperty("y", y);
        body.addProperty("z", z);

        return post("/ingest/command", body);
    }

    public CompletableFuture<Void> ingestChat(
            String playerUuid,
            String playerUsername,
            String message,
            String world
    ) {
        JsonObject body = new JsonObject();
        body.addProperty("playerUuid", playerUuid);
        body.addProperty("playerUsername", playerUsername);
        body.addProperty("serverId", config.getServerId());
        body.addProperty("message", message);
        body.addProperty("world", world);

        return post("/ingest/chat", body);
    }

    private CompletableFuture<Void> post(String path, JsonObject body) {
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(config.getControlPlaneUrl() + path))
                .header("Content-Type", "application/json")
                .header("X-Traceback-Key", config.getApiKey())
                .POST(HttpRequest.BodyPublishers.ofString(GSON.toJson(body)))
                .timeout(Duration.ofSeconds(10))
                .build();

        return http.sendAsync(request, HttpResponse.BodyHandlers.discarding())
                .thenAccept(response -> {
                    if (response.statusCode() >= 400) {
                        logger.warn("Control plane returned {} for {}", response.statusCode(), path);
                    }
                })
                .exceptionally(ex -> {
                    logger.error("Failed to POST {}: {}", path, ex.getMessage());
                    return null;
                });
    }
}
