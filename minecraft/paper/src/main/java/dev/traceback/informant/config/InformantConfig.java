package dev.traceback.informant.config;

import org.bukkit.configuration.file.FileConfiguration;

public class InformantConfig {

    private final String redisHost;
    private final int redisPort;
    private final String redisPassword;
    private final int serverId;

    public InformantConfig(FileConfiguration cfg) {
        this.redisHost = cfg.getString("redis.host", "127.0.0.1");
        this.redisPort = cfg.getInt("redis.port", 6379);
        this.redisPassword = cfg.getString("redis.password", null);
        this.serverId = cfg.getInt("server-id", 1);
    }

    public String getRedisHost() { return redisHost; }
    public int getRedisPort() { return redisPort; }
    public String getRedisPassword() { return redisPassword; }
    public int getServerId() { return serverId; }
}
