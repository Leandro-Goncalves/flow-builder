"use client";

import { toZod } from "tozod";
import { v4 as uuid } from "uuid";
import type { DATA_FIELD_TYPE, FlowNode } from "../hooks/useFlowNodes";

type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

type returnData<DataField extends Record<string, DATA_FIELD_TYPE>> = {
  [Property in keyof DataField]: DataField[Property]["initialValue"];
};

type registerFlowNodeProps<DataField extends Record<string, DATA_FIELD_TYPE>> =
  {
    node: React.FC<{ type: string }>;
    type: string;
    dataFields: DataField;
    nodeAction?: (data: Prettify<returnData<DataField>>) => any;
    validator?: toZod<returnData<DataField>>;
  } & Omit<
    FlowNode<DataField>,
    "id" | "type" | "node" | "dataFields" | "nodeAction" | "validator"
  >;

export const registerFlowNode = <
  DataField extends Record<string, DATA_FIELD_TYPE>,
>({
  type,
  ...props
}: registerFlowNodeProps<DataField>) => {
  return {
    id: uuid(),
    type,
    ...props,
  };
};
