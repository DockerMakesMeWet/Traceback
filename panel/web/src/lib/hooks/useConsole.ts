"use client";

import { gql, useSubscription } from "@apollo/client";
import { useEffect, useRef, useState } from "react";

const CONSOLE_SUBSCRIPTION = gql`
  subscription ConsoleLines($serverId: Int!) {
    consoleLines(serverId: $serverId) {
      serverId
      line
      timestamp
    }
  }
`;

interface ConsoleLine {
  serverId: number;
  line: string;
  timestamp: string;
}

export function useConsole(serverId: number, maxLines = 500) {
  const [lines, setLines] = useState<ConsoleLine[]>([]);
  const bufferRef = useRef<ConsoleLine[]>([]);

  const { data, error } = useSubscription<{ consoleLines: ConsoleLine }>(
    CONSOLE_SUBSCRIPTION,
    { variables: { serverId } }
  );

  useEffect(() => {
    if (!data?.consoleLines) return;
    bufferRef.current = [...bufferRef.current, data.consoleLines].slice(-maxLines);
    setLines([...bufferRef.current]);
  }, [data, maxLines]);

  return { lines, error };
}
