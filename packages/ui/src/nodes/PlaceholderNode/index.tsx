import { useNodeId } from "@xyflow/react";
import { BaseNode } from "../../components/base-node";
import { NodeAppendix } from "../../components/node-appendix";
import { useAddPlaceholderNode } from "./useAddPlaceholderNode";

type PlaceholderNodeProps = {
  children?: React.ReactNode;
  label?: string;
  handleAdd?: () => void;
};

export const PlaceholderNode: React.FC<PlaceholderNodeProps> = ({
  children,
  label = "Add first node...",
  handleAdd,
}) => {
  return (
    <BaseNode
      onClick={() => handleAdd?.()}
      className="hover:cursor-pointer bg-card border-dashed border-gray-400 p-2 text-center text-gray-400 shadow-none "
    >
      <NodeAppendix
        position="bottom"
        className="left-1/2 -translate-x-1/2 p-0 border-0 text-xs w-40 bg-transparent "
      >
        {label}
      </NodeAppendix>
      {children}
    </BaseNode>
  );
};
PlaceholderNode.displayName = "PlaceholderNode";

type registerPlaceholderNodeProps = {
  icon?: React.ReactNode;
  label?: string;
};
export const registerPlaceholderNode = ({
  icon,
  label,
}: registerPlaceholderNodeProps) => {
  const RegisteredPlaceholderNode: React.FC = () => {
    const nodeId = useNodeId();
    const { handleAddNode } = useAddPlaceholderNode(nodeId);

    return (
      <PlaceholderNode label={label} handleAdd={handleAddNode}>
        {icon}
      </PlaceholderNode>
    );
  };
  RegisteredPlaceholderNode.displayName = "RegisteredPlaceholderNode";
  return RegisteredPlaceholderNode;
};
