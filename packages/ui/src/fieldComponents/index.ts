import { TextArea } from "./components/TextArea";
import { TextField } from "./components/TextField";

export const createFieldComponents = <
  FIELD_COMPONENTS extends Record<string, React.ComponentType<any>> = Record<
    string,
    React.ComponentType<any>
  >,
>(
  fieldComponents: FIELD_COMPONENTS,
) => {
  const addFieldComponent = <
    NAME extends keyof FIELD_COMPONENTS,
    InitialValue = any,
  >(
    name: NAME,
    {
      initialValue,
      ...props
    }: React.ComponentProps<FIELD_COMPONENTS[NAME]> & {
      initialValue: InitialValue;
    },
  ) => {
    return {
      type: name,
      initialValue: initialValue as InitialValue,
      props,
    };
  };

  return { addFieldComponent, fieldComponents };
};

export const basicFieldComponents = () => ({
  TextField,
  TextArea,
});
