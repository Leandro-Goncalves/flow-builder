import { useEffect, useRef, useCallback } from "react";
import type { PubSub, EventMap } from "./index.js";

type EventHandler<Events extends EventMap, K extends keyof Events> = (
  payload: Events[K],
) => void;

export function useSubscribe<Events extends EventMap, K extends keyof Events>(
  pubSub: PubSub<Events>,
  event: K,
  handler: EventHandler<Events, K>,
  dependencies: React.DependencyList = [],
): void {
  const handlerRef = useRef(handler);

  useEffect(() => {
    handlerRef.current = handler;
  });

  const stableHandler = useCallback((payload: Events[K]) => {
    handlerRef.current(payload);
  }, []);

  useEffect(() => {
    const unsubscribe = pubSub.subscribe(event, stableHandler);
    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pubSub, event, stableHandler, ...dependencies]);
}
