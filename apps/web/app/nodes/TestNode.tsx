import { registerDefaultNode } from "@react-flowkit/ui/nodes/DefaultNode";
import { registerFlowNode } from "@react-flowkit/ui/utils/registerFlowNode";
import { TestTube } from "lucide-react";
import { z } from "zod";
import { addFieldComponent } from "../FieldComponents";

export const registerTestNode = registerFlowNode({
  node: registerDefaultNode({
    icon: <TestTube />,
  }),
  dataFields: {
    name: addFieldComponent("TextField", {
      label: "Name",
      initialValue: "",
      placeholder: "Add your name",
    }),
    description: addFieldComponent("TextArea", {
      initialValue: "",
      label: "Description",
      placeholder: "Add a description",
      rows: 4,
      className: "resize-none field-sizing-fixed",
    }),
  },
  validator: z.object({
    name: z.string().min(1, "Name is required"),
    description: z.string().min(1, "Description is required"),
  }),
  type: "TestNode",
  info: {
    title: "Test Node",
    description: "This is a test node for development and testing purposes.",
    icon: <TestTube />,
  },
  nodeAction: (data) => {
    return {
      name: data.name,
      description: data.description,
      message: `Hello, ${data.name}! This is a test node action. Your description is: ${data.description}`,
    };
  },
});
