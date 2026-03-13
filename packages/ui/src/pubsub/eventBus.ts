import { createPubSub } from "@workspace/pubsub";
import type { Node } from "@xyflow/react";
import type { FlowNode } from "../hooks/useFlowNodes";

type PubSubEvents = {
  "add-node-modal:open": {
    position?: { x: number; y: number };
    callback?: (node: Node) => void;
  };
  "edit-node-modal:open": {
    node: Node;
    flowNode: FlowNode;
  };
};

export const flowPubSub = createPubSub<PubSubEvents>();
