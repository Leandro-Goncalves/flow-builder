import React, { createContext, useContext } from "react";
import type { useFlowNodes } from "../hooks/useFlowNodes";

interface FlowNodeContextState {
  flowNodes: ReturnType<typeof useFlowNodes>;
}

const FlowNodeContext = createContext<FlowNodeContextState | null>(null);

export const FlowNodeContextProvider: React.FC<{
  children: React.ReactNode;
  value: FlowNodeContextState;
}> = ({ children, value }) => {
  return (
    <FlowNodeContext.Provider value={value}>
      {children}
    </FlowNodeContext.Provider>
  );
};

export function useFlowNodeContext() {
  const context = useContext(FlowNodeContext);

  if (!context) {
    throw new Error(
      "useFlowNodeContext must be used within a FlowNodeContextProvider",
    );
  }

  return context;
}
