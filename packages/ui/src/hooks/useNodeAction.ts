import type { Node } from "@xyflow/react";
import { toast } from "sonner";
import { useFlowNodeContext } from "../context/FlowNodeContext";
import { NodeState } from "./useFlowNodes";
import { useParentVars } from "./useParentVars";
import { useRefValue } from "./useRefValue";
import { useTreeLayout, type GraphNode } from "./useTreeLayout";

export const useNodeAction = () => {
  const { flowNodes } = useFlowNodeContext();
  const flowNodesRef = useRefValue(flowNodes);
  const { getParentTreeLayout, getTreeLayout } = useTreeLayout();
  const { mapVars } = useParentVars();

  const setNodeData = (nodeId: string, data: any) => {
    flowNodes.setNodes((nodes) =>
      nodes.map((n) =>
        n.id === nodeId
          ? {
              ...n,
              data: {
                ...n.data,
                ...data,
              },
            }
          : n,
      ),
    );
  };

  const getParentNode = (nodeId: string) => {
    const edges = flowNodesRef.current.edges;
    const parentEdges = edges.filter((edge) => edge.target === nodeId);
    if (parentEdges.length === 0) return [];
    const parentNodes = parentEdges
      .map((edge) =>
        flowNodesRef.current.nodes.find((node) => node.id === edge.source),
      )
      .filter((node): node is Node => node !== undefined);
    return parentNodes;
  };

  const execNodeAction = async (node: Node) => {
    try {
      const currentFlowNodes = flowNodesRef.current;
      const flowNode = currentFlowNodes.flowNodes.find(
        (fn) => fn.id === node.data.flowNodeId,
      );
      if (!flowNode) return;

      setNodeData(node.id, {
        nodeState: NodeState.running,
      });

      const formValues = node.data.formValues || {};
      const formatFormValues = (values: Record<string, any>) => {
        const formattedValues: Record<string, any> = {};
        for (const [key, value] of Object.entries(
          values as Record<string, string>,
        )) {
          const varsInText = value.match(/{{(.*?)}}/g);
          if (varsInText) {
            let formattedValue = value;
            for (const varInText of varsInText) {
              const varName = varInText.slice(2, -2).trim();
              const varValue = mapVars.get(varName);
              if (varValue !== undefined) {
                formattedValue = formattedValue.replace(varInText, varValue);
              }
            }
            formattedValues[key] = formattedValue;
            continue;
          }
          formattedValues[key] = value;
        }
        return formattedValues;
      };

      const data = await flowNode.nodeAction?.(formatFormValues(formValues));
      const dataArray = Array.isArray(data) ? data : [data];
      const newNodeData = {
        nodeState: NodeState.success,
        actionResult: dataArray,
      };
      setNodeData(node.id, newNodeData);
    } catch (error) {
      setNodeData(node.id, {
        nodeState: NodeState.error,
      });
      throw error;
    }
  };

  const isNodeSuccess = (node: Node): boolean => {
    return node.data?.nodeState === NodeState.success;
  };

  const handleNodeAction = async (nodeId?: string) => {
    const { nodes } = flowNodesRef.current;
    const threeNodes = nodeId
      ? getParentTreeLayout(nodeId)
      : getTreeLayout()?.getRoot();
    if (!threeNodes) return;

    const isExecFullTree = !nodeId;

    if (isExecFullTree) {
      nodes.forEach((node) => {
        setNodeData(node.id, {
          nodeState: NodeState.idle,
        });
      });
    }

    let execCurrentNode = false;
    let isThereSomeNodeWithError = false;
    const execInArray = async (nodes: GraphNode[]) => {
      for (const graphNode of nodes) {
        try {
          if (!isNodeSuccess(graphNode.node) || isExecFullTree) {
            if (graphNode.id === nodeId) {
              execCurrentNode = true;
            }
            await execNodeAction(graphNode.node);
          }
          await execInArray(graphNode.children);
        } catch (error) {
          console.log(error);
          toast.error("An error occurred while executing the node action.");
          execCurrentNode = true;
          isThereSomeNodeWithError = true;
          break;
        }
      }
    };
    await execInArray([threeNodes]);
    if (!execCurrentNode) {
      const node = flowNodesRef.current.nodes.find((n) => n.id === nodeId);
      if (node) {
        await execNodeAction(node);
      }
    }

    if (!isThereSomeNodeWithError) {
      if (isExecFullTree) {
        toast.success("Flow executed successfully!");
      } else {
        toast.success("Node action executed successfully!");
      }
    }
  };

  return {
    handleNodeAction,
    getParentNode,
  };
};
