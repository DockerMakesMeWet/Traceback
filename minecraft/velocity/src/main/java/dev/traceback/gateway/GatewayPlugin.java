package dev.traceback.gateway;

import com.google.inject.Inject;
import com.velocitypowered.api.event.Subscribe;
import com.velocitypowered.api.event.connection.PluginMessageEvent;
import com.velocitypowered.api.event.proxy.ProxyInitializeEvent;
import com.velocitypowered.api.event.proxy.ProxyShutdownEvent;
import com.velocitypowered.api.plugin.Plugin;
import com.velocitypowered.api.plugin.annotation.DataDirectory;
import com.velocitypowered.api.proxy.ProxyServer;
import com.velocitypowered.api.proxy.ServerConnection;
import dev.traceback.gateway.api.ControlPlaneClient;
import dev.traceback.gateway.api.InformantClient;
import dev.traceback.gateway.config.GatewayConfig;
import dev.traceback.gateway.listener.ChatListener;
import dev.traceback.gateway.listener.CommandListener;
import org.slf4j.Logger;
import org.spongepowered.configurate.CommentedConfigurationNode;
import org.spongepowered.configurate.hocon.HoconConfigurationLoader;
import org.spongepowered.configurate.serialize.SerializationException;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

@Plugin(
        id = "traceback-gateway",
        name = "Traceback Gateway",
        version = "1.0.0",
        description = "Velocity-side component of the Traceback monitoring system",
        authors = {"Traceback"}
)
public class GatewayPlugin {

    private final ProxyServer proxy;
    private final Logger logger;
    private final Path dataDirectory;

    private GatewayConfig config;
    private InformantClient informantClient;

    @Inject
    public GatewayPlugin(ProxyServer proxy, Logger logger, @DataDirectory Path dataDirectory) {
        this.proxy = proxy;
        this.logger = logger;
        this.dataDirectory = dataDirectory;
    }

    @Subscribe
    public void onProxyInit(ProxyInitializeEvent event) {
        try {
            config = loadConfig();
        } catch (Exception e) {
            logger.error("Failed to load config, using defaults: {}", e.getMessage());
            config = new GatewayConfig();
        }

        ControlPlaneClient controlPlane = new ControlPlaneClient(config, logger);
        informantClient = new InformantClient(proxy, config, logger);

        // Register plugin message channel so Velocity forwards responses from backends
        proxy.getChannelRegistrar().register(InformantClient.CHANNEL);

        proxy.getEventManager().register(this, new CommandListener(controlPlane, informantClient, logger));
        proxy.getEventManager().register(this, new ChatListener(controlPlane, informantClient, logger));

        logger.info("Traceback Gateway enabled — control plane: {}", config.getControlPlaneUrl());
    }

    @Subscribe
    public void onPluginMessage(PluginMessageEvent event) {
        if (!event.getIdentifier().equals(InformantClient.CHANNEL)) return;
        if (!(event.getSource() instanceof ServerConnection)) return;

        // The backend routes the reply through the player's connection.
        // We intercept it here before it reaches the client.
        event.setResult(PluginMessageEvent.ForwardResult.handled());

        if (informantClient != null) {
            // Extract UUID from the data — the backend echoes the UUID as a prefix.
            // Format: 36-byte UUID string + '\n' + JSON payload
            byte[] data = event.getData();
            String raw = new String(data, java.nio.charset.StandardCharsets.UTF_8);
            int nl = raw.indexOf('\n');
            if (nl < 0) return;
            try {
                java.util.UUID uuid = java.util.UUID.fromString(raw.substring(0, nl));
                byte[] payload = raw.substring(nl + 1).getBytes(java.nio.charset.StandardCharsets.UTF_8);
                informantClient.handleResponse(uuid, payload);
            } catch (IllegalArgumentException ignored) {}
        }
    }

    @Subscribe
    public void onProxyShutdown(ProxyShutdownEvent event) {
        proxy.getChannelRegistrar().unregister(InformantClient.CHANNEL);
        logger.info("Traceback Gateway disabled.");
    }

    private GatewayConfig loadConfig() throws IOException, SerializationException {
        if (!Files.exists(dataDirectory)) {
            Files.createDirectories(dataDirectory);
        }
        Path configFile = dataDirectory.resolve("config.conf");

        HoconConfigurationLoader loader = HoconConfigurationLoader.builder()
                .path(configFile)
                .build();

        CommentedConfigurationNode root = Files.exists(configFile)
                ? loader.load()
                : loader.createNode();

        GatewayConfig cfg = root.get(GatewayConfig.class);
        if (cfg == null) cfg = new GatewayConfig();

        // Persist defaults / comments back to disk
        root.set(GatewayConfig.class, cfg);
        loader.save(root);

        return cfg;
    }
}
