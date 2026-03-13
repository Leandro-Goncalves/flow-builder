import { dropTargetForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import {
  Field,
  FieldError,
  FieldLabel,
} from "@react-flowkit/ui/components/field";
import { Input } from "@react-flowkit/ui/components/input";
import { useFieldContext } from "@react-flowkit/ui/context/createFormHookContexts";
import { useFakeCaret } from "@react-flowkit/ui/hooks/useFakeCaret";
import { cn } from "@react-flowkit/ui/lib/utils";
import { useEffect, useRef, useState } from "react";

type TextFieldProps = {
  label: string;
} & React.ComponentProps<typeof Input>;

export function TextField({ label, ...props }: TextFieldProps) {
  const [isDraggedOver, setIsDraggedOver] = useState(false);
  const field = useFieldContext<string>();
  const ref = useRef<HTMLInputElement>(null);
  const { updateCaret, hideCaret } = useFakeCaret(ref);

  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  useEffect(() => {
    const input = ref.current;
    if (!input) return;

    return dropTargetForElements({
      element: input,

      onDragEnter: () => {
        setIsDraggedOver(true);
      },

      onDrag({ location }) {
        const position = updateCaret(location.current.input.clientX);
        input.setSelectionRange(position, position);
      },

      onDrop({ source }) {
        hideCaret();
        setIsDraggedOver(false);

        const { path } = source.data as { path: string };

        const start = input.selectionStart ?? 0;
        const end = input.selectionEnd ?? 0;

        const text = `{{${path}}}`;

        const newValue =
          field.state.value.slice(0, start) +
          text +
          field.state.value.slice(end);

        field.handleChange(newValue);
      },

      onDragLeave() {
        hideCaret();
        setIsDraggedOver(false);
      },
    });
  }, [updateCaret, hideCaret, field]);

  return (
    <Field data-invalid={isInvalid}>
      <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
      <Input
        autoComplete="off"
        {...props}
        ref={ref}
        id={field.name}
        name={field.name}
        value={field.state.value}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.value)}
        aria-invalid={isInvalid}
        className={cn(
          props.className,
          isDraggedOver && "border-dashed border border-primary",
        )}
      />
      {isInvalid && <FieldError errors={field.state.meta.errors} />}
    </Field>
  );
}
