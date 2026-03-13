import type { Edge, Node } from "@xyflow/react";
import { useEffect, useState, type ComponentType } from "react";
import type { toZod } from "tozod";

export const NodeState = {
  idle: "idle",
  running: "running",
  error: "error",
  success: "success",
} as const;

export type NodeStateType = (typeof NodeState)[keyof typeof NodeState];

type returnData<DataField extends Record<string, DATA_FIELD_TYPE>> = {
  [Property in keyof DataField]: DataField[Property]["initialValue"];
};

export type DATA_FIELD_TYPE<
  TYPE extends string = string,
  INITIAL_VALUE extends any = any,
> = {
  type: TYPE;
  initialValue: INITIAL_VALUE;
  props: any;
};

export type FlowNode<
  DataField extends Record<string, DATA_FIELD_TYPE> = Record<
    string,
    DATA_FIELD_TYPE
  >,
> = {
  id: string;
  type: string;
  node: React.FC<{ type: string; nodeState: keyof typeof NodeState }>;
  dataFields: DataField;
  info: {
    title: string;
    description?: string;
    icon?: React.ReactNode;
    hideFromAddNodeSheet?: boolean;
  };
  validator?: toZod<returnData<DataField>>;
  nodeAction?: (data: any) => any;
};

export type useFlowNodesProps<
  DataField extends Record<string, DATA_FIELD_TYPE>,
> = {
  fieldComponents: Record<string, ComponentType<any>>;
  flowNodes: FlowNode<DataField>[];
  initialNodes?: Node[];
  initialEdges?: Edge[];
};

export const useFlowNodes = <DataField extends Record<string, DATA_FIELD_TYPE>>(
  props: useFlowNodesProps<DataField>,
) => {
  const [nodes, setNodes] = useState<Node[]>(props.initialNodes || []);
  const [edges, setEdges] = useState<Edge[]>(props.initialEdges || []);

  const getFlowNode = (id: string) => {
    const flowNode = props.flowNodes.find((fn) => fn.id === id);
    if (!flowNode) return;
    return flowNode;
  };

  useEffect(() => {
    (window as any).getData = () => {
      return JSON.stringify({
        nodes,
        edges,
      });
    };

    (window as any).setData = (data: string) => {
      const parsedData = JSON.parse(data);
      setNodes(parsedData.nodes);
      setEdges(parsedData.edges);
    };
  }, [edges, nodes]);

  return {
    ...props,
    nodes,
    edges,
    setNodes,
    setEdges,
    getFlowNode,
  };
};
