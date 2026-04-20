package dev.traceback.gateway.config;

import org.spongepowered.configurate.objectmapping.ConfigSerializable;
import org.spongepowered.configurate.objectmapping.meta.Comment;

@ConfigSerializable
public class GatewayConfig {

    @Comment("Base URL of the Traceback panel API")
    private String controlPlaneUrl = "https://traceback-api.wildowl.tech";

    @Comment("Server API key (set after registering the server in the panel)")
    private String apiKey = "changeme";

    @Comment("Numeric ID of this server as registered in the panel")
    private int serverId = 1;

    @Comment("Milliseconds to wait for a location reply from a backend")
    private long locationTimeoutMs = 2000;

    @Comment("Redis connection settings")
    private RedisConfig redis = new RedisConfig();

    public String getControlPlaneUrl() { return controlPlaneUrl; }
    public String getApiKey() { return apiKey; }
    public int getServerId() { return serverId; }
    public long getLocationTimeoutMs() { return locationTimeoutMs; }
    public RedisConfig getRedis() { return redis; }

    @ConfigSerializable
    public static class RedisConfig {
        private String host = "127.0.0.1";
        private int port = 6379;
        private String password = "";

        public String getHost() { return host; }
        public int getPort() { return port; }
        public String getPassword() { return password; }
    }
}
