import { useEffect, useRef } from "react";

export function useFakeCaret(
  inputRef: React.RefObject<HTMLInputElement | null>,
) {
  const caretRef = useRef<HTMLDivElement | null>(null);
  const mirrorRef = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    const input = inputRef?.current;
    if (!input) return;

    const caret = document.createElement("div");
    Object.assign(caret.style, {
      position: "absolute",
      width: "1px",
      background: "white",
      height: "1.2em",
      pointerEvents: "none",
      zIndex: "9999",
      display: "none",
    });

    document.body.appendChild(caret);
    caretRef.current = caret;

    const mirror = document.createElement("span");

    const style = window.getComputedStyle(input);

    Object.assign(mirror.style, {
      position: "absolute",
      visibility: "hidden",
      whiteSpace: "pre",
      font: style.font,
      letterSpacing: style.letterSpacing,
    });

    document.body.appendChild(mirror);
    mirrorRef.current = mirror;

    return () => {
      caret.remove();
      mirror.remove();
    };
  }, [inputRef]);

  function updateCaret(mouseX: number): number {
    const input = inputRef?.current;
    const caret = caretRef.current;
    const mirror = mirrorRef.current;

    if (!input || !caret || !mirror) return 0;

    const rect = input.getBoundingClientRect();

    const value = input.value;

    let closestIndex = 0;
    let closestDistance = Infinity;

    for (let i = 0; i <= value.length; i++) {
      mirror.textContent = value.slice(0, i);
      const width = mirror.getBoundingClientRect().width;

      const x = rect.left + width;
      const distance = Math.abs(mouseX - x);

      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = i;
      }
    }

    mirror.textContent = value.slice(0, closestIndex);
    const width = mirror.getBoundingClientRect().width;

    caret.style.left = `${rect.left + width + 10}px`;
    caret.style.top = `${rect.top + 6}px`;
    caret.style.height = `${rect.height - 12}px`;
    caret.style.display = "block";

    return closestIndex;
  }

  function hideCaret() {
    if (caretRef.current) {
      caretRef.current.style.display = "none";
    }
  }

  return { updateCaret, hideCaret };
}
