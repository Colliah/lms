"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { z } from "zod";
import { useAppForm } from "@/components/form/hooks";
import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldSeparator,
} from "@/components/ui/field";
import { authClient } from "@/lib/auth-client";

const signInSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
});

type SignInFormData = z.infer<typeof signInSchema>;

export function SignInForm() {
  const router = useRouter();
  const form = useAppForm({
    defaultValues: {
      email: "",
      password: "",
    } satisfies SignInFormData as SignInFormData,
    validators: {
      onSubmit: signInSchema,
    },
    onSubmit: async ({ value }) => {
      await authClient.signIn.email(
        {
          ...value,
        },
        {
          onSuccess: () => {
            toast.success("Sign in successfully!");
            router.push("/");
            form.reset();
          },
          onError: (ctx) => {
            toast.error(ctx.error.message);
            form.reset();
          },
        },
      );
    },
  });

  return (
    <Card className="w-full sm:max-w-md">
      <CardHeader>
        <CardTitle>Sign In</CardTitle>
        <CardDescription>Sign in to your account</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          id="sign-in-form"
          onSubmit={async (e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
        >
          <FieldGroup>
            <form.AppField name="email">
              {(field) => (
                <field.TextField
                  label="Email"
                  placeholder="Enter your mail"
                  prefix={<Icons.Mail />}
                />
              )}
            </form.AppField>

            <form.AppField name="password">
              {(field) => (
                <field.PasswordField label="Password" prefix={<Icons.Lock />} />
              )}
            </form.AppField>

            <Field orientation="horizontal">
              <form.AppForm>
                <form.SubmitButton
                  label="Sign In"
                  loadingText="Signing In..."
                />
              </form.AppForm>
            </Field>

            <FieldSeparator>Or continue with</FieldSeparator>

            <Field>
              <Button variant="outline" type="button" className="w-full">
                <Icons.Github />
                Sign in with Github
              </Button>

              <Button variant="outline" type="button" className="w-full">
                <Icons.Google />
                Sign in with Google
              </Button>

              <FieldDescription className="text-center">
                Don&apos;t have an account?{" "}
                <Link
                  href="/auth/sign-up"
                  className="hover:underline hover:text-foreground"
                >
                  Sign up
                </Link>
              </FieldDescription>
            </Field>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
