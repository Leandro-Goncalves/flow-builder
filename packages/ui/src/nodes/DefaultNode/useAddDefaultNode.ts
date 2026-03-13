import { useFlowNodeContext } from "@workspace/ui/context/FlowNodeContext";
import { flowPubSub } from "@workspace/ui/pubsub/eventBus";
import { useReactFlow, type XYPosition } from "@xyflow/react";

export const useAddDefaultNode = (parentNodeId?: string | null) => {
  const { setNodes, getNode, setEdges } = useReactFlow();
  const { flowNodes } = useFlowNodeContext();

  const handleAddNode = (
    childNodeId?: string,
    childPosition?: XYPosition | ((position: XYPosition) => XYPosition),
  ) => {
    const nodeId = parentNodeId || childNodeId;
    if (!nodeId) return;
    const { position } = getNode(nodeId) || {};
    if (!position) return;

    const selectedPosition = childPosition
      ? typeof childPosition === "function"
        ? childPosition(position)
        : childPosition
      : position;

    if (!selectedPosition) return;
    flowPubSub.publish("add-node-modal:open", {
      position: selectedPosition,
      callback: (node) => {
        setNodes((nodesSnapshot) => nodesSnapshot.concat(node));
        setEdges((edgesSnapshot) =>
          edgesSnapshot.concat({
            id: `${nodeId}-${node.id}`,
            source: nodeId,
            target: node.id,
          }),
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

  const handleEditNode = (childNodeId?: string) => {
    const nodeId = parentNodeId || childNodeId;
    if (!nodeId) return;
    const node = getNode(nodeId);
    if (!node) return;

    const flowNode = flowNodes.flowNodes.find(
      (fn) => fn.id === node.data?.flowNodeId,
    );
    if (!flowNode) return;
    flowPubSub.publish("edit-node-modal:open", {
      node,
      flowNode,
    });
  };

  return { handleAddNode, handleEditNode };
};
