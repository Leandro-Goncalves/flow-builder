export type EventMap = Record<string, unknown>;

type EventHandler<T> = (payload: T) => void;

type Subscription<T> = {
  handler: EventHandler<T>;
};

type Payload<T> = void extends T ? [payload?: T] : [payload: T];

export class PubSub<Events extends EventMap> {
  private subscribers: {
    [K in keyof Events]?: Set<Subscription<Events[K]>>;
  } = {};

  subscribe<K extends keyof Events>(
    event: K,
    handler: EventHandler<Events[K]>,
  ): () => void {
    if (!this.subscribers[event]) {
      this.subscribers[event] = new Set();
    }

    const subscription: Subscription<Events[K]> = { handler };
    this.subscribers[event]!.add(subscription);

    return () => {
      this.subscribers[event]!.delete(subscription);
    };
  }

  publish<K extends keyof Events>(event: K, ...args: Payload<Events[K]>): void {
    const eventSubscribers = this.subscribers[event];
    if (!eventSubscribers) return;

    eventSubscribers.forEach(({ handler }) => {
      handler(args[0] as Events[K]);
    });
  }

  unsubscribeAll<K extends keyof Events>(event?: K): void {
    if (event === undefined) {
      this.subscribers = {};
    } else {
      delete this.subscribers[event];
    }
  }

  getSubscriberCount<K extends keyof Events>(event: K): number {
    return this.subscribers[event]?.size ?? 0;
  }
}

export function createPubSub<Events extends EventMap>(): PubSub<Events> {
  return new PubSub<Events>();
}
