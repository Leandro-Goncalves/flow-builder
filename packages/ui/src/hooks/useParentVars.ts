import type { Node } from "@xyflow/react";
import type { ReactNode } from "react";
import { useFlowNodeContext } from "../context/FlowNodeContext";
import { useNodeResult } from "./useNodeResult";
import { useTreeLayout, type GraphNode } from "./useTreeLayout";

export type VarItem = {
  id: string;
  name: string;
  icon: ReactNode;
  vars: Record<string, any>;
};

export const useParentVars = (nodeId?: string) => {
  const varsToReturn = new Map<string, VarItem>();
  const mapVars: Map<string, any> = new Map();

  const { getParentTreeLayout, getTreeLayout } = useTreeLayout();
  const { flowNodes } = useFlowNodeContext();
  const { convertToVars } = useNodeResult();
  const treeLayout = nodeId
    ? getParentTreeLayout(nodeId)
    : getTreeLayout()?.getRoot();
  if (!treeLayout) return { parentVars: varsToReturn, mapVars };

  const execInArray = (nodes: GraphNode[]) => {
    for (const graphNode of nodes) {
      const node = graphNode.node as Node<{
        label: string;
        actionResult?: any;
        flowNodeId?: string;
      }>;
      if (node.id === nodeId) continue;

      const actionResult = node.data.actionResult;
      if (!actionResult) continue;

      const flowNode = flowNodes.getFlowNode(node.data.flowNodeId || "");
      if (!flowNode) continue;

      const nodeResult = convertToVars(actionResult as any);

      varsToReturn.set(node.id, {
        id: node.id,
        name: node.data.label || "",
        icon: flowNode.info.icon || "",
        vars: nodeResult,
      });
    }
  };
  execInArray([treeLayout]);

  for (const [, varItem] of varsToReturn) {
    for (const [varKey, varValue] of Object.entries(varItem.vars)) {
      mapVars.set(`${varItem.name}.${varKey}`, varValue.value);
    }
  }

  return {
    parentVars: varsToReturn,
    mapVars,
  };
};
