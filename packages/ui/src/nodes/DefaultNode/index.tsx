import { BaseHandle } from "@react-flowkit/ui/components/base-handle";
import { Button } from "@react-flowkit/ui/components/button";
import { ButtonHandle } from "@react-flowkit/ui/components/button-handle";
import { useClickAway } from "@react-flowkit/ui/components/click-away";
import {
  NodeStatusIndicator,
  type NodeStatus,
} from "@react-flowkit/ui/components/node-status-indicator";
import {
  NodeState,
  type NodeStateType,
} from "@react-flowkit/ui/hooks/useFlowNodes";
import { useNodeAction } from "@react-flowkit/ui/hooks/useNodeAction";
import { cn } from "@react-flowkit/ui/lib/utils";
import {
  Position,
  useConnection,
  useEdges,
  useNodeId,
  useNodesData,
  useReactFlow,
  type ConnectionState,
  type Node,
} from "@xyflow/react";
import { Edit, Play, Plus, Trash } from "lucide-react";
import { useState } from "react";
import { BaseNode } from "../../components/base-node";
import { NodeAppendix } from "../../components/node-appendix";
import { useAddDefaultNode } from "./useAddDefaultNode";

type DefaultNodeProps = {
  children?: React.ReactNode;
  label?: string;
  handleClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
  handleAdd?: () => void;
};

export const DefaultNode: React.FC<DefaultNodeProps> = ({
  children,
  label,
  handleClick,
  handleAdd,
}) => {
  const [selected, setSelected] = useState(false);

  const ref = useClickAway(() => setSelected(false));
  const nodeId = useNodeId() ?? "";
  const edges = useEdges();
  const { deleteElements } = useReactFlow();
  const { handleNodeAction } = useNodeAction();
  const node = useNodesData(nodeId || "") as
    | Node<{
        nodeState?: keyof typeof NodeState;
      }>
    | undefined;

  const isConnected = edges.filter((edge) => edge.source === nodeId).length > 0;

  const selector = (connection: ConnectionState) => {
    return connection.inProgress && connection.fromNode.id === nodeId;
  };
  const connectionInProgress = useConnection(selector);

  const options = [
    {
      icon: <Play className="w-2! h-2!" />,
      onClick: async () => {
        await handleNodeAction(nodeId);
      },
      disable: node?.data.nodeState === "running",
    },
    {
      icon: <Edit className="w-2! h-2!" />,
      onClick: (e: React.MouseEvent<any>) => {
        handleClick?.({ ...e, detail: 2 } as React.MouseEvent<HTMLDivElement>);
      },
    },
    {
      icon: <Trash className="w-2! h-2!" />,
      onClick: () => {
        deleteElements({ nodes: [{ id: nodeId }] });
      },
    },
  ];

  return (
    <BaseNode
      nodeRef={ref}
      id={nodeId}
      onClick={(e) => {
        handleClick?.(e);
        setSelected(true);
      }}
      className={cn(
        "hover:cursor-pointer bg-card p-2 text-center shadow-none group hover:ring-0",
        selected && "outline-1 outline-foreground outline-offset-2",
      )}
    >
      <NodeAppendix
        position="top"
        className="left-1/2 top-1 -translate-x-1/2 p-0 border-0 bg-transparent opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <div className="flex mb-1">
          {options.map((option, index) => (
            <Button
              key={index}
              size="icon"
              variant="ghost"
              className="p-1 w-auto h-auto rounded-sm!"
              disabled={option.disable}
              onClick={(e) => {
                e.stopPropagation();
                option.onClick(e);
              }}
            >
              {option.icon}
            </Button>
          ))}
        </div>
      </NodeAppendix>
      {label && (
        <NodeAppendix
          position="bottom"
          className="left-1/2 -translate-x-1/2 p-0 border-0 text-xs w-40 bg-transparent pointer-events-none"
        >
          {label}
        </NodeAppendix>
      )}
      <BaseHandle type="target" position={Position.Left} />
      {children}
      <ButtonHandle
        type="source"
        position={Position.Right}
        showButton={!connectionInProgress && !isConnected}
      >
        <Button
          onClick={(e) => {
            e.stopPropagation();
            handleAdd?.();
          }}
          size="sm"
          variant="secondary"
          className="rounded-full"
        >
          <Plus size={10} />
        </Button>
      </ButtonHandle>
    </BaseNode>
  );
};
DefaultNode.displayName = "DefaultNode";

const nodeStateToStatus: Record<NodeStateType, NodeStatus> = {
  [NodeState.idle]: "initial",
  [NodeState.running]: "loading",
  [NodeState.error]: "error",
  [NodeState.success]: "success",
};

type registerDefaultNodeProps = {
  icon: React.ReactNode;
};
export const registerDefaultNode = ({ icon }: registerDefaultNodeProps) => {
  const RegisteredDefaultNode = () => {
    const nodeId = useNodeId();
    const { data } = useNodesData(nodeId ?? "") ?? ({ data: {} } as any);
    const { handleAddNode, handleEditNode } = useAddDefaultNode(nodeId);

    return (
      <NodeStatusIndicator
        status={nodeStateToStatus[data.nodeState as NodeStateType] || "initial"}
        variant="border"
      >
        <DefaultNode
          label={data.label}
          handleAdd={() =>
            handleAddNode(undefined, (p) => ({ x: p.x + 100, y: p.y }))
          }
          handleClick={(e) => {
            if (e.detail === 2) {
              handleEditNode();
            }
          }}
        >
          {icon}
        </DefaultNode>
      </NodeStatusIndicator>
    );
  };
  RegisteredDefaultNode.displayName = "RegisteredDefaultNode";
  return RegisteredDefaultNode;
};
