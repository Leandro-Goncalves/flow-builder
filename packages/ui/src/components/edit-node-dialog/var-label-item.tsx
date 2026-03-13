import { draggable } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { setCustomNativeDragPreview } from "@atlaskit/pragmatic-drag-and-drop/element/set-custom-native-drag-preview";
import { cn } from "@workspace/ui/lib/utils";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import invariant from "tiny-invariant";
import { Separator } from "../separator";

export const VarLabelItem: React.FC<{
  isDraggable?: boolean;
  varKey: string;
  Icon: React.FC<any>;
  path: string;
  parentName?: string;
}> = ({ isDraggable, varKey, Icon, path, parentName }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isPreview, setIsPreview] = useState<HTMLElement>();

  useEffect(() => {
    const el = ref.current;
    invariant(el);

    if (!isDraggable) return;

    return draggable({
      element: el,
      getInitialDataForExternal: () => ({
        path: parentName ? `${parentName}.${path}` : path,
      }),
      getInitialData: () => ({
        path: parentName ? `${parentName}.${path}` : path,
      }),
      onGenerateDragPreview({ nativeSetDragImage }) {
        setCustomNativeDragPreview({
          render({ container }) {
            setIsPreview(container);
            return () => setIsPreview(undefined);
          },
          nativeSetDragImage,
        });
      },
    });
  }, [isDraggable, path, parentName]);

  return (
    <>
      <div
        className={cn("flex items-center gap-2 border p-1 rounded-md", {
          "cursor-grab": isDraggable,
        })}
        ref={ref}
      >
        <Icon className="w-4 h-4" />
        <Separator orientation="vertical" className="h-4 w-px" />
        <p className="text-sm font-medium">{varKey}</p>
      </div>
      {isPreview !== undefined &&
        createPortal(
          <div
            className={cn(
              "flex items-center gap-1 border border-primary p-1 rounded-md",
            )}
            ref={ref}
          >
            <p className="text-sm font-medium">{varKey}</p>
          </div>,
          isPreview,
        )}
    </>
  );
};
