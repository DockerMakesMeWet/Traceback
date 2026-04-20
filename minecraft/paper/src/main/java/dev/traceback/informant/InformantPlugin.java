package dev.traceback.informant;

import dev.traceback.informant.config.InformantConfig;
import dev.traceback.informant.console.ConsoleBroadcaster;
import dev.traceback.informant.handler.LocationHandler;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.core.Logger;
import org.bukkit.plugin.java.JavaPlugin;

public class InformantPlugin extends JavaPlugin {

    private static final String LOCATION_CHANNEL = "traceback:location";

    private ConsoleBroadcaster consoleBroadcaster;

    @Override
    public void onEnable() {
        saveDefaultConfig();
        InformantConfig config = new InformantConfig(getConfig());

        getServer().getMessenger().registerIncomingPluginChannel(this, LOCATION_CHANNEL, new LocationHandler(this));
        getServer().getMessenger().registerOutgoingPluginChannel(this, LOCATION_CHANNEL);

        consoleBroadcaster = ConsoleBroadcaster.create(
                "TracebackConsoleBroadcaster",
                config.getRedisHost(),
                config.getRedisPort(),
                config.getRedisPassword(),
                config.getServerId()
        );
        consoleBroadcaster.start();

        Logger rootLogger = (Logger) LogManager.getRootLogger();
        rootLogger.addAppender(consoleBroadcaster);

        getLogger().info(String.format(
                "Traceback Informant enabled \u2014 Redis %s:%d, server-id=%d",
                config.getRedisHost(), config.getRedisPort(), config.getServerId()));
    }

    @Override
    public void onDisable() {
        if (consoleBroadcaster != null) {
            Logger rootLogger = (Logger) LogManager.getRootLogger();
            rootLogger.removeAppender(consoleBroadcaster);
            consoleBroadcaster.stop();
        }

        getServer().getMessenger().unregisterIncomingPluginChannel(this);
        getServer().getMessenger().unregisterOutgoingPluginChannel(this);

        getLogger().info("Traceback Informant disabled.");
    }
}
