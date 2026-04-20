"use client";

import { ApolloClient, ApolloProvider, HttpLink, InMemoryCache, split } from "@apollo/client";
import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
import { getMainDefinition } from "@apollo/client/utilities";
import { createClient } from "graphql-ws";
import { useMemo } from "react";

export function ApolloWrapper({ children }: { children: React.ReactNode }) {
  const client = useMemo(() => {
    const httpLink = new HttpLink({
      uri: `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"}/graphql`,
    });

    const wsLink = new GraphQLWsLink(
      createClient({
        url: process.env.NEXT_PUBLIC_WS_URL ?? "ws://localhost:4000/graphql-ws",
        retryAttempts: Infinity,
        shouldRetry: () => true,
      })
    );

    const link = split(
      ({ query }) => {
        const def = getMainDefinition(query);
        return def.kind === "OperationDefinition" && def.operation === "subscription";
      },
      wsLink,
      httpLink
    );

    return new ApolloClient({ link, cache: new InMemoryCache() });
  }, []);

  return <ApolloProvider client={client}>{children}</ApolloProvider>;
}
