import { createFormHook, createFormHookContexts } from "@tanstack/react-form";
import { SubmitButton } from "../submit-button";
import { PasswordField } from "./password-field";
import { TextField } from "./text-field";
import { TextareaField } from "./textarea-field";

const { fieldContext, formContext, useFieldContext, useFormContext } =
  createFormHookContexts();

const { useAppForm } = createFormHook({
  fieldComponents: {
    TextField,
    PasswordField,
    TextareaField,
  },
  formComponents: {
    SubmitButton,
  },
  fieldContext,
  formContext,
});

export { useAppForm, useFieldContext, useFormContext };
