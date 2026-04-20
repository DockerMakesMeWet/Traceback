package dev.traceback.gateway.listener;

import com.velocitypowered.api.event.Subscribe;
import com.velocitypowered.api.event.command.CommandExecuteEvent;
import com.velocitypowered.api.proxy.Player;
import dev.traceback.gateway.api.ControlPlaneClient;
import dev.traceback.gateway.api.InformantClient;
import org.slf4j.Logger;

public class CommandListener {

    private final ControlPlaneClient controlPlane;
    private final InformantClient informant;
    private final Logger logger;

    public CommandListener(ControlPlaneClient controlPlane, InformantClient informant, Logger logger) {
        this.controlPlane = controlPlane;
        this.informant = informant;
        this.logger = logger;
    }

    @Subscribe(priority = -100)
    public void onCommand(CommandExecuteEvent event) {
        if (!(event.getCommandSource() instanceof Player player)) return;

        String command = "/" + event.getCommand();

        informant.requestLocation(player)
                .thenCompose(loc -> controlPlane.ingestCommand(
                        player.getUniqueId().toString(),
                        command,
                        loc.world(),
                        loc.x(), loc.y(), loc.z()
                ))
                .exceptionally(ex -> {
                    // Location timed out — still log the command without coordinates
                    controlPlane.ingestCommand(
                            player.getUniqueId().toString(),
                            command,
                            "unknown",
                            0, 0, 0
                    );
                    return null;
                });
    }
}
