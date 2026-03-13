"use client";

import { FlowContainer } from "@react-flowkit/ui/components/flowContainer";
import { RunFlowNodeButton } from "@react-flowkit/ui/components/run-flow-node-button";
import { useFlowNodes } from "@react-flowkit/ui/hooks/useFlowNodes";
import { makeNode } from "@react-flowkit/ui/utils/makeNode";
import dynamic from "next/dynamic";
import { fieldComponents } from "./FieldComponents";
import { HTTPRequestNode } from "./nodes/HTTPRequestNode";
import { registerInitialNode } from "./nodes/InitialNode";
import { registerTestNode } from "./nodes/TestNode";
import { registerWaitNode } from "./nodes/WaitNode";

function PAGE() {
  const flowNodes = useFlowNodes({
    fieldComponents,
    flowNodes: [
      registerInitialNode,
      registerTestNode,
      registerWaitNode,
      HTTPRequestNode,
    ],
    initialNodes: [makeNode(registerInitialNode)],
  });

  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <FlowContainer flowNodes={flowNodes}>
        <RunFlowNodeButton className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10" />
      </FlowContainer>
    </div>
  );
}

export default dynamic(() => Promise.resolve(PAGE), {
  ssr: false,
});
