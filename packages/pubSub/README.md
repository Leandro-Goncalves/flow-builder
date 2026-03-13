# @workspace/pubsub

A lightweight, dependency-free Pub/Sub implementation with extreme TypeScript type safety for UI-level cross-component communication.

## Installation

This package is part of the workspace. Use it as:

```typescript
import { createPubSub } from "@workspace/pubsub";
import { useSubscribe } from "@workspace/pubsub/react";
```

## Features

- **Extreme Type Safety**: Event names and payloads are strictly typed
- **No `any` types**: Full type inference with generics
- **Multiple subscribers**: Support for multiple handlers per event
- **Unsubscribing**: Clean up subscriptions when needed
- **Works everywhere**: Works in React and non-React environments

## Usage

### 1. Define Your Events

```typescript
type AppEvents = {
  "user:login": { userId: string; username: string };
  "user:logout": { userId: string };
  "app:notification": { message: string; type: "info" | "warning" | "error" };
  "modal:open": { modalId: string };
  "modal:close": { modalId: string };
};
```

### 2. Create a PubSub Instance

```typescript
import { createPubSub } from "@workspace/pubsub";

const eventBus = createPubSub<AppEvents>();
```

### 3. Subscribe to Events

```typescript
// TypeScript infers payload type: { userId: string; username: string }
const unsubscribe = eventBus.subscribe("user:login", (payload) => {
  console.log(`User ${payload.username} logged in`);
});

// Later: clean up
unsubscribe();
```

### 4. Publish Events

```typescript
// TypeScript enforces correct payload type
eventBus.publish("user:login", { userId: "123", username: "john" });

// This would be a compile-time error:
// eventBus.publish("user:login", { userId: "123" }); // ❌ Missing username
// eventBus.publish("unknown:event", {}); // ❌ Unknown event name
```

### 5. React Hook Usage

```typescript
import { useSubscribe } from "@workspace/pubsub/react";

function MyComponent() {
  useSubscribe(eventBus, "user:login", (payload) => {
    console.log(`Welcome ${payload.username}!`);
  });

  useSubscribe(eventBus, "app:notification", (payload) => {
    toast(payload.message, { type: payload.type });
  }, [toast]); // Dependencies array supported

  return <div>...</div>;
}
```

### 6. Void Events (No Payload)

```typescript
type VoidEvents = {
  "app:ready": void;
  "timer:tick": void;
};

const voidBus = createPubSub<VoidEvents>();

voidBus.publish("app:ready", undefined);
voidBus.subscribe("app:ready", () => {
  console.log("App is ready!");
});
```

## API Reference

### `createPubSub<Events>()`

Creates a new PubSub instance with typed events.

### `pubSub.subscribe(event, handler)`

Subscribes to an event. Returns an unsubscribe function.

### `pubSub.publish(event, payload)`

Publishes an event with the specified payload.

### `pubSub.unsubscribeAll(event?)`

Unsubscribes all handlers for a specific event, or all events if no event is specified.

### `pubSub.getSubscriberCount(event)`

Returns the number of subscribers for a specific event.

### `useSubscribe(pubSub, event, handler, dependencies?)`

React hook for subscribing to events. Automatically unsubscribes on unmount.

## Type Safety Explained

The type safety is achieved through:

1. **Generic EventMap**: Events are defined as a mapped type where keys are event names and values are payload types.

2. **Strict Event Name Typing**: The `event` parameter uses `keyof Events` ensuring only defined events can be used.

3. **Payload Type Inference**: The `handler` parameter's type is derived from the event using `Events[K]`, ensuring payload type safety.

4. **Compile-Time Enforcement**: TypeScript validates all calls at compile time - you cannot:
   - Publish to an unknown event
   - Publish with an incorrect payload type
   - Subscribe with an incompatible handler

## Example Application

See `src/example.ts` for a complete example with multiple event types and usage patterns.
