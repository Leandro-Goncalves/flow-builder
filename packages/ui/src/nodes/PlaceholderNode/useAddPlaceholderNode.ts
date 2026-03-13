import { useFlowNodeContext } from "@workspace/ui/context/FlowNodeContext";
import { flowPubSub } from "@workspace/ui/pubsub/eventBus";
import { useReactFlow } from "@xyflow/react";

export const useAddPlaceholderNode = (nodeId: string | null) => {
  const { setNodes, getNode } = useReactFlow();
  const { flowNodes } = useFlowNodeContext();

  const handleAddNode = (childPosition?: { x: number; y: number }) => {
    if (!nodeId) return;
    const { position } = getNode(nodeId) || {};
    const selectedPosition = childPosition || position;
    if (!selectedPosition) return;

    flowPubSub.publish("add-node-modal:open", {
      position: selectedPosition,
      callback: (node) => {
        setNodes((nodesSnapshot) =>
          nodesSnapshot.filter((n) => n.id !== nodeId).concat(node),
        );

        const flowNode = flowNodes.flowNodes.find(
          (fn) => fn.id === node.data?.flowNodeId,
        );
        if (!flowNode) return;
        flowPubSub.publish("edit-node-modal:open", {
          node,
          flowNode,
        });
      },
    });
  };

  return { handleAddNode };
};
