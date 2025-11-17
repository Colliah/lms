"use client";

import { useFormContext } from "./form/hooks";
import { Button } from "./ui/button";
import { Spinner } from "./ui/spinner";

type SubmitButtonProps = {
  loadingText?: string;
  label?: string;
  onlyLoadingIcon?: boolean;
};

export function SubmitButton({
  loadingText = "Submitting...",
  label = "Submit",
  onlyLoadingIcon = false,
}: SubmitButtonProps) {
  const form = useFormContext();

  return (
    <form.Subscribe
      selector={(state) => ({
        isSubmitting: state.isSubmitting,
        canSubmit: state.canSubmit,
      })}
    >
      {({ isSubmitting, canSubmit }) => (
        <Button
          type="submit"
          className="w-full"
          disabled={!canSubmit || isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Spinner />
              {!onlyLoadingIcon && <span>{loadingText}</span>}
            </>
          ) : (
            label
          )}
        </Button>
      )}
    </form.Subscribe>
  );
}
