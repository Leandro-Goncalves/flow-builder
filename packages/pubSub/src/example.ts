/* eslint-disable @typescript-eslint/no-unused-vars */
import { createPubSub } from "./index.js";

// Define your events with their payload types
type UserEvents = {
  "user:login": { userId: string; username: string };
  "user:logout": { userId: string };
  "user:profile:updated": { userId: string; changes: Record<string, unknown> };
  "app:notification": { message: string; type: "info" | "warning" | "error" };
  "modal:open": { modalId: string; data?: unknown };
  "modal:close": { modalId: string };
  "ui:theme:change": { theme: "light" | "dark" | "system" };
};

// Create a typed PubSub instance
const eventBus = createPubSub<UserEvents>();

// Example: Publishing events
// TypeScript enforces correct payload types at compile time
function loginUser(userId: string, username: string) {
  // This is type-safe - payload must match UserEvents["user:login"]
  eventBus.publish("user:login", { userId, username });
}

function showNotification(message: string) {
  eventBus.publish("app:notification", { message, type: "info" });
}

// Example: Subscribing to events
// TypeScript infers the correct payload type automatically
function setupListeners() {
  // payload is automatically typed as { userId: string; username: string }
  const unsubscribeLogin = eventBus.subscribe("user:login", (payload) => {
    console.log(`User ${payload.username} logged in with ID ${payload.userId}`);
  });

  // payload is automatically typed as { userId: string }
  const unsubscribeLogout = eventBus.subscribe("user:logout", (payload) => {
    console.log(`User ${payload.userId} logged out`);
  });

  // payload is automatically typed as { message: string; type: ... }
  const unsubscribeNotification = eventBus.subscribe(
    "app:notification",
    (payload) => {
      console.log(`[${payload.type}] ${payload.message}`);
    },
  );

  // Later: unsubscribe when no longer needed
  // unsubscribeLogin();
  // unsubscribeLogout();
  // unsubscribeNotification();
}

// React usage example with useSubscribe hook
function ReactComponentExample() {
  // import { useSubscribe } from "@react-flowkit/pubsub/react";
  // useSubscribe(eventBus, "user:login", (payload) => {
  //   console.log(`Welcome ${payload.username}!`);
  // });
  //
  // useSubscribe(eventBus, "app:notification", (payload) => {
  //   toast(payload.message, { type: payload.type });
  // });
  return null;
}

// Advanced: Supporting void events (events with no payload)
type VoidEvents = {
  "app:ready": void;
  "ui:refresh": void;
  "timer:tick": void;
};

const voidEventBus = createPubSub<VoidEvents>();

// For void events, you can pass undefined or use an empty object
voidEventBus.publish("app:ready", undefined);
voidEventBus.subscribe("app:ready", () => {
  console.log("App is ready!");
});

export { eventBus, loginUser, setupListeners, showNotification };
export type { UserEvents, VoidEvents };
