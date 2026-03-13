import type { Node } from "@xyflow/react";
import { useFlowNodeContext } from "../context/FlowNodeContext";
import { useRefValue } from "./useRefValue";

export type GraphNode = {
  id: string;
  node: Node;
  children: GraphNode[];
  parent: GraphNode[];
};

export const useTreeLayout = () => {
  const { flowNodes } = useFlowNodeContext();
  const flowNodesRef = useRefValue(flowNodes);

  const getParentTreeLayout = (nodeId: string) => {
    const treeLayout = getTreeLayout();
    if (!treeLayout) return;

    const treeLayoutNode = treeLayout.getNode(nodeId);
    const treeLayoutRoot = treeLayout.getRoot();
    if (!treeLayoutNode || !treeLayoutRoot) return;

    const allowNodeMap = new Set<string>();

    const traverse = (node: GraphNode) => {
      allowNodeMap.add(node.id);
      for (const parent of node.parent) {
        traverse(parent);
      }
    };
    traverse(treeLayoutNode);

    const filterTree = (node: GraphNode): GraphNode | null => {
      if (!allowNodeMap.has(node.id)) return null;
      return {
        ...node,
        children: node.children
          .map((child) => filterTree(child))
          .filter((child): child is GraphNode => child !== null),
      };
    };

    const filteredTree = filterTree(treeLayoutRoot);
    if (!filteredTree) return;

    return filteredTree;
  };

  const getTreeLayout = () => {
    const { nodes, edges } = flowNodesRef.current;

    if (!nodes.length) return;
    const nodeMap = new Map<string, GraphNode>();

    // create graph nodes
    for (const node of nodes) {
      nodeMap.set(node.id, {
        id: node.id,
        node,
        children: [],
        parent: [],
      });
    }

    const hasParent = new Set<string>();

    // connect edges
    for (const edge of edges) {
      const parent = nodeMap.get(edge.source);
      const child = nodeMap.get(edge.target);

      if (parent && child) {
        parent.children.push(child);
        hasParent.add(child.id);
        child.parent.push(parent);
      }
    }

    return {
      getNode: (id: string) => nodeMap.get(id),
      getRoot: () => {
        const root = nodes.find((n) => !hasParent.has(n.id));
        if (!root) return;
        return nodeMap.get(root.id);
      },
    };
  };

  return {
    getTreeLayout,
    getParentTreeLayout,
  };
};
