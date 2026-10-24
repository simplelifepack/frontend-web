import { spacing } from "@/design-system";
import { Field, Heading, Text, Input, Button, Stack } from "@/design-system";

import BrandLogo from "@/components/BrandLogo";
import { useState, type FormEvent } from "react";
import { Navigate, useNavigate } from "react-router-dom";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { forgotPassword } from "@/store/slices/authSlice";

export default function ForgotPasswordPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { token, user } = useAppSelector((state) => state.auth);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (token && user) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSuccessMessage("");
    setIsSubmitting(true);

    try {
      const response = await dispatch(forgotPassword({ email })).unwrap();
      setSuccessMessage(response.message);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Unable to submit password reset.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Stack $gap="s16">
      <BrandLogo height={Number.parseInt(spacing.s40)} />
      <Heading level={2} size="md">
        Forgot password
      </Heading>
      <Text as="p" size="md" tone="muted">
        Enter your email and we will send reset instructions if the account
        exists.
      </Text>

      <Stack as="form" $gap="s16" onSubmit={handleSubmit}>
        <Field label="Email">
          <Input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            required
          />
        </Field>

        {error ? (
          <Text as="p" size="md" tone="danger" role="alert">
            {error}
          </Text>
        ) : null}
        {successMessage ? (
          <Text as="p" size="md" role="status" tone="success">
            {successMessage}
          </Text>
        ) : null}

        <Button
          size="lg"
          loading={isSubmitting}
          variant="primary"
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Submitting..." : "Submit"}
        </Button>
      </Stack>

      <Stack>
        <Button
          size="sm"
          variant="tertiary"
          type="button"
          onClick={() => navigate("/", { state: { authMode: "signin" } })}
        >
          Go to login
        </Button>
      </Stack>
    </Stack>
  );
}
