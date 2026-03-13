import type { VarItem } from "@workspace/ui/hooks/useParentVars";
import { ChevronRight } from "lucide-react";
import { useState } from "react";
import { Button } from "../button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../collapsible";
import { Separator } from "../separator";
import { VarMenu } from "./var-menu";

export const ParentVarMenu: React.FC<{
  data: VarItem;
}> = ({ data }) => {
  const { icon: Icon, name, vars } = data;
  const [isOpen, setIsOpen] = useState(true);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div>
        <div className="flex items-center gap-2 text-sm">
          <CollapsibleTrigger asChild>
            <Button variant="link" size={"icon"} className="group">
              <ChevronRight className="w-4 h-4 transition-transform group-data-[state=open]:rotate-90" />
            </Button>
          </CollapsibleTrigger>
          <div className="flex items-center gap-2 border p-1 rounded-md">
            {Icon}
            <Separator orientation="vertical" className="h-4 w-px" />
            <p className="text-sm font-medium">{name}</p>
          </div>
        </div>
        <CollapsibleContent>
          <div className="ml-8 mt-2 flex flex-col gap-2">
            {Object.entries(vars as Object).map(([key, data1]) => {
              return (
                <VarMenu
                  key={key}
                  data={{ ...data1, varKey: key }}
                  isDraggable
                  parentName={name}
                />
              );
            })}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
};
