export const typeDefs = /* GraphQL */ `
  type Server {
    id: Int!
    name: String!
    enabled: Boolean!
    createdAt: String!
    config: ServerConfig
  }

  type ServerConfig {
    serverId: Int!
    worldName: String!
    logCommands: Boolean!
    logChat: Boolean!
    updatedAt: String!
  }

  type Player {
    uuid: ID!
    username: String!
    firstSeen: String!
    lastSeen: String!
  }

  type CommandLog {
    id: Int!
    player: Player!
    server: Server!
    world: String!
    x: Float!
    y: Float!
    z: Float!
    command: String!
    executedAt: String!
  }

  type ChatLog {
    id: Int!
    player: Player!
    server: Server!
    world: String!
    message: String!
    sentAt: String!
  }

  type ActivityItem {
    type: String!
    id: Int!
    player: Player!
    server: Server!
    world: String!
    content: String!
    timestamp: String!
  }

  type ConsoleLine {
    serverId: Int!
    line: String!
    timestamp: String!
  }

  type AuthPayload {
    token: String!
  }

  input UpdateServerConfigInput {
    worldName: String
    logCommands: Boolean
    logChat: Boolean
  }

  type Query {
    servers: [Server!]!
    server(id: Int!): Server
    players(search: String, limit: Int, offset: Int): [Player!]!
    player(uuid: ID!): Player
    commandLogs(playerUuid: ID, serverId: Int, limit: Int, offset: Int): [CommandLog!]!
    chatLogs(playerUuid: ID, serverId: Int, limit: Int, offset: Int): [ChatLog!]!
  }

  type Mutation {
    login(username: String!, password: String!): AuthPayload!
    updateServerConfig(serverId: Int!, input: UpdateServerConfigInput!): ServerConfig!
    rotateServerKey(serverId: Int!): String!
  }

  type Subscription {
    consoleLines(serverId: Int!): ConsoleLine!
    liveActivity: ActivityItem!
  }
`;
