import { Braces, ChevronRight } from "lucide-react";
import { useState } from "react";

import { Button } from "../button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../collapsible";
import { VarLabelItem } from "./var-label-item";

export const VarMenu: React.FC<{
  isDraggable?: boolean;
  data: {
    icon: React.FC<any>;
    value: any;
    type: string;
    varKey: string;
    path: string;
  };
  parentName?: string;
}> = ({ isDraggable, data, parentName }) => {
  const { icon: Icon = Braces, value, varKey, path } = data;
  const isDataObject =
    typeof value === "object" && value !== null && value !== undefined;
  const [isOpen, setIsOpen] = useState(true);

  const limitString = (str: string, maxLength: number) => {
    if (str.length <= maxLength) {
      return str;
    }
    return str.slice(0, maxLength) + "...";
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div>
        <div className="flex items-center gap-2 text-sm">
          {isDataObject ? (
            <CollapsibleTrigger asChild>
              <Button variant="link" size={"icon"} className="group">
                <ChevronRight className="w-4 h-4 transition-transform group-data-[state=open]:rotate-90" />
              </Button>
            </CollapsibleTrigger>
          ) : (
            <div className="w-8 shrink-0" />
          )}
          <VarLabelItem
            isDraggable={isDraggable}
            varKey={varKey}
            Icon={Icon}
            path={path}
            parentName={parentName}
          />
          {!isDataObject && (
            <p className="opacity-90 break-all">
              {limitString(value?.toString() || "", 300)}
            </p>
          )}
        </div>
        {isDataObject && (
          <CollapsibleContent>
            <div className="ml-8 mt-2 flex flex-col gap-2">
              {Object.entries(value as Object).map(([key, data1]) => {
                return (
                  <VarMenu
                    isDraggable={isDraggable}
                    key={key}
                    data={{ ...data1, varKey: key }}
                    parentName={parentName}
                  />
                );
              })}
            </div>
          </CollapsibleContent>
        )}
      </div>
    </Collapsible>
  );
};
