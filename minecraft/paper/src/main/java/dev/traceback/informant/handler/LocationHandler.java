package dev.traceback.informant.handler;

import com.google.gson.Gson;
import com.google.gson.JsonObject;
import org.bukkit.entity.Player;
import org.bukkit.plugin.Plugin;
import org.bukkit.plugin.messaging.PluginMessageListener;
import org.jetbrains.annotations.NotNull;

import java.nio.charset.StandardCharsets;
import java.util.UUID;

public class LocationHandler implements PluginMessageListener {

    private static final Gson GSON = new Gson();
    private static final String CHANNEL = "traceback:location";

    private final Plugin plugin;

    public LocationHandler(Plugin plugin) {
        this.plugin = plugin;
    }

    @Override
    public void onPluginMessageReceived(@NotNull String channel, @NotNull Player unused, byte @NotNull [] message) {
        if (!CHANNEL.equals(channel)) return;

        String uuidStr = new String(message, StandardCharsets.UTF_8).trim();
        UUID uuid;
        try {
            uuid = UUID.fromString(uuidStr);
        } catch (IllegalArgumentException e) {
            return;
        }

        Player player = plugin.getServer().getPlayer(uuid);
        if (player == null || !player.isOnline()) return;

        JsonObject loc = new JsonObject();
        loc.addProperty("world", player.getWorld().getName());
        loc.addProperty("x", player.getLocation().getX());
        loc.addProperty("y", player.getLocation().getY());
        loc.addProperty("z", player.getLocation().getZ());

        // Reply format: "<uuid>\n<json>" so the proxy can route to the right future
        String reply = uuidStr + "\n" + GSON.toJson(loc);
        player.sendPluginMessage(plugin, CHANNEL, reply.getBytes(StandardCharsets.UTF_8));
    }
}
