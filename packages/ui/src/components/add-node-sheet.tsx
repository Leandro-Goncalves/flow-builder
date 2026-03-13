import { useSubscribe } from "@workspace/pubsub/react";
import { type Node } from "@xyflow/react";
import { useRef, useState } from "react";
import { useFlowNodeContext } from "../context/FlowNodeContext";
import { flowPubSub } from "../pubsub/eventBus";
import { makeNode } from "../utils/makeNode";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "./sheet";

export const AddNodeSheet: React.FC = () => {
  const { flowNodes } = useFlowNodeContext();
  const callbackRef = useRef<(node: Node) => void>(undefined);
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState<{ x: number; y: number }>();

  useSubscribe(flowPubSub, "add-node-modal:open", ({ callback, position }) => {
    callbackRef.current = callback;
    setPosition(position);
    setIsOpen(true);
  });

  return (
    <Sheet open={isOpen} onOpenChange={(open) => setIsOpen(open)}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Add Node</SheetTitle>
          <SheetDescription>
            Select a node type to add to the flow.
          </SheetDescription>
        </SheetHeader>
        <div className="grid flex-1 auto-rows-min gap-6 px-4">
          {flowNodes.flowNodes
            .filter((node) => !node.info.hideFromAddNodeSheet)
            .map((node) => {
              const { info } = node;
              return (
                <div
                  key={info.title}
                  className="flex cursor-pointer items-center rounded-md border p-4 hover:bg-secondary"
                  onClick={() => {
                    const nodeToAdd = makeNode(
                      node,
                      position || { x: 0, y: 0 },
                    );
                    callbackRef.current?.(nodeToAdd);
                    setIsOpen(false);
                  }}
                >
                  {info.icon && (
                    <div className="mr-4 text-2xl">{info.icon}</div>
                  )}
                  <div>
                    <div className="font-medium">{info.title}</div>
                    {info.description && (
                      <div className="text-sm text-muted-foreground">
                        {info.description}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
        </div>
      </SheetContent>
    </Sheet>
  );
};
