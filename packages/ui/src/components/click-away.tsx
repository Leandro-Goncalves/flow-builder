import { ReactNode, useEffect, useRef } from "react";

type ClickAwayProps = {
  children: ReactNode;
  onClickAway: (event: MouseEvent | TouchEvent | PointerEvent) => void;
};

export function ClickAway({ children, onClickAway }: ClickAwayProps) {
  const ref = useClickAway(onClickAway);
  return <div ref={ref}>{children}</div>;
}

export const useClickAway = (
  onClickAway: (event: MouseEvent | TouchEvent | PointerEvent) => void,
) => {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleEvent(event: MouseEvent | TouchEvent | PointerEvent) {
      const element = ref.current;

      if (!element || element.contains(event.target as Node)) return;

      onClickAway(event);
    }

    document.addEventListener("pointerdown", handleEvent);

    return () => {
      document.removeEventListener("pointerdown", handleEvent);
    };
  }, [onClickAway]);

  return ref;
};
