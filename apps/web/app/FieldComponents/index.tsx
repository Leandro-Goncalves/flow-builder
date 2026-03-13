import {
  basicFieldComponents,
  createFieldComponents,
} from "@react-flowkit/ui/fieldComponents";

const AnotherField: React.FC<{ text: string }> = ({ text }) => (
  <div>Another Field: {text}</div>
);

export const { addFieldComponent, fieldComponents } = createFieldComponents({
  ...basicFieldComponents(),
  AnotherField,
});
