import type { Node } from "@xyflow/react";
import { v4 as uuid } from "uuid";
import { NodeState, type FlowNode } from "../hooks/useFlowNodes";

export const makeNode = (
  flowNode: FlowNode,
  position?: { x: number; y: number },
  extra?: Partial<Node>,
): Node => {
  return {
    id: uuid(),
    type: flowNode.type,
    position: position || { x: 0, y: 0 },
    data: {
      nodeState: NodeState.idle,
      flowNodeId: flowNode.id,
      label: flowNode.info.title,
    },
    ...extra,
  };
};
