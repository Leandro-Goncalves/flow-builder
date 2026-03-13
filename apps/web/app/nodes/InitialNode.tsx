import { registerPlaceholderNode } from "@react-flowkit/ui/nodes/PlaceholderNode";
import { registerFlowNode } from "@react-flowkit/ui/utils/registerFlowNode";
import { Plus } from "lucide-react";

export const registerInitialNode = registerFlowNode({
  node: registerPlaceholderNode({
    icon: <Plus />,
  }),
  dataFields: {},
  type: "InitialNode",
  info: {
    title: "Initial Node",
    description:
      "This is the initial node of the flow. It is used to start the flow.",
    icon: <Plus />,
    hideFromAddNodeSheet: true,
  },
});
