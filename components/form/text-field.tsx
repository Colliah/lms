import type { ReactNode } from "react";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "../ui/input-group";
import { FormBase, type FormControlProps } from "./form-base";
import { useFieldContext } from "./hooks";

type TextFieldProps = FormControlProps & {
  prefix?: ReactNode;
  suffix?: ReactNode;
  suffixButton?: {
    icon: ReactNode;
    onClick: () => void;
  };
  placeholder?: string;
};

export function TextField(props: TextFieldProps) {
  const { prefix, suffix, suffixButton, placeholder, ...baseProps } = props;
  const field = useFieldContext<string>();
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  return (
    <FormBase {...baseProps}>
      <InputGroup>
        {prefix && <InputGroupAddon>{prefix}</InputGroupAddon>}

        <InputGroupInput
          id={field.name}
          name={field.name}
          value={field.state.value}
          onBlur={field.handleBlur}
          onChange={(e) => field.handleChange(e.target.value)}
          aria-invalid={isInvalid}
          autoComplete="on"
          placeholder={placeholder}
        />

        {suffix && <InputGroupAddon>{suffix}</InputGroupAddon>}

        {suffixButton && (
          <InputGroupAddon align="inline-end">
            <InputGroupButton onClick={suffixButton.onClick}>
              {suffixButton.icon}
            </InputGroupButton>
          </InputGroupAddon>
        )}
      </InputGroup>
    </FormBase>
  );
}
