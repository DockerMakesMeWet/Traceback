package dev.traceback.informant.console;

import org.apache.logging.log4j.core.Filter;
import org.apache.logging.log4j.core.LogEvent;
import org.apache.logging.log4j.core.appender.AbstractAppender;
import org.apache.logging.log4j.core.config.Property;
import redis.clients.jedis.Jedis;
import redis.clients.jedis.JedisPool;
import redis.clients.jedis.JedisPoolConfig;

public class ConsoleBroadcaster extends AbstractAppender {

    private final JedisPool jedisPool;
    private final String channel;

    private ConsoleBroadcaster(String name, Filter filter, JedisPool jedisPool, String channel) {
        super(name, filter, null, true, Property.EMPTY_ARRAY);
        this.jedisPool = jedisPool;
        this.channel = channel;
    }

    public static ConsoleBroadcaster create(String name, String redisHost, int redisPort,
                                             String redisPassword, int serverId) {
        JedisPoolConfig poolConfig = new JedisPoolConfig();
        poolConfig.setMaxTotal(4);

        JedisPool pool;
        if (redisPassword != null && !redisPassword.isBlank()) {
            pool = new JedisPool(poolConfig, redisHost, redisPort, 2000, redisPassword);
        } else {
            pool = new JedisPool(poolConfig, redisHost, redisPort, 2000);
        }

        return new ConsoleBroadcaster(name, null, pool, "traceback:console:" + serverId);
    }

    @Override
    public void append(LogEvent event) {
        String line = event.getMessage().getFormattedMessage();
        try (Jedis jedis = jedisPool.getResource()) {
            jedis.publish(channel, line);
        } catch (Exception ignored) {
            // Non-critical — avoid re-logging to prevent recursion
        }
    }

    @Override
    public void stop() {
        jedisPool.close();
        super.stop();
    }
}
