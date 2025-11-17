import { Eye, EyeOff, Lock } from "lucide-react";
import { type ReactNode, useState } from "react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "../ui/input-group";
import { FormBase, type FormControlProps } from "./form-base";
import { useFieldContext } from "./hooks";

type PasswordFieldProps = FormControlProps & {
  prefix?: ReactNode;
  suffix?: ReactNode;
};

export function PasswordField(props: PasswordFieldProps) {
  const { prefix, suffix, ...baseProps } = props;
  const field = useFieldContext<string>();
  const [showPassword, setShowPassword] = useState(false);
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  return (
    <FormBase {...baseProps}>
      <InputGroup>
        <InputGroupAddon>{prefix || <Lock />}</InputGroupAddon>

        <InputGroupInput
          id={field.name}
          name={field.name}
          value={field.state.value}
          onBlur={field.handleBlur}
          onChange={(e) => field.handleChange(e.target.value)}
          aria-invalid={isInvalid}
          autoComplete="off"
          placeholder="Enter your password"
          type={showPassword ? "text" : "password"}
        />

        {suffix && <InputGroupAddon>{suffix}</InputGroupAddon>}

        <InputGroupAddon align="inline-end">
          <InputGroupButton onClick={() => setShowPassword(!showPassword)}>
            {showPassword ? <EyeOff /> : <Eye />}
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
    </FormBase>
  );
}
