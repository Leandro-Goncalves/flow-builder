import { registerDefaultNode } from "@react-flowkit/ui/nodes/DefaultNode";
import { registerFlowNode } from "@react-flowkit/ui/utils/registerFlowNode";
import axios from "axios";
import { GitPullRequest } from "lucide-react";
import { z } from "zod";
import { addFieldComponent } from "../FieldComponents";

export const HTTPRequestNode = registerFlowNode({
  node: registerDefaultNode({
    icon: <GitPullRequest />,
  }),
  dataFields: {
    url: addFieldComponent("TextField", {
      label: "URL",
      initialValue: "",
      placeholder: "Add URL",
    }),
  },
  validator: z.object({
    url: z.string().url(),
  }),
  type: "HTTPRequestNode",
  info: {
    title: "HTTP Request Node",
    description: "This is a node that make a HTTP request",
    icon: <GitPullRequest />,
  },
  nodeAction: async ({ url }) => {
    const { data } = await axios.get(url);

    const isJson = typeof data === "object";
    if (!isJson) {
      return {
        data,
      };
    }

    return data;
  },
});
