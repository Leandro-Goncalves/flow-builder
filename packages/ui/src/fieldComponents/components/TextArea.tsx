import {
  Field,
  FieldError,
  FieldLabel,
} from "@react-flowkit/ui/components/field";
import { Textarea } from "@react-flowkit/ui/components/textarea";
import { useFieldContext } from "@react-flowkit/ui/context/createFormHookContexts";

type TextAreaProps = {
  label: string;
} & React.ComponentProps<typeof Textarea>;

export function TextArea({ label, ...props }: TextAreaProps) {
  const field = useFieldContext<string>();

  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  return (
    <Field data-invalid={isInvalid}>
      <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
      <Textarea
        autoComplete="off"
        {...props}
        id={field.name}
        name={field.name}
        value={field.state.value}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.value)}
        aria-invalid={isInvalid}
      />
      {isInvalid && <FieldError errors={field.state.meta.errors} />}
    </Field>
  );
}
