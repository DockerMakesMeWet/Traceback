package dev.traceback.gateway.api;

import com.google.gson.Gson;
import com.google.gson.JsonObject;
import com.velocitypowered.api.proxy.Player;
import com.velocitypowered.api.proxy.ProxyServer;
import com.velocitypowered.api.proxy.messages.MinecraftChannelIdentifier;
import dev.traceback.gateway.config.GatewayConfig;
import org.slf4j.Logger;

import java.nio.charset.StandardCharsets;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;

public class InformantClient {

    public static final MinecraftChannelIdentifier CHANNEL =
            MinecraftChannelIdentifier.from("traceback:location");

    private static final Gson GSON = new Gson();

    private final ProxyServer proxy;
    private final GatewayConfig config;
    private final Logger logger;

    // uuid → pending future
    private final Map<UUID, CompletableFuture<LocationData>> pending = new ConcurrentHashMap<>();

    public InformantClient(ProxyServer proxy, GatewayConfig config, Logger logger) {
        this.proxy = proxy;
        this.config = config;
        this.logger = logger;
    }

    public CompletableFuture<LocationData> requestLocation(Player player) {
        CompletableFuture<LocationData> future = new CompletableFuture<LocationData>()
                .orTimeout(config.getLocationTimeoutMs(), TimeUnit.MILLISECONDS);

        pending.put(player.getUniqueId(), future);

        // Send request: just the UUID as UTF-8 bytes
        byte[] payload = player.getUniqueId().toString().getBytes(StandardCharsets.UTF_8);
        player.getCurrentServer().ifPresent(conn ->
                conn.sendPluginMessage(CHANNEL, payload));

        future.whenComplete((data, ex) -> pending.remove(player.getUniqueId()));
        return future;
    }

    /** Called by the plugin message listener when the backend replies. */
    public void handleResponse(UUID playerUuid, byte[] data) {
        CompletableFuture<LocationData> future = pending.get(playerUuid);
        if (future == null) return;

        try {
            String json = new String(data, StandardCharsets.UTF_8);
            JsonObject obj = GSON.fromJson(json, JsonObject.class);
            LocationData loc = new LocationData(
                    obj.get("world").getAsString(),
                    obj.get("x").getAsDouble(),
                    obj.get("y").getAsDouble(),
                    obj.get("z").getAsDouble()
            );
            future.complete(loc);
        } catch (Exception e) {
            logger.warn("Failed to parse location response for {}: {}", playerUuid, e.getMessage());
            future.completeExceptionally(e);
        }
    }

    public record LocationData(String world, double x, double y, double z) {}
}
