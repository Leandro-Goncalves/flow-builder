import { registerDefaultNode } from "@react-flowkit/ui/nodes/DefaultNode";
import { registerFlowNode } from "@react-flowkit/ui/utils/registerFlowNode";
import { Clock } from "lucide-react";
import { z } from "zod";
import { addFieldComponent } from "../FieldComponents";

export const registerWaitNode = registerFlowNode({
  node: registerDefaultNode({
    icon: <Clock />,
  }),
  dataFields: {
    time: addFieldComponent("TextField", {
      label: "Time to wait (ms)",
      initialValue: "5000",
      placeholder: "Add time in milliseconds",
    }),
  },
  validator: z.object({
    time: z.coerce.string(),
  }),
  type: "WaitNode",
  info: {
    title: "Wait Node",
    description: "This is a test node for development and testing purposes.",
    icon: <Clock />,
  },
  nodeAction: async (data) => {
    await new Promise((resolve) => setTimeout(resolve, Number(data.time)));
    return [];
  },
});
