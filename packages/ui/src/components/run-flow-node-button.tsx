import { FlaskConical } from "lucide-react";
import { useState } from "react";
import { useFlowNodeContext } from "../context/FlowNodeContext";
import { useNodeAction } from "../hooks/useNodeAction";
import { Button } from "./button";

type RunFlowNodeButtonProps = React.ComponentProps<typeof Button>;

export const RunFlowNodeButton: React.FC<RunFlowNodeButtonProps> = (props) => {
  const { handleNodeAction } = useNodeAction();
  const { flowNodes } = useFlowNodeContext();
  const [isRunning, setIsRunning] = useState(false);

  const isThereSomeActionToExecute = flowNodes.nodes.some((node) => {
    const flowNodeId = node.data.flowNodeId;
    if (typeof flowNodeId !== "string") return false;

    const flowNode = flowNodes.getFlowNode(flowNodeId);
    if (!flowNode) return false;

    return !!flowNode.nodeAction;
  });

  if (!isThereSomeActionToExecute) return null;

  const FlowChildren = () => {
    if (isRunning) {
      return (
        <>
          <FlaskConical /> Running...
        </>
      );
    }
    return (
      <>
        <FlaskConical /> Execute Flow
      </>
    );
  };

  return (
    <Button
      {...props}
      disabled={props.disabled !== undefined ? props.disabled : isRunning}
      onClick={
        props.onClick ||
        (async () => {
          try {
            setIsRunning(true);
            await handleNodeAction();
          } finally {
            setIsRunning(false);
          }
        })
      }
    >
      {props.children || <FlowChildren />}
    </Button>
  );
};
