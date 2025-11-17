import { Textarea } from "../ui/textarea";
import { FormBase, type FormControlProps } from "./form-base";
import { useFieldContext } from "./hooks";

type TextareaFieldProps = FormControlProps & {
  placeholder?: string;
};

export function TextareaField(props: TextareaFieldProps) {
  const { placeholder, ...baseProps } = props;
  const field = useFieldContext<string>();
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  return (
    <FormBase {...baseProps}>
      <Textarea
        id={field.name}
        name={field.name}
        value={field.state.value}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.value)}
        aria-invalid={isInvalid}
        autoComplete="off"
        placeholder={placeholder}
      />
    </FormBase>
  );
}
