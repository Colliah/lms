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
import { Field, FieldGroup, FieldSeparator } from "@/components/ui/field";
import { authClient } from "@/lib/auth-client";

const signUpSchema = z.object({
  name: z.string().min(1),
  email: z.email(),
  password: z.string().min(8),
});

type SignUpFormData = z.infer<typeof signUpSchema>;

export function SignUpForm() {
  const router = useRouter();

  const form = useAppForm({
    defaultValues: {
      name: "",
      email: "",
      password: "",
    } satisfies SignUpFormData as SignUpFormData,
    validators: {
      onSubmit: signUpSchema,
    },
    onSubmit: async ({ value }) => {
      await authClient.signUp.email(
        {
          ...value,
          callbackURL: "/",
        },
        {
          onSuccess: () => {
            toast.success("Sign up successfully!");
            form.reset();
            router.push("/");
          },
          onError: (ctx) => {
            form.reset();
            toast.error(ctx.error.message);
          },
        },
      );
    },
  });

  return (
    <Card className="max-w-md w-full">
      <CardHeader>
        <CardTitle>Sign Up</CardTitle>
        <CardDescription>Sign up your account</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          id="sign-up-form"
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
        >
          <FieldGroup>
            <form.AppField name="name">
              {(field) => (
                <field.TextField
                  label="Username"
                  placeholder="Enter your username"
                  prefix={<Icons.User />}
                />
              )}
            </form.AppField>

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

            <form.AppForm>
              <form.SubmitButton label="Sign Up" loadingText="Signing Up..." />
            </form.AppForm>

            <FieldSeparator>Or continue with</FieldSeparator>

            <Field>
              <Button variant="outline" type="button" className="w-full">
                <Icons.Github />
                Sign up with Github
              </Button>

              <Button variant="outline" type="button" className="w-full">
                <Icons.Google />
                Sign up with Google
              </Button>

              <div className="w-full mx-auto text-muted-foreground text-sm text-center">
                Already have an account?{" "}
                <Link
                  href="/auth/sign-in"
                  className="hover:underline hover:text-foreground"
                >
                  Sign in
                </Link>
              </div>
            </Field>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
