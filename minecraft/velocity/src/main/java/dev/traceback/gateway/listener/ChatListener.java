package dev.traceback.gateway.listener;

import com.velocitypowered.api.event.Subscribe;
import com.velocitypowered.api.event.player.PlayerChatEvent;
import com.velocitypowered.api.proxy.Player;
import dev.traceback.gateway.api.ControlPlaneClient;
import dev.traceback.gateway.api.InformantClient;
import org.slf4j.Logger;

public class ChatListener {

    private final ControlPlaneClient controlPlane;
    private final InformantClient informant;
    private final Logger logger;

    public ChatListener(ControlPlaneClient controlPlane, InformantClient informant, Logger logger) {
        this.controlPlane = controlPlane;
        this.informant = informant;
        this.logger = logger;
    }

    @Subscribe
    public void onChat(PlayerChatEvent event) {
        Player player = event.getPlayer();
        String uuid = player.getUniqueId().toString();
        String username = player.getUsername();
        String message = event.getMessage();

        informant.requestLocation(player)
                .thenCompose(loc -> controlPlane.ingestChat(uuid, username, message, loc.world()))
                .exceptionally(ex -> {
                    controlPlane.ingestChat(uuid, username, message, "unknown");
                    return null;
                });
    }
}
