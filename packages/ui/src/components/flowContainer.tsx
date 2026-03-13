"use client";
import {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  ReactFlow,
  ReactFlowProvider,
  type Connection,
  type Edge,
  type EdgeChange,
  type Node,
  type NodeChange,
  type OnConnectEnd,
  type ReactFlowInstance,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useCallback, useRef } from "react";
import { FlowNodeContextProvider } from "../context/FlowNodeContext";
import type { useFlowNodes } from "../hooks/useFlowNodes";
import { useAddDefaultNode } from "../nodes/DefaultNode/useAddDefaultNode";
// import "../styles/globals.css";
import { AddNodeSheet } from "./add-node-sheet";
import { EditNodeDialog } from "./edit-node-dialog";
import { Toaster } from "./sonner";

type NodeChanges = NodeChange<Node>[];
type EdgeChanges = EdgeChange<Edge>[];
type FlowNodesReturn = ReturnType<typeof useFlowNodes>;

const makeNodeTypes = (flowNodes: FlowNodesReturn) => {
  return flowNodes.flowNodes.reduce((acc, { type, node }) => {
    return {
      ...acc,
      [type]: node,
    };
  }, {});
};

export const FlowContainerContent: React.FC<{
  children?: React.ReactNode;
  flowNodes: FlowNodesReturn;
}> = ({ children, flowNodes }) => {
  const { nodes, edges, setNodes, setEdges } = flowNodes;
  const reactFlowRef = useRef<ReactFlowInstance>(null);
  const { handleAddNode } = useAddDefaultNode();

  const onNodesChange = useCallback(
    (changes: NodeChanges) =>
      setNodes((nodesSnapshot) => {
        const newNodes = applyNodeChanges(changes, nodesSnapshot);
        if (newNodes.length === 0) {
          if (flowNodes.initialEdges) {
            setEdges(flowNodes.initialEdges);
          }
          return flowNodes.initialNodes || [];
        }
        return newNodes;
      }),
    [flowNodes.initialEdges, flowNodes.initialNodes, setEdges, setNodes],
  );
  const onEdgesChange = useCallback(
    (changes: EdgeChanges) =>
      setEdges((edgesSnapshot) => applyEdgeChanges(changes, edgesSnapshot)),
    [setEdges],
  );
  const onConnect = useCallback(
    (params: Connection) =>
      setEdges((edgesSnapshot) => addEdge(params, edgesSnapshot)),
    [setEdges],
  );

  const onConnectEnd = useCallback<OnConnectEnd>(
    (event, props) => {
      const screenToFlowPosition = reactFlowRef.current?.screenToFlowPosition;
      if (props.isValid || !screenToFlowPosition) return;
      const { clientX, clientY } =
        "changedTouches" in event
          ? (event.changedTouches[0] as Touch)
          : (event as MouseEvent);
      const { id } = props.fromNode ?? {};
      if (!props.pointer || !id) return;

      handleAddNode(
        id,
        screenToFlowPosition({
          x: clientX,
          y: clientY,
        }),
      );
    },
    [handleAddNode],
  );

  return (
    <>
      <ReactFlow
        proOptions={{ hideAttribution: true }}
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnectEnd={onConnectEnd}
        onConnect={onConnect}
        nodeTypes={makeNodeTypes(flowNodes)}
        fitView
        onInit={(flowInstance) => {
          reactFlowRef.current = flowInstance;
        }}
      >
        {children}
        <EditNodeDialog />
        <AddNodeSheet />
      </ReactFlow>
      <Toaster richColors />
    </>
  );
};

export const FlowContainer: React.FC<{
  children?: React.ReactNode;
  flowNodes: FlowNodesReturn;
}> = ({ children, flowNodes }) => {
  return (
    <FlowNodeContextProvider value={{ flowNodes }}>
      <ReactFlowProvider>
        <FlowContainerContent flowNodes={flowNodes}>
          {children}
        </FlowContainerContent>
      </ReactFlowProvider>
    </FlowNodeContextProvider>
  );
};
