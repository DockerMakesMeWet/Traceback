package dev.traceback.gateway.config;

import org.spongepowered.configurate.objectmapping.ConfigSerializable;
import org.spongepowered.configurate.objectmapping.meta.Comment;

@ConfigSerializable
public class GatewayConfig {

    @Comment("Base URL of the Traceback panel API")
    private String controlPlaneUrl = "http://localhost:4000";

    @Comment("Server API key (set after registering the server in the panel)")
    private String apiKey = "changeme";

    @Comment("Numeric ID of this server as registered in the panel")
    private int serverId = 1;

    @Comment("Milliseconds to wait for a location reply from a backend")
    private long locationTimeoutMs = 2000;

    public String getControlPlaneUrl() { return controlPlaneUrl; }
    public String getApiKey() { return apiKey; }
    public int getServerId() { return serverId; }
    public long getLocationTimeoutMs() { return locationTimeoutMs; }
}
