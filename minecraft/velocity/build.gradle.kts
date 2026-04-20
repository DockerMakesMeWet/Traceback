plugins {
    id("com.gradleup.shadow") version "9.0.0-beta4"
    id("xyz.jpenilla.run-velocity") version "2.3.1"
}

repositories {
    maven("https://repo.papermc.io/repository/maven-public/")
}

dependencies {
    compileOnly("com.velocitypowered:velocity-api:3.3.0-SNAPSHOT")
    annotationProcessor("com.velocitypowered:velocity-api:3.3.0-SNAPSHOT")

    // Guice (provided by Velocity)
    compileOnly("com.google.inject:guice:7.0.0")

    // Configurate YAML (Velocity ships Configurate core; YAML loader + SnakeYAML must be shaded)
    implementation("org.spongepowered:configurate-yaml:4.1.2")

    // JSON
    implementation("com.google.code.gson:gson:2.11.0")
}

tasks {
    shadowJar {
        archiveClassifier.set("")
        relocate("com.google.gson", "dev.traceback.gateway.libs.gson")
        relocate("org.spongepowered.configurate", "dev.traceback.gateway.libs.configurate")
        relocate("io.leangen.geantyref", "dev.traceback.gateway.libs.geantyref")
        relocate("org.yaml.snakeyaml", "dev.traceback.gateway.libs.snakeyaml")
    }
    assemble {
        dependsOn(shadowJar)
    }
}
