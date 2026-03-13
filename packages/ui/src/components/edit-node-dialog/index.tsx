import { createFormHook } from "@tanstack/react-form";
import { useSubscribe } from "@workspace/pubsub/react";
import { useParentVars } from "@workspace/ui/hooks/useParentVars";
import { useNodesData, type Node } from "@xyflow/react";
import { TestTube, XIcon } from "lucide-react";
import { Dialog as DialogPrimitive } from "radix-ui";
import { useState } from "react";
import {
  fieldContext,
  formContext,
} from "../../context/createFormHookContexts";
import { useFlowNodeContext } from "../../context/FlowNodeContext";
import type { FlowNode, NodeState } from "../../hooks/useFlowNodes";
import { useNodeAction } from "../../hooks/useNodeAction";
import { useNodeResult } from "../../hooks/useNodeResult";
import { flowPubSub } from "../../pubsub/eventBus";
import { Button } from "../button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../dialog";
import { useEditLabelDialog } from "../edit-label-dialog";
import { ScrollArea } from "../scroll-area";
import { Separator } from "../separator";
import { Spinner } from "../spinner";
import { ParentVarMenu } from "./parent-var-menu";
import { VarMenu } from "./var-menu";

export const EditNodeDialog: React.FC = () => {
  const { flowNodes } = useFlowNodeContext();
  const { useAppForm } = createFormHook({
    fieldComponents: flowNodes.fieldComponents,
    formComponents: {},
    fieldContext,
    formContext,
  });

  const [isOpen, setIsOpen] = useState(false);
  const [flowNode, setFlowNode] = useState<FlowNode>();
  const [EditLabelDialog, editLabelController] = useEditLabelDialog();
  const [initialValues, setInitialValues] = useState<Record<string, any>>({});
  const [nodeId, setNodeId] = useState<string | null>(null);
  const node = useNodesData(nodeId || "") as
    | Node<{
        label: string;
        actionResult?: any;
        nodeState?: keyof typeof NodeState;
      }>
    | undefined;
  const nodeDataState = node?.data.nodeState;

  useSubscribe(flowPubSub, "edit-node-modal:open", (props) => {
    setIsOpen(true);
    setFlowNode(props.flowNode);
    setNodeId(props.node.id);
    const node = props.node as Node<{ formValues: Record<string, any> }>;
    setInitialValues(node.data.formValues || {});
    Object.entries(node.data.formValues || {}).forEach(([key, value]) => {
      form.setFieldValue(key, value);
    });
  });

  const { handleNodeAction } = useNodeAction();
  const { actionVars } = useNodeResult(node?.data.actionResult);
  const { parentVars } = useParentVars(nodeId || "");

  const fields = flowNode?.dataFields || {};

  const form = useAppForm({
    defaultValues: Object.entries(fields).reduce(
      (acc, [key, config]) => {
        acc[key] = initialValues[key] ?? config.initialValue;
        return acc;
      },
      {} as Record<string, any>,
    ),
    validators: flowNode?.validator
      ? {
          onChange: flowNode.validator,
        }
      : undefined,
    onSubmit: async ({ value }) => {
      flowNodes.setNodes((nodes) => {
        const nodeIndex = nodes.findIndex((n) => n.id === nodeId);
        if (nodeIndex === -1) return nodes;

        const node = nodes[nodeIndex];
        if (!node) return nodes;

        const updatedNode: Node = {
          ...node,
          data: {
            ...node.data,
            formValues: value,
          },
        };
        const newNodes = [...nodes];
        newNodes[nodeIndex] = updatedNode;
        return newNodes;
      });
    },
  });

  const SelectField: React.FC<{ type: string; field: any } & any> = ({
    type,
    field,
    ...rest
  }) => {
    const Component = field[type];
    return <Component label={field.label} {...rest} />;
  };

  const handleEditLabel = async () => {
    if (!node) return;
    const newLabel = await editLabelController.open(node.data.label);

    flowNodes.setNodes((nodes) => {
      const nodeIndex = nodes.findIndex((n) => n.id === nodeId);
      if (nodeIndex === -1) return nodes;

      const node = nodes[nodeIndex];
      if (!node) return nodes;

      const updatedNode: Node = {
        ...node,
        data: {
          ...node.data,
          label: newLabel,
        },
      };
      const newNodes = [...nodes];
      newNodes[nodeIndex] = updatedNode;
      return newNodes;
    });
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open);
        if (!open) {
          form.handleSubmit().then(() => {
            form.reset();
          });
        }
      }}
    >
      <DialogContent
        showCloseButton={false}
        className="max-w-[calc(100%-4rem)]! h-[calc(100%-4rem)]! p-0 overflow-hidden flex flex-col"
      >
        <DialogPrimitive.Close data-slot="dialog-close" asChild>
          <Button
            variant="ghost"
            className="absolute top-3.5 right-3.5"
            size="icon-sm"
          >
            <XIcon />
            <span className="sr-only">Close</span>
          </Button>
        </DialogPrimitive.Close>
        <DialogHeader className="p-4 border-b">
          <DialogTitle>
            <div className="flex gap-2 items-center">
              {flowNode?.info.icon}
              <p onClick={handleEditLabel} className="cursor-pointer">
                {node?.data.label}
              </p>
            </div>
          </DialogTitle>
          <DialogDescription className="sr-only">
            Here you can edit the node&apos;s properties and fields.
          </DialogDescription>
        </DialogHeader>
        <form
          className="h-full overflow-auto"
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
        >
          <div className="flex h-full w-full">
            <div className="w-full flex flex-col gap-2 px-4 pt-2 pb-4 pl-0 items-start overflow-auto">
              <ScrollArea className="h-full min-h-0 w-full">
                {[...parentVars.values()].map((data) => (
                  <ParentVarMenu key={data.id} data={data} />
                ))}
              </ScrollArea>
            </div>
            <Separator orientation="vertical" className="h-full w-px mx-4" />
            <div className="w-full">
              <div className="flex flex-col gap-4 mt-2">
                <Button
                  type="button"
                  className="ml-auto"
                  disabled={nodeDataState === "running"}
                  onClick={async () => {
                    if (!nodeId) return;
                    await form.handleSubmit();
                    if (!form.state.isValid) return;
                    await handleNodeAction(nodeId);
                  }}
                >
                  {nodeDataState === "running" ? (
                    <Spinner
                      data-icon="inline-start"
                      className="animate-none"
                    />
                  ) : (
                    <TestTube />
                  )}
                  Execute step
                </Button>
                <Separator className="h-px" />
                {Object.entries(fields).map(([key, config]) => {
                  return (
                    <form.AppField
                      key={key}
                      name={key}
                      children={(field) => {
                        return (
                          <SelectField
                            type={config.type}
                            field={field}
                            {...config.props}
                          />
                        );
                      }}
                    />
                  );
                })}
              </div>
            </div>
            <Separator orientation="vertical" className="h-full w-px mx-4" />
            <div className="w-full flex flex-col gap-2 px-4 pt-2 pb-4 pl-0 items-start overflow-auto">
              <ScrollArea className="h-full min-h-0 w-full">
                {Object.entries(actionVars).map(([key, data]) => (
                  <VarMenu
                    key={key}
                    data={{
                      ...data,
                      varKey: key,
                    }}
                  />
                ))}
              </ScrollArea>
            </div>
          </div>
        </form>
      </DialogContent>
      <EditLabelDialog />
    </Dialog>
  );
};
