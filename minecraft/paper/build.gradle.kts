plugins {
    id("com.gradleup.shadow") version "9.0.0-beta4"
    id("xyz.jpenilla.run-paper") version "2.3.1"
}

repositories {
    maven("https://repo.papermc.io/repository/maven-public/")
}

dependencies {
    compileOnly("io.papermc.paper:paper-api:1.21-R0.1-SNAPSHOT")

    // log4j-core: provided by Paper at runtime, needed here for compile-time access to
    // AbstractAppender and the @Plugin annotation family used in ConsoleBroadcaster.
    compileOnly("org.apache.logging.log4j:log4j-core:2.23.1")

    // Jedis for Redis pub/sub
    implementation("redis.clients:jedis:5.2.0")

    // JSON
    implementation("com.google.code.gson:gson:2.11.0")
}

version = "1.0.0"

tasks {
    shadowJar {
        archiveBaseName.set("Traceback-Paper")
        archiveClassifier.set("")
        relocate("redis.clients.jedis", "dev.traceback.informant.libs.jedis")
        relocate("com.google.gson", "dev.traceback.informant.libs.gson")
    }
    assemble {
        dependsOn(shadowJar)
    }
}
